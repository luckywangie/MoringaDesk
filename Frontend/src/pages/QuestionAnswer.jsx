import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [followups, setFollowups] = useState({});
  const [showFollowupForm, setShowFollowupForm] = useState(null);
  const [followupContent, setFollowupContent] = useState('');
  const [editingFollowupId, setEditingFollowupId] = useState(null);
  const [editFollowupContent, setEditFollowupContent] = useState('');
  const [showReportForm, setShowReportForm] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportCategories, setReportCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [questionVotes, setQuestionVotes] = useState({ up: 0, down: 0 });
  const [userQuestionVote, setUserQuestionVote] = useState(null);

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
    fetchReportCategories();
    fetchRelatedQuestions();
    fetchQuestionVotes();
  }, [id]);

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

  const fetchQuestionVotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/questions/${id}/votes`, { headers });
      setQuestionVotes({
        up: res.data.upvotes || 0,
        down: res.data.downvotes || 0
      });

      if (token) {
        const userVoteRes = await axios.get(`http://localhost:5000/api/questions/${id}/uservote`, { headers });
        setUserQuestionVote(userVoteRes.data.vote_type || null);
      }
    } catch (err) {
      console.error('Failed to fetch question votes', err);
    }
  };

  const fetchFollowups = async (answerId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/followups`);
      const allFollowups = res.data;
      const relevantFollowups = allFollowups.filter(f => 
        (f.answer_id === answerId) || (f.question_id === parseInt(id) && !f.answer_id)
      );
      
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

  const fetchReportCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setReportCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch report categories', err);
      toast.error('Failed to load report categories');
    }
  };

  const fetchRelatedQuestions = async () => {
    setLoadingRelated(true);
    try {
      const res = await axios.get('http://localhost:5000/api/relatedquestions', { headers });
      const allRelations = res.data;
      
      // Get all unique question IDs from the relations
      const questionIds = new Set();
      allRelations.forEach(relation => {
        if (relation.question_id !== parseInt(id)) questionIds.add(relation.question_id);
        if (relation.related_question_id !== parseInt(id)) questionIds.add(relation.related_question_id);
      });

      // Fetch details for each related question
      const questionsData = await Promise.all(
        Array.from(questionIds).map(qId => 
          axios.get(`http://localhost:5000/api/questions/${qId}`)
            .then(res => res.data)
            .catch(() => null)
        )
      );

      setRelatedQuestions(questionsData.filter(q => q !== null));
    } catch (err) {
      console.error('Failed to fetch related questions', err);
      toast.error('Failed to load related questions');
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchUser = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`, { headers });
      return res.data.username;
    } catch (err) {
      console.error('Failed to fetch user', err);
      return `User ${userId}`;
    }
  };

  const handleQuestionVote = async (voteType) => {
    if (!token) {
      toast.error('You need to login to vote');
      return;
    }

    try {
      if (userQuestionVote === voteType) {
        // Remove vote
        await axios.delete(`http://localhost:5000/api/questions/${id}/vote`, { headers });
        setQuestionVotes(prev => ({
          up: voteType === 'up' ? prev.up - 1 : prev.up,
          down: voteType === 'down' ? prev.down - 1 : prev.down
        }));
        setUserQuestionVote(null);
        toast.success('Vote removed');
      } else if (userQuestionVote) {
        // Change vote
        await axios.put(
          `http://localhost:5000/api/questions/${id}/vote`,
          { vote_type: voteType },
          { headers }
        );
        setQuestionVotes(prev => ({
          up: voteType === 'up' ? prev.up + 1 : prev.up - 1,
          down: voteType === 'down' ? prev.down + 1 : prev.down - 1
        }));
        setUserQuestionVote(voteType);
        toast.success(`Vote changed to ${voteType}`);
      } else {
        // New vote
        await axios.post(
          `http://localhost:5000/api/questions/${id}/vote`,
          { vote_type: voteType },
          { headers }
        );
        setQuestionVotes(prev => ({
          up: voteType === 'up' ? prev.up + 1 : prev.up,
          down: voteType === 'down' ? prev.down + 1 : prev.down
        }));
        setUserQuestionVote(voteType);
        toast.success(`Voted ${voteType}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process vote');
    }
  };

  const toggleReportForm = (type, id = null) => {
    setShowReportForm(showReportForm === (id || type) ? null : (id || type));
    setReportReason('');
    if (reportCategories.length > 0) {
      setSelectedCategory(reportCategories[0].id);
    }
  };

  const handleSubmitReport = async (questionId = null, answerId = null) => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a report category');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/reports',
        {
          category_id: selectedCategory,
          question_id: questionId,
          answer_id: answerId,
          reason: reportReason
        },
        { headers }
      );
      toast.success('Report submitted successfully!');
      setShowReportForm(null);
      setReportReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    if (!token) {
      toast.error('You need to login to vote');
      return;
    }

    try {
      if (userVotes[answerId]) {
        const voteId = await getVoteId(answerId);
        if (voteId) {
          if (userVotes[answerId] === voteType) {
            await axios.delete(`http://localhost:5000/api/votes/${voteId}`, { headers });
            toast.success('Vote removed');
          } else {
            await axios.put(
              `http://localhost:5000/api/votes/${voteId}`,
              { vote_type: voteType },
              { headers }
            );
            toast.success(`Vote changed to ${voteType}`);
          }
        }
      } else {
        await axios.post(
          'http://localhost:5000/api/votes',
          { answer_id: answerId, vote_type: voteType },
          { headers }
        );
        toast.success(`Voted ${voteType}`);
      }
      
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
    if (!window.confirm('Are you sure you want to delete this answer?')) return;

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
  };

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
    if (!window.confirm('Are you sure you want to delete this follow-up?')) return;

    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/followups/${followupId}`,
        { headers }
      );
      toast.success('Follow-up deleted successfully!');
      
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
  };

  if (loading && !answers.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Card */}
          {question ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">
                      Asked by <span className="font-medium text-gray-700">{question.username}</span>
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(question.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{question.views} views</span>
                  </div>
                </div>
                {token && (
                  <button 
                    onClick={() => toggleReportForm('question')}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {showReportForm === 'question' ? 'Cancel' : 'Report'}
                  </button>
                )}
              </div>

              {showReportForm === 'question' && (
                <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-3">Report this question</h4>
                  <select
                    className="w-full p-2 border border-red-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-red-200 focus:border-red-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {reportCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                  <textarea
                    className="w-full p-2 border border-red-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-red-200 focus:border-red-500"
                    rows="3"
                    placeholder="Please explain the reason for reporting..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReportForm(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReport(question.id, null)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              )}

              <div className="prose max-w-none text-gray-700 mb-6">
                {question.description}
              </div>

              <div className="flex items-center gap-4 border-t pt-4">
                <div className="flex items-center gap-1">
                
                  <span className="text-gray-700 font-medium">
                    
                  </span>
                
                </div>
                <span className="text-sm text-gray-500">
                  {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </span>
              </div>

              {/* Question Followups */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Follow-ups</h3>
                  {token && (
                    <button
                      onClick={() => toggleFollowupForm('question')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {showFollowupForm === 'question' ? 'Cancel' : 'Add Follow-up'}
                    </button>
                  )}
                </div>

                {showFollowupForm === 'question' && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      rows="3"
                      placeholder="Write your follow-up here..."
                      value={followupContent}
                      onChange={(e) => setFollowupContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSubmitFollowup()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Post Follow-up
                      </button>
                    </div>
                  </div>
                )}

                {followups.question?.length > 0 ? (
                  <div className="space-y-3">
                    {followups.question.map(followup => (
                      <div key={followup.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {editingFollowupId === followup.id ? (
                          <>
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                              rows="3"
                              value={editFollowupContent}
                              onChange={(e) => setEditFollowupContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelEditingFollowup}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateFollowup}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                Update
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700 whitespace-pre-line">{followup.content}</p>
                            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                              <span>
                                Posted by <span className="font-medium text-gray-700">{followup.username}</span> on{' '}
                                {new Date(followup.created_at).toLocaleString()}
                              </span>
                              {followup.user_id === currentUserId && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditingFollowup(followup)}
                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFollowup(followup.id)}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No follow-ups yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600">Question not found</p>
            </div>
          )}

          {/* Answer Form */}
          {token && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Post Your Answer
              </h3>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  rows="6"
                  placeholder="Write your answer here..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  Post Answer
                </button>
              </form>
            </div>
          )}

          {/* Answers List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {answers.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No answers yet. Be the first to answer!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer) => {
                  const voteCount = (votes[answer.id]?.up || 0) - (votes[answer.id]?.down || 0);
                  const isCurrentUserAnswer = answer.user_id === currentUserId;
                  const userVote = userVotes[answer.id];
                  
                  return (
                    <div key={answer.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                      <div className="flex">
                        {/* Voting controls */}
                        <div className="flex flex-col items-center mr-4 w-10">
                          <button
                            onClick={() => handleVote(answer.id, 'up')}
                            className={`p-1 rounded-full ${userVote === 'up' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600'}`}
                            aria-label="Upvote"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <span className="my-1 font-medium text-gray-700">{voteCount}</span>
                          <button
                            onClick={() => handleVote(answer.id, 'down')}
                            className={`p-1 rounded-full ${userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}`}
                            aria-label="Downvote"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Answer content */}
                        <div className="flex-grow">
                          {editingAnswerId === answer.id ? (
                            <>
                              <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                                rows="6"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={cancelEditing}
                                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdateAnswer}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  Update Answer
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="prose max-w-none text-gray-700 mb-4">
                                {answer.content}
                              </div>
                              <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
                                <div className="mb-2 sm:mb-0">
                                  Answered by <span className="font-medium text-gray-700">{answer.username}</span> on{' '}
                                  {new Date(answer.created_at).toLocaleString()}
                                </div>
                                <div className="flex gap-3">
                                  {token && (
                                    <button
                                      onClick={() => toggleReportForm(answer.id)}
                                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      {showReportForm === answer.id ? 'Cancel' : 'Report'}
                                    </button>
                                  )}
                                  {isCurrentUserAnswer && (
                                    <>
                                      <button
                                        onClick={() => startEditing(answer)}
                                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAnswer(answer.id)}
                                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {showReportForm === answer.id && (
                            <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
                              <h4 className="text-sm font-medium text-red-800 mb-3">Report this answer</h4>
                              <select
                                className="w-full p-2 border border-red-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                              >
                                {reportCategories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                ))}
                              </select>
                              <textarea
                                className="w-full p-2 border border-red-300 rounded-lg mb-3 bg-white focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                rows="3"
                                placeholder="Please explain the reason for reporting..."
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setShowReportForm(null)}
                                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSubmitReport(question.id, answer.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Submit Report
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Answer followups */}
                      <div className="mt-6 pl-4 border-l-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900">Follow-ups</h4>
                          {token && (
                            <button
                              onClick={() => toggleFollowupForm(answer.id)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              {showFollowupForm === answer.id ? 'Cancel' : 'Add Follow-up'}
                            </button>
                          )}
                        </div>

                        {showFollowupForm === answer.id && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                              rows="3"
                              placeholder="Write your follow-up here..."
                              value={followupContent}
                              onChange={(e) => setFollowupContent(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSubmitFollowup(answer.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                Post Follow-up
                              </button>
                            </div>
                          </div>
                        )}

                        {followups[answer.id]?.length > 0 ? (
                          <div className="space-y-3">
                            {followups[answer.id].map(followup => (
                              <div key={followup.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                {editingFollowupId === followup.id ? (
                                  <>
                                    <textarea
                                      className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                                      rows="3"
                                      value={editFollowupContent}
                                      onChange={(e) => setEditFollowupContent(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={cancelEditingFollowup}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleUpdateFollowup}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                      >
                                        Update
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-gray-700 whitespace-pre-line">{followup.content}</p>
                                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                                      <span>
                                        Posted by <span className="font-medium text-gray-700">{followup.username}</span> on{' '}
                                        {new Date(followup.created_at).toLocaleString()}
                                      </span>
                                      {followup.user_id === currentUserId && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => startEditingFollowup(followup)}
                                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteFollowup(followup.id)}
                                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No follow-ups yet</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Related Questions Widget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Related Questions
            </h3>
            {loadingRelated ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : relatedQuestions.length > 0 ? (
              <div className="space-y-3">
                {relatedQuestions.map(relatedQ => (
                  <Link
                    key={relatedQ.id}
                    to={`/questions/${relatedQ.id}`}
                    className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <h4 className="font-medium text-indigo-600 line-clamp-1">{relatedQ.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{relatedQ.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No related questions found</p>
            )}
          </div>

          {/* Stats Widget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Question Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Asked On</span>
                <span className="font-medium text-gray-700">
                  {question ? new Date(question.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Answers</span>
                <span className="font-medium text-gray-700">{answers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Follow-ups</span>
                <span className="font-medium text-gray-700">
                  {Object.values(followups).flat().length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-medium text-gray-700">
                  {question?.views || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Votes</span>
                <span className="font-medium text-gray-700">
                  
                </span>
              </div>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Community Guidelines
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-indigo-500">•</span> Be respectful and kind
              </p>
              <p className="flex items-start gap-2">
                <span className="text-indigo-500">•</span> Provide detailed answers
              </p>
              <p className="flex items-start gap-2">
                <span className="text-indigo-500">•</span> Cite sources when possible
              </p>
              <p className="flex items-start gap-2">
                <span className="text-indigo-500">•</span> Flag inappropriate content
              </p>
              {!token && (
                <p className="mt-3 text-sm">
                  <Link to="/login" className="text-indigo-600 hover:underline">
                    Login
                  </Link> to participate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default QuestionAnswer;