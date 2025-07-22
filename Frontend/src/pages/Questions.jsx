import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [categories, setCategories] = useState({});
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
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
        const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/categories');
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
        let url = 'https://moringadesk-ckj3.onrender.com/api/questions';
        if (filter.status === 'solved') {
          url = 'https://moringadesk-ckj3.onrender.com/is_solved';
        } else if (filter.status === 'unsolved') {
          url = 'https://moringadesk-ckj3.onrender.com/api/questions/is_unsolved';
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
                const userRes = await axios.get(`https://moringadesk-ckj3.onrender.com/api/users/${q.user_id}`, {
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
        setAllQuestions(qs);
        setQuestions(qs);
      } catch (err) {
        toast.error("Failed to load questions");
      }
    };

    if (token) {
      fetchQuestions();
    }
  }, [token, filter]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setQuestions(allQuestions);
    } else {
      const filtered = allQuestions.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (categories[q.category_id] && categories[q.category_id].toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.language && q.language.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setQuestions(filtered);
    }
  }, [searchTerm, allQuestions, categories]);

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
        await axios.delete(`https://moringadesk-ckj3.onrender.com/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast.success("Question deleted successfully!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setAllQuestions((prev) => prev.filter((q) => q.id !== id));
        Swal.fire('Deleted!', 'Your question has been deleted.', 'success');
      } catch (err) {
        toast.error("Failed to delete question.");
      }
    }
  };

  const toggleSolvedStatus = async (questionId, currentStatus) => {
    try {
      const response = await axios.put(
        `https://moringadesk-ckj3.onrender.com/api/questions/${questionId}/is_solved`,
        { is_solved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Question marked as ${!currentStatus ? 'solved' : 'unsolved'}!`);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, is_solved: !currentStatus } : q
      ));
      setAllQuestions(prev => prev.map(q => 
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
        `https://moringadesk-ckj3.onrender.com/api/questions/${questionId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Question updated successfully!");
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...editFormData } : q
      ));
      setAllQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...editFormData } : q
      ));
      setEditingQuestionId(null);
    } catch (err) {
      toast.error("Failed to update question.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            Community Questions
          </h1>
          <p className="text-gray-500 mt-1">Browse through questions from the community</p>
        </div>
        <button
          onClick={() => navigate('/ask-question')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ask a New Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md mb-8">
        <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg"
            >
              <option value="all">All Questions</option>
              <option value="solved">Solved Only</option>
              <option value="unsolved">Unsolved Only</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              No questions found matching your criteria.
            </p>
            <button
              onClick={() => {
                setFilter({ status: 'all', category: 'all' });
                setSearchTerm('');
              }}
              className="bg-gradient-to-r from-indigo-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:shadow-md cursor-pointer hover:border-indigo-200 group ${
                q.is_solved ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      rows="4"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category_id"
                        value={editFormData.category_id}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleUpdateQuestion(q.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">
                          Posted by <span className="font-medium text-gray-700">{usernames[q.user_id]}</span>
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(q.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm font-medium text-gray-700">
                          {categories[q.category_id] || 'Unknown'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">{q.title}</h3>
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        q.is_solved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {q.is_solved ? 'Solved' : 'Unsolved'}
                      </span>
                      {q.language && (
                        <span className="px-2.5 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                          {q.language}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 line-clamp-3">
                    {q.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/questions/${q.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Question
                    </button>
                    {user?.id === q.user_id && (
                      <>
                        <button
                          onClick={() => startEditing(q)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                        <button
                          onClick={() => toggleSolvedStatus(q.id, q.is_solved)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                            q.is_solved 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
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
    </div>
  );
};

export default Questions;