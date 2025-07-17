import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

function QuestionAnswer() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [questionUser, setQuestionUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerUsers, setAnswerUsers] = useState({});
  const [votes, setVotes] = useState({});
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
    fetchVotes();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/questions/${id}`);
      setQuestion(res.data);

      const userRes = await axios.get(`http://127.0.0.1:5000/api/users/${res.data.user_id}`, { headers });
      setQuestionUser(userRes.data.username);
    } catch (err) {
      toast.error('Failed to fetch question');
    }
  };

  const fetchAnswers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/answers/${id}`);
      const fetchedAnswers = Array.isArray(res.data) ? res.data : [res.data];
      setAnswers(fetchedAnswers);

      const users = {};
      await Promise.all(
        fetchedAnswers.map(async (ans) => {
          if (!users[ans.user_id]) {
            const userRes = await axios.get(`http://127.0.0.1:5000/api/users/${ans.user_id}`, { headers });
            users[ans.user_id] = userRes.data.username;
          }
        })
      );
      setAnswerUsers(users);
    } catch (err) {
      toast.error('Failed to fetch answers');
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
      toast.error('Failed to fetch votes');
    }
  };

  const handleVote = async (answerId, voteType) => {
    try {
      await axios.post(
        'http://localhost:5000/api/votes',
        { answer_id: answerId, vote_type: voteType },
        { headers }
      );
      toast.success(`You voted ${voteType}`);
      fetchVotes();
    } catch (err) {
      if (err.response?.data?.message === 'You already voted on this answer') {
        try {
          const voteRes = await axios.get('http://localhost:5000/api/votes', { headers });
          const userId = jwtDecode(token).sub;
          const vote = voteRes.data.find((v) => v.answer_id === answerId && v.user_id === userId);

          if (vote) {
            await axios.put(
              `http://localhost:5000/api/votes/${vote.id}`,
              { vote_type: voteType },
              { headers }
            );
            toast.success(`Changed vote to ${voteType}`);
            fetchVotes();
          }
        } catch (updateErr) {
          toast.error('Error changing vote');
        }
      } else {
        toast.error('Error voting');
      }
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {question ? (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-semibold mb-2">{question.title}</h2>
          <p className="text-gray-800 mb-3">{question.description || question.content}</p>
          <div className="text-sm text-gray-500">
            Posted by <span className="font-medium">{questionUser || 'Unknown'}</span> on{' '}
            {new Date(question.created_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <p>Loading question...</p>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Answers</h3>
        {answers.length === 0 ? (
          <p className="text-gray-500">No approved answers yet.</p>
        ) : (
          answers.map((answer) => {
            const voteCount = (votes[answer.id]?.up || 0) - (votes[answer.id]?.down || 0);
            return (
              <div key={answer.id} className="bg-white p-4 rounded shadow mb-4 flex">
                <div className="flex-grow">
                  <p className="text-gray-800">{answer.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Answered by{' '}
                    <span className="font-medium">{answerUsers[answer.user_id] || 'Unknown'}</span>{' '}
                    on {new Date(answer.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col items-center ml-4 w-12">
                  <button
                    onClick={() => handleVote(answer.id, 'up')}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                    aria-label="Upvote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="my-1 font-medium">{voteCount}</span>
                  <button
                    onClick={() => handleVote(answer.id, 'down')}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Downvote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
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