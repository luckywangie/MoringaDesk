import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const FAQsPage = () => {
  const { user, token } = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: '' });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.is_admin;

  useEffect(() => {
    fetch('/faqs/')
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching FAQs:', err);
        toast.error('Failed to load FAQs');
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewFAQ({ ...newFAQ, [e.target.name]: e.target.value });
  };

  const createFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer || !newFAQ.category) {
      toast.error('All fields are required');
      return;
    }

    try {
      const res = await fetch('/faqs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFAQ),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Failed to create FAQ');
        return;
      }

      const created = await res.json();
      toast.success('FAQ created');
      setFaqs([...faqs, { ...newFAQ, id: created.id }]);
      setNewFAQ({ question: '', answer: '', category: '' });
    } catch (err) {
      toast.error('Server error');
    }
  };

  const deleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const res = await fetch(`/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete');
        return;
      }

      setFaqs(faqs.filter((f) => f.id !== id));
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Frequently Asked Questions</h1>

      {loading ? (
        <p>Loading FAQs...</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
              <p className="text-sm text-gray-500">Category: {faq.category}</p>
              {isAdmin && (
                <button
                  onClick={() => deleteFAQ(faq.id)}
                  className="mt-2 text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Add New FAQ</h2>
          <div className="space-y-2">
            <input
              name="question"
              value={newFAQ.question}
              onChange={handleInputChange}
              placeholder="Question"
              className="w-full px-4 py-2 border rounded"
            />
            <textarea
              name="answer"
              value={newFAQ.answer}
              onChange={handleInputChange}
              placeholder="Answer"
              className="w-full px-4 py-2 border rounded"
            />
            <input
              name="category"
              value={newFAQ.category}
              onChange={handleInputChange}
              placeholder="Category"
              className="w-full px-4 py-2 border rounded"
            />
            <button
              onClick={createFAQ}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Create FAQ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQsPage;
