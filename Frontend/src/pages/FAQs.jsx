import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const FAQs = () => {
  const { currentUser, token } = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Base button styles from your navbar
  const baseBtn = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  const primaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-600 to-green-500 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-green-600`;
  const secondaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-green-500`;
  const logoutBtn = `${baseBtn} bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-600`;

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/faqs');
      setFaqs(res.data);
    } catch (err) {
      toast.error('Failed to load FAQs');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <div className={`min-h-screen bg-gray-50 text-gray-800 transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
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

        {currentUser?.is_admin && (
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
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
                className={`${primaryBtn} flex items-center gap-2`}
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
                  className={`${baseBtn} border border-gray-300 text-gray-700 hover:bg-gray-50`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="space-y-6">
          {faqs.length === 0 ? (
            <div className="bg-white shadow-sm rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">No FAQs found. Be the first to add one!</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="bg-white shadow-sm hover:shadow-md rounded-xl border border-gray-200 p-6 transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h2>
                    <p className="text-gray-700 mb-3">{faq.answer}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">By:</span> {faq.created_by} • <span className="font-medium">On:</span> {faq.created_at}
                    </p>
                  </div>
                  
                  {currentUser?.is_admin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className={`${baseBtn} bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-600`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className={`${logoutBtn} flex items-center gap-1`}
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