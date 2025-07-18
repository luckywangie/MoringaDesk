import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

function QuestionAnswer() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [usernames, setUsernames] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [followups, setFollowups] = useState({}); // { answerId: [followups] }
  const [showFollowupForm, setShowFollowupForm] = useState(null); // answerId or 'question'
  const [followupContent, setFollowupContent] = useState('');
  const [editingFollowupId, setEditingFollowupId] = useState(null);
  const [editFollowupContent, setEditFollowupContent] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.sub;
  const isAdmin = decodedToken?.role === 'admin';

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
    fetchVotes();
    fetchUserVotes();
  }, [id]);

  const fetchUser = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`, { headers });
      return res.data.username;
    } catch (err) {
      console.error('Failed to fetch user', err);
      return `User ${userId}`;
    }
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/questions/${id}`);
      const questionData = res.data;
      const username = await fetchUser(questionData.user_id);
      setUsernames(prev => ({ ...prev, [questionData.user_id]: username }));
      setQuestion({ ...questionData, username });
    } catch (err) {
      toast.error('Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/questions/${id}/answers/is_approved`);
      const answersData = res.data;
      
      const usernamePromises = answersData.map(answer => 
        fetchUser(answer.user_id).then(username => ({
          userId: answer.user_id,
          username
        }))
      );
      
      const usernameResults = await Promise.all(usernamePromises);
      const newUsernames = { ...usernames };
      usernameResults.forEach(({ userId, username }) => {
        newUsernames[userId] = username;
      });
      setUsernames(newUsernames);

      const answersWithUsernames = answersData.map(answer => ({
        ...answer,
        username: newUsernames[answer.user_id] || `User ${answer.user_id}`
      }));
      setAnswers(answersWithUsernames);

      // Fetch followups for each answer
      answersData.forEach(answer => {
        fetchFollowups(answer.id);
      });
    } catch (err) {
      toast.error('Failed to fetch answers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/votes', { headers });
      const voteMap = {};
      res.data.forEach((vote) => {
        if (!voteMap[vote.answer_id]) voteMap[vote.answer_id] = { up: 0, down: 0 };
        voteMap[vote.answer_id][vote.vote_type]++;
      });
      setVotes(voteMap);
    } catch (err) {
      console.error('Failed to fetch votes', err);
    }
  };

  const fetchUserVotes = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get('http://localhost:5000/api/votes', { headers });
      const userVoteMap = {};
      res.data.forEach(vote => {
        if (vote.user_id === currentUserId) {
          userVoteMap[vote.answer_id] = vote.vote_type;
        }
      });
      setUserVotes(userVoteMap);
    } catch (err) {
      console.error('Failed to fetch user votes', err);
    }
  };

  const fetchFollowups = async (answerId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/followups`);
      const allFollowups = res.data;
      const relevantFollowups = allFollowups.filter(f => 
        (f.answer_id === answerId) || (f.question_id === parseInt(id) && !f.answer_id)
      );
      
      // Add usernames to followups
      const followupsWithUsernames = await Promise.all(
        relevantFollowups.map(async f => {
          const username = await fetchUser(f.user_id);
          return { ...f, username };
        })
      );
      
      setFollowups(prev => ({
        ...prev,
        [answerId]: followupsWithUsernames.filter(f => f.answer_id === answerId),
        question: followupsWithUsernames.filter(f => !f.answer_id)
      }));
    } catch (err) {
      console.error('Failed to fetch followups', err);
    }
  };

  const handleVote = async (answerId, voteType) => {
    if (!token) {
      toast.error('You need to login to vote');
      return;
    }

    try {
      // Check if user already voted on this answer
      if (userVotes[answerId]) {
        const voteId = await getVoteId(answerId);
        if (voteId) {
          // Update existing vote
          if (userVotes[answerId] === voteType) {
            // User clicked same vote type - remove vote
            await axios.delete(`http://localhost:5000/api/votes/${voteId}`, { headers });
            toast.success('Vote removed');
          } else {
            // Change vote type
            await axios.put(
              `http://localhost:5000/api/votes/${voteId}`,
              { vote_type: voteType },
              { headers }
            );
            toast.success(`Vote changed to ${voteType}`);
          }
        }
      } else {
        // Create new vote
        await axios.post(
          'http://localhost:5000/api/votes',
          { answer_id: answerId, vote_type: voteType },
          { headers }
        );
        toast.success(`Voted ${voteType}`);
      }
      
      // Refresh votes data
      fetchVotes();
      fetchUserVotes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process vote');
    }
  };

  const getVoteId = async (answerId) => {
    try {
      const res = await axios.get('http://localhost:5000/api/votes', { headers });
      const vote = res.data.find(v => v.answer_id === answerId && v.user_id === currentUserId);
      return vote?.id;
    } catch (err) {
      console.error('Failed to get vote ID', err);
      return null;
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      toast.error('Answer content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/questions/${id}/answers`,
        { content: answerContent },
        { headers }
      );
      toast.success('Answer submitted successfully! It will be visible after admin approval.');
      setAnswerContent('');
      fetchAnswers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (answer) => {
    setEditingAnswerId(answer.id);
    setEditContent(answer.content);
  };

  const cancelEditing = () => {
    setEditingAnswerId(null);
    setEditContent('');
  };

  const handleUpdateAnswer = async () => {
    if (!editContent.trim()) {
      toast.error('Answer content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/answers/${editingAnswerId}`,
        { content: editContent },
        { headers }
      );
      toast.success('Answer updated successfully! It will be visible after admin approval.');
      setEditingAnswerId(null);
      setEditContent('');
      fetchAnswers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update answer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!token) {
      toast.error('You need to be logged in to delete answers');
      return;
    }

    if (window.confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      try {
        setLoading(true);
        await axios.delete(
          `http://localhost:5000/api/answers/${answerId}`,
          { headers }
        );
        toast.success('Answer deleted successfully!');
        fetchAnswers();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete answer');
      } finally {
        setLoading(false);
      }
    }
  };

  // Followup handlers
  const toggleFollowupForm = (answerId) => {
    setShowFollowupForm(showFollowupForm === answerId ? null : answerId);
    setFollowupContent('');
  };

  const handleSubmitFollowup = async (answerId = null) => {
    if (!followupContent.trim()) {
      toast.error('Follow-up content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/followups',
        {
          question_id: id,
          answer_id: answerId,
          content: followupContent
        },
        { headers }
      );
      toast.success('Follow-up submitted successfully!');
      setFollowupContent('');
      setShowFollowupForm(null);
      fetchFollowups(answerId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit follow-up');
    } finally {
      setLoading(false);
    }
  };

  const startEditingFollowup = (followup) => {
    setEditingFollowupId(followup.id);
    setEditFollowupContent(followup.content);
  };

  const cancelEditingFollowup = () => {
    setEditingFollowupId(null);
    setEditFollowupContent('');
  };

  const handleUpdateFollowup = async () => {
    if (!editFollowupContent.trim()) {
      toast.error('Follow-up content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/followups/${editingFollowupId}`,
        { content: editFollowupContent },
        { headers }
      );
      toast.success('Follow-up updated successfully!');
      setEditingFollowupId(null);
      setEditFollowupContent('');
      
      // Find which answer this followup belongs to to refresh
      const followup = Object.values(followups)
        .flat()
        .find(f => f.id === editingFollowupId);
      
      if (followup) {
        fetchFollowups(followup.answer_id);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update follow-up');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    if (!token) {
      toast.error('You need to be logged in to delete follow-ups');
      return;
    }

    if (window.confirm('Are you sure you want to delete this follow-up? This action cannot be undone.')) {
      try {
        setLoading(true);
        await axios.delete(
          `http://localhost:5000/api/followups/${followupId}`,
          { headers }
        );
        toast.success('Follow-up deleted successfully!');
        
        // Find which answer this followup belongs to to refresh
        const followup = Object.values(followups)
          .flat()
          .find(f => f.id === followupId);
        
        if (followup) {
          fetchFollowups(followup.answer_id);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete follow-up');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !answers.length) {
    return <div className="p-4 max-w-3xl mx-auto">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {question ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{question.title}</h2>
          <p className="text-gray-700 mb-4 whitespace-pre-line">{question.description || question.content}</p>
          <div className="text-sm text-gray-500">
            Posted by <span className="font-medium">{question.username}</span> on{' '}
            {new Date(question.created_at).toLocaleString()}
          </div>

          {/* Question followups */}
          <div className="mt-4">
            {token && (
              <button 
                onClick={() => toggleFollowupForm('question')}
                className="text-green-600 hover:text-green-800 text-sm font-medium mb-2"
              >
                {showFollowupForm === 'question' ? 'Cancel' : 'Add follow-up to question'}
              </button>
            )}

            {showFollowupForm === 'question' && (
              <div className="mb-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Write your follow-up here..."
                  value={followupContent}
                  onChange={(e) => setFollowupContent(e.target.value)}
                />
                <button
                  onClick={() => handleSubmitFollowup()}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Follow-up'}
                </button>
              </div>
            )}

            {followups.question?.map(followup => (
              <div key={followup.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                {editingFollowupId === followup.id ? (
                  <>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      value={editFollowupContent}
                      onChange={(e) => setEditFollowupContent(e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateFollowup}
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingFollowup}
                        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 whitespace-pre-line">{followup.content}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Follow-up by <span className="font-medium">{followup.username}</span>{' '}
                      on {new Date(followup.created_at).toLocaleString()}
                    </div>
                    {followup.user_id === currentUserId && (
                      <div className="mt-1 flex space-x-2">
                        <button
                          onClick={() => startEditingFollowup(followup)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFollowup(followup.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Question not found</p>
      )}

      {/* Answer Form */}
      {token && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Post Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="5"
              placeholder="Write your answer here..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Approved Answers</h3>
        {answers.length === 0 ? (
          <p className="text-gray-500">No approved answers yet.</p>
        ) : (
          answers.map((answer) => {
            const voteCount = (votes[answer.id]?.up || 0) - (votes[answer.id]?.down || 0);
            const isCurrentUserAnswer = answer.user_id === currentUserId;
            const userVote = userVotes[answer.id];
            
            return (
              <div key={answer.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex">
                  <div className="flex-grow">
                    {editingAnswerId === answer.id ? (
                      <>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows="5"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateAnswer}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          Answered by{' '}
                          <span className="font-medium">{answer.username}</span>{' '}
                          on {new Date(answer.created_at).toLocaleString()}
                        </div>
                        {isCurrentUserAnswer && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => startEditing(answer)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {editingAnswerId !== answer.id && (
                    <div className="flex flex-col items-center ml-4 w-12">
                      <button
                        onClick={() => handleVote(answer.id, 'up')}
                        className={`${userVote === 'up' ? 'text-green-600' : 'text-gray-500'} hover:text-green-600 transition-colors`}
                        aria-label="Upvote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="my-1 font-medium text-gray-700">{voteCount}</span>
                      <button
                        onClick={() => handleVote(answer.id, 'down')}
                        className={`${userVote === 'down' ? 'text-red-600' : 'text-gray-500'} hover:text-red-600 transition-colors`}
                        aria-label="Downvote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Answer followups */}
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  {token && (
                    <button 
                      onClick={() => toggleFollowupForm(answer.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium mb-2"
                    >
                      {showFollowupForm === answer.id ? 'Cancel' : 'Add follow-up to this answer'}
                    </button>
                  )}

                  {showFollowupForm === answer.id && (
                    <div className="mb-4">
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows="3"
                        placeholder="Write your follow-up here..."
                        value={followupContent}
                        onChange={(e) => setFollowupContent(e.target.value)}
                      />
                      <button
                        onClick={() => handleSubmitFollowup(answer.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Follow-up'}
                      </button>
                    </div>
                  )}

                  {followups[answer.id]?.map(followup => (
                    <div key={followup.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                      {editingFollowupId === followup.id ? (
                        <>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="3"
                            value={editFollowupContent}
                            onChange={(e) => setEditFollowupContent(e.target.value)}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateFollowup}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingFollowup}
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-700 whitespace-pre-line">{followup.content}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Follow-up by <span className="font-medium">{followup.username}</span>{' '}
                            on {new Date(followup.created_at).toLocaleString()}
                          </div>
                          {followup.user_id === currentUserId && (
                            <div className="mt-1 flex space-x-2">
                              <button
                                onClick={() => startEditingFollowup(followup)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFollowup(followup.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default QuestionAnswer;