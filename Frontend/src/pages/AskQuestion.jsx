import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    language: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch related questions when title or description changes
  useEffect(() => {
    if ((formData.title.trim().length > 3) || (formData.description.trim().length > 3)) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      setDebounceTimeout(setTimeout(() => {
        fetchRelatedQuestions();
      }, 500));
    } else {
      setRelatedQuestions([]);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [formData.title, formData.description]);

  const fetchRelatedQuestions = async () => {
    setIsSearching(true);
    try {
      const searchQuery = `${formData.title} ${formData.description}`.trim();
      const res = await axios.get(
        `http://localhost:5000/api/questions?search=${encodeURIComponent(searchQuery)}`
      );
      setRelatedQuestions(res.data);
    } catch (err) {
      toast.error('Failed to search related questions');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/questions',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question posted successfully');
      setFormData({ title: '', description: '', category_id: '', language: '' });
      setRelatedQuestions([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Main form */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">Ask a Question</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Enter your question title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Describe your question in detail"
                required
              />
              {isSearching && (
                <p className="text-sm text-gray-500 mt-1">Searching for similar questions...</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700">Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="e.g., JavaScript, Python"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              Submit Question
            </button>
          </form>
        </div>

        {/* Related questions sidebar */}
        {(relatedQuestions.length > 0 || isSearching) && (
          <div className="md:w-80 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Similar Questions
              {isSearching && <span className="ml-2 text-gray-500">(searching...)</span>}
            </h3>
            
            {relatedQuestions.length > 0 ? (
              <div className="space-y-4">
                {relatedQuestions.map(question => (
                  <div key={question.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <h4 className="font-medium text-blue-600 hover:text-blue-800 line-clamp-2">
                      <a href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer">
                        {question.title}
                      </a>
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{question.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      <span>{question.language}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isSearching && <p className="text-gray-500">No similar questions found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestion;