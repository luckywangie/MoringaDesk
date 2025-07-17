import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [usernames, setUsernames] = useState({});
  const { user, token } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/questions');
        const qs = res.data;

        const nameMap = {};
        await Promise.all(
          qs.map(async (q) => {
            if (!nameMap[q.user_id]) {
              try {
                const userRes = await axios.get(`http://localhost:5000/api/users/${q.user_id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                nameMap[q.user_id] = userRes.data.username;
              } catch (err) {
                nameMap[q.user_id] = "Unknown";
              }
            }
          })
        );

        setUsernames(nameMap);
        setQuestions(qs);
      } catch (err) {
        toast.error("Failed to load questions.");
      }
    };

    fetchQuestions();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Question deleted");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      toast.error("Failed to delete question.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-green-700 mb-6">All Questions</h1>
      {questions.length === 0 ? (
        <p className="text-gray-500 text-center">No questions found.</p>
      ) : (
        questions.map((q) => (
          <div
            key={q.id}
            className="bg-white shadow-md rounded-xl border border-gray-300 mb-6 p-5"
          >
            <p className="text-sm text-gray-500 mb-1">
              Posted by <strong>{usernames[q.user_id]}</strong> on{' '}
              {new Date(q.created_at).toLocaleDateString()}
            </p>
            <h2 className="text-xl font-semibold text-black mb-2">{q.title}</h2>
            <p className="text-gray-700 mb-2">{q.description}</p>
            <p className="text-sm text-gray-600 italic mb-2">
              Language: {q.language} | Category ID: {q.category_id}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/questions/${q.id}`)}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                View
              </button>
              {user?.id === q.user_id && (
                <>
                  <button
                    onClick={() => navigate(`/questions/edit/${q.id}`)}
                    className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Questions;