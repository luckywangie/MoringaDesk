import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [categories, setCategories] = useState({});
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all'
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    language: ''
  });
  const { user, token } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        const categoryMap = {};
        res.data.forEach(cat => {
          categoryMap[cat.id] = cat.category_name;
        });
        setCategories(categoryMap);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let url = 'http://localhost:5000/api/questions';
        if (filter.status === 'solved') {
          url = 'http://localhost:5000/api/questions/is_solved';
        } else if (filter.status === 'unsolved') {
          url = 'http://localhost:5000/api/questions/is_unsolved';
        }
        
        const res = await axios.get(url);
        let qs = res.data;

        if (filter.category !== 'all') {
          qs = qs.filter(q => q.category_id == filter.category);
        }

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
        toast.error("Failed to load questions");
      }
    };

    if (token) {
      fetchQuestions();
    }
  }, [token, filter]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast.success("Question deleted successfully!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        Swal.fire('Deleted!', 'Your question has been deleted.', 'success');
      } catch (err) {
        toast.error("Failed to delete question.");
      }
    }
  };

  const toggleSolvedStatus = async (questionId, currentStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/questions/${questionId}/is_solved`,
        { is_solved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Question marked as ${!currentStatus ? 'solved' : 'unsolved'}!`);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, is_solved: !currentStatus } : q
      ));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update question status.");
    }
  };

  const startEditing = (question) => {
    setEditingQuestionId(question.id);
    setEditFormData({
      title: question.title,
      description: question.description,
      category_id: question.category_id,
      language: question.language
    });
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditFormData({
      title: '',
      description: '',
      category_id: '',
      language: ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateQuestion = async (questionId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/questions/${questionId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Question updated successfully!");
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...editFormData } : q
      ));
      setEditingQuestionId(null);
    } catch (err) {
      toast.error("Failed to update question.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">All Questions</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="font-medium self-center">Status:</span>
          <button
            onClick={() => setFilter({...filter, status: 'all'})}
            className={`px-4 py-2 rounded ${filter.status === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter({...filter, status: 'solved'})}
            className={`px-4 py-2 rounded ${filter.status === 'solved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Solved
          </button>
          <button
            onClick={() => setFilter({...filter, status: 'unsolved'})}
            className={`px-4 py-2 rounded ${filter.status === 'unsolved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Unsolved
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="font-medium self-center">Category:</span>
          <select
            value={filter.category}
            onChange={(e) => setFilter({...filter, category: e.target.value})}
            className="px-4 py-2 rounded border border-gray-300"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center">No questions found.</p>
      ) : (
        questions.map((q) => (
          <div
            key={q.id}
            className={`bg-white shadow-md rounded-xl border mb-6 p-5 ${q.is_solved ? 'border-green-500' : 'border-gray-300'}`}
          >
            {editingQuestionId === q.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category_id"
                    value={editFormData.category_id}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(categories).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={editFormData.language}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateQuestion(q.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Posted by <strong>{usernames[q.user_id]}</strong> on{' '}
                      {new Date(q.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: <strong>{categories[q.category_id] || 'Unknown'}</strong>
                    </p>
                  </div>
                  {q.is_solved && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Solved
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-black mb-2 mt-2">{q.title}</h2>
                <p className="text-gray-700 mb-2">{q.description}</p>
                <p className="text-sm text-gray-600 italic mb-2">
                  Language: {q.language}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate(`/questions/${q.id}`)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                  {user?.id === q.user_id && (
                    <>
                      <button
                        onClick={() => startEditing(q)}
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
                      <button
                        onClick={() => toggleSolvedStatus(q.id, q.is_solved)}
                        className={`px-4 py-1 rounded ${q.is_solved ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      >
                        {q.is_solved ? 'Mark Unsolved' : 'Mark Solved'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Questions;