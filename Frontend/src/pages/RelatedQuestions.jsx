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
      const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/relatedquestions', {
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
      const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/questions');
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
        'https://moringadesk-ckj3.onrender.com/api/relatedquestions',
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
        `https://moringadesk-ckj3.onrender.com/api/relatedquestions/${editingId}`,
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
      await axios.delete(`https://moringadesk-ckj3.onrender.com/api/relatedquestions/${id}`, {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Create/Edit Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
          Related Questions Management
        </h2>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {editingId ? 'Edit Relationship' : 'Create New Relationship'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Question</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Question</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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

          <div className="flex space-x-4">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {editingId ? 'Update Relationship' : 'Create Relationship'}
            </button>
            
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setSelected({ q1: '', q2: '' });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Questions List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Existing Relationships
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-3 text-gray-600">Loading relationships...</p>
          </div>
        ) : relatedQuestions.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <p className="text-yellow-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No related questions found. Create one above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {relatedQuestions.map((rq) => {
              const q1 = findQuestion(rq.question_id);
              const q2 = findQuestion(rq.related_question_id);

              return (
                <div
                  key={rq.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <p className="font-medium text-gray-800">
                        <span className="text-indigo-600 font-semibold">Q{rq.question_id}:</span> {q1?.description.substring(0, 80)}...
                      </p>
                      <p className="text-gray-600 mt-2">
                        <span className="text-green-600 font-semibold">Related to Q{rq.related_question_id}:</span> {q2?.description.substring(0, 80)}...
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(rq)}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium inline-flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rq.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium inline-flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RelatedQuestions;