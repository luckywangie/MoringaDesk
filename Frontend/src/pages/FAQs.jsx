import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const FAQs = () => {
  const { currentUser, token } = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Base button styles from your navbar
  const baseBtn = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  const primaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-600 to-green-500 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-green-600`;
  const secondaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-green-500`;
  const logoutBtn = `${baseBtn} bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-600`;

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    const results = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaqs(results);
  }, [searchTerm, faqs]);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/faqs');
      setFaqs(res.data);
      setFilteredFaqs(res.data);
    } catch (err) {
      toast.error('Failed to load FAQs');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/faqs/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('FAQ updated');
      } else {
        await axios.post('http://localhost:5000/api/faqs', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('FAQ created');
      }
      fetchFaqs();
      setForm({ question: '', answer: '' });
      setEditingId(null);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleEdit = (faq) => {
    setForm({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 text-gray-500 hover:text-green-600 focus:outline-none transition-colors md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
          />
        </div>

        {currentUser?.is_admin && (
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit FAQ' : 'Create New FAQ'}
            </h2>
            <input
              type="text"
              name="question"
              placeholder="Enter question..."
              value={form.question}
              onChange={handleChange}
              required
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            />
            <textarea
              name="answer"
              placeholder="Enter answer..."
              value={form.answer}
              onChange={handleChange}
              required
              rows={4}
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className={`${primaryBtn} flex items-center gap-2 hover:scale-105 transform transition-transform`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {editingId ? 'Update FAQ' : 'Create FAQ'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ question: '', answer: '' });
                    setEditingId(null);
                  }}
                  className={`${baseBtn} border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="space-y-6">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white shadow-lg rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Be the first to add one!'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div 
                key={faq.id} 
                className="bg-white shadow-lg hover:shadow-xl rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 transform"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {faq.question}
                    </h2>
                    <p className="text-gray-700 mb-3 pl-7 border-l-2 border-indigo-100">
                      <svg className="w-5 h-5 text-green-500 float-left mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {faq.answer}
                    </p>
                    <p className="text-sm text-gray-500 pl-7">
                      <span className="font-medium">By:</span> {faq.created_by} • <span className="font-medium">On:</span> {faq.created_at}
                    </p>
                  </div>
                  
                  {currentUser?.is_admin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className={`${baseBtn} bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-600 hover:scale-105 transform transition-all`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className={`${logoutBtn} flex items-center gap-1 hover:scale-105 transform transition-all`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQs;