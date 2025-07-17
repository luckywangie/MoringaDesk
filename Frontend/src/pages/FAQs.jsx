import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const FAQs = () => {
  const { currentUser, token } = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [editingId, setEditingId] = useState(null);

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
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Frequently Asked Questions</h1>

      {currentUser?.is_admin && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4 mb-8 max-w-lg">
          <input
            type="text"
            name="question"
            placeholder="Question"
            value={form.question}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <textarea
            name="answer"
            placeholder="Answer"
            value={form.answer}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {editingId ? 'Update FAQ' : 'Create FAQ'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white shadow-sm border border-gray-200 rounded p-4">
            <h2 className="font-semibold text-green-800">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
            <p className="text-sm text-gray-500 mt-1">By: {faq.created_by} on {faq.created_at}</p>

            {currentUser?.is_admin && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="text-sm text-white bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
