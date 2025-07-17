import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { user, token } = useUser();
  const [myQuestions, setMyQuestions] = useState([]);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    language: '',
    category_id: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    const fetchUserQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userQs = res.data.filter(q => q.user_id === user.id);
        setMyQuestions(userQs);
      } catch (err) {
        toast.error("Failed to load your questions.");
      }
    };

    fetchUserQuestions();
  }, [user, token]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete your question permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyQuestions(prev => prev.filter(q => q.id !== id));
        toast.success("Question deleted successfully.");
      } catch (err) {
        toast.error("Error deleting question.");
      }
    }
  };

  const handleEditClick = (question) => {
    setEditQuestionId(question.id);
    setEditFormData({
      title: question.title,
      description: question.description,
      language: question.language,
      category_id: question.category_id
    });
  };

  const handleEditChange = (e) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/questions/${editQuestionId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question updated successfully.");
      setMyQuestions(prev =>
        prev.map(q => q.id === editQuestionId ? res.data.question : q)
      );
      setEditQuestionId(null);
    } catch (err) {
      toast.error("Failed to update question.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-green-700">
        Welcome, {user?.username}
      </h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Questions</h2>

      {myQuestions.length === 0 ? (
        <p className="text-gray-500">You haven’t posted any questions yet.</p>
      ) : (
        myQuestions.map(q => (
          <div
            key={q.id}
            className="bg-white border border-gray-300 shadow-md rounded-xl p-5 mb-6"
          >
            {editQuestionId === q.id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Title"
                  required
                />
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Description"
                  required
                />
                <input
                  type="text"
                  name="language"
                  value={editFormData.language}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Language"
                  required
                />
                <input
                  type="number"
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Category ID"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditQuestionId(null)}
                    className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-1">
                  Posted on {new Date(q.created_at).toLocaleDateString()}
                </p>
                <h3 className="text-lg font-semibold text-black mb-2">{q.title}</h3>
                <p className="text-gray-700 mb-2">{q.description}</p>
                <p className="text-sm text-gray-600 italic mb-2">
                  Language: {q.language}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/questions/${q.id}`)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(q)}
                    className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
