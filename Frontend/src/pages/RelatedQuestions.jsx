import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RelatedQuestions = () => {
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({ q1: '', q2: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRelatedQuestions();
    fetchAllQuestions();
  }, []);

  const fetchRelatedQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/relatedquestions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRelatedQuestions(res.data);
    } catch (err) {
      toast.error('Error fetching related questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/questions');
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to fetch all questions');
    }
  };

  const handleCreate = async () => {
    if (!selected.q1 || !selected.q2) {
      toast.error('Please select two related questions');
      return;
    }

    if (selected.q1 === selected.q2) {
      toast.error('Questions cannot be the same');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/relatedquestions',
        {
          question_id: selected.q1,
          related_question_id: selected.q2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Related question created');
      setSelected({ q1: '', q2: '' });
      fetchRelatedQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create related question');
    }
  };

  const handleEdit = (rq) => {
    setSelected({ q1: rq.question_id, q2: rq.related_question_id });
    setEditingId(rq.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/relatedquestions/${editingId}`,
        {
          question_id: selected.q1,
          related_question_id: selected.q2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Related question updated');
      setEditingId(null);
      setSelected({ q1: '', q2: '' });
      fetchRelatedQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update related question');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/relatedquestions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Related question deleted');
      fetchRelatedQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete related question');
    }
  };

  const findQuestion = (id) => questions.find((q) => q.id === id);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Related Questions Management</h2>

      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? 'Edit Relationship' : 'Create New Relationship'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Question</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selected.q1}
              onChange={(e) => setSelected({ ...selected, q1: e.target.value })}
            >
              <option value="">Select a question</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} - {q.description.substring(0, 50)}... ({q.language})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Question</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selected.q2}
              onChange={(e) => setSelected({ ...selected, q2: e.target.value })}
            >
              <option value="">Select a related question</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} - {q.description.substring(0, 50)}... ({q.language})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={editingId ? handleUpdate : handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingId ? 'Update Relationship' : 'Create Relationship'}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setSelected({ q1: '', q2: '' });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Related Questions List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Existing Relationships</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading relationships...</p>
          </div>
        ) : relatedQuestions.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">No related questions found. Create one above.</p>
          </div>
        ) : (
          relatedQuestions.map((rq) => {
            const q1 = findQuestion(rq.question_id);
            const q2 = findQuestion(rq.related_question_id);

            return (
              <div
                key={rq.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <p className="font-medium text-gray-800">
                      <span className="text-blue-600">Q{rq.question_id}:</span> {q1?.description.substring(0, 80)}...
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="text-green-600">Related to Q{rq.related_question_id}:</span> {q2?.description.substring(0, 80)}...
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(rq)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rq.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RelatedQuestions;