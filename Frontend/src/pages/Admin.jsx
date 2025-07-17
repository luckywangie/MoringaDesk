import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const Admin = () => {
  const [answers, setAnswers] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [reports, setReports] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editFaq, setEditFaq] = useState({ question: '', answer: '' });
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReport, setEditReport] = useState({ reason: '', category_id: '' });
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState({
    answers: false,
    faqs: false,
    reports: false,
    operations: false,
    users: {},
    questions: {},
    categories: false
  });

  const [error, setError] = useState({
    answers: null,
    faqs: null,
    reports: null,
    operations: null
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnswers();
    fetchFaqs();
    fetchReports();
    fetchCategories();
  }, []);

  const fetchAnswers = async () => {
    setLoading(prev => ({ ...prev, answers: true }));
    setError(prev => ({ ...prev, answers: null }));
    try {
      const res = await axios.get('http://localhost:5000/api/answers/unapproved');
      setAnswers(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, answers: err.response?.data?.message || 'Failed to fetch answers' }));
      toast.error(err.response?.data?.message || 'Failed to fetch answers');
    } finally {
      setLoading(prev => ({ ...prev, answers: false }));
    }
  };

  const fetchFaqs = async () => {
    setLoading(prev => ({ ...prev, faqs: true }));
    setError(prev => ({ ...prev, faqs: null }));
    try {
      const res = await axios.get('http://localhost:5000/api/faqs');
      setFaqs(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, faqs: err.response?.data?.message || 'Failed to fetch FAQs' }));
      toast.error(err.response?.data?.message || 'Failed to fetch FAQs');
    } finally {
      setLoading(prev => ({ ...prev, faqs: false }));
    }
  };

  const fetchReports = async () => {
    setLoading(prev => ({ ...prev, reports: true }));
    setError(prev => ({ ...prev, reports: null }));
    try {
      const res = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, reports: err.response?.data?.message || 'Failed to fetch reports' }));
      toast.error(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchUserDetails = async (userId) => {
    if (loading.users[userId] || !userId) return;
    
    setLoading(prev => ({
      ...prev,
      users: { ...prev.users, [userId]: true }
    }));
    
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReports(prev => prev.map(report => 
        report.user_id === userId 
          ? { ...report, username: res.data.username } 
          : report
      ));
    } catch (err) {
      toast.error(`Failed to fetch user ${userId}: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(prev => ({
        ...prev,
        users: { ...prev.users, [userId]: false }
      }));
    }
  };

  const fetchQuestionDetails = async (questionId) => {
    if (loading.questions[questionId] || !questionId) return;
    
    setLoading(prev => ({
      ...prev,
      questions: { ...prev.questions, [questionId]: true }
    }));
    
    try {
      const res = await axios.get(`http://localhost:5000/api/questions/${questionId}`);
      
      setReports(prev => prev.map(report => 
        report.question_id === questionId 
          ? { ...report, question_title: res.data.title, question_description: res.data.description } 
          : report
      ));
    } catch (err) {
      toast.error(`Failed to fetch question ${questionId}: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(prev => ({
        ...prev,
        questions: { ...prev.questions, [questionId]: false }
      }));
    }
  };

  const handleApprove = async (answerId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to approve this answer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!'
    });

    if (!result.isConfirmed) return;

    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    try {
      const res = await axios.put(
        `http://localhost:5000/api/answers/${answerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      fetchAnswers();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error approving answer';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleCreateFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Both question and answer are required');
      return;
    }
    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    try {
      const res = await axios.post('http://localhost:5000/api/faqs', newFaq, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setNewFaq({ question: '', answer: '' });
      fetchFaqs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error creating FAQ';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setEditFaq({ question: faq.question, answer: faq.answer });
  };

  const handleUpdateFaq = async (id) => {
    if (!editFaq.question.trim() || !editFaq.answer.trim()) {
      toast.error('Both question and answer are required');
      return;
    }
    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    try {
      const res = await axios.put(
        `http://localhost:5000/api/faqs/${id}`,
        editFaq,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setEditingFaqId(null);
      fetchFaqs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error updating FAQ';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleDeleteFaq = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    try {
      const res = await axios.delete(`http://localhost:5000/api/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchFaqs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error deleting FAQ';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleEditReport = (report) => {
    setEditingReportId(report.id);
    setEditReport({ 
      reason: report.reason, 
      category_id: report.category_id 
    });
  };

  const handleUpdateReport = async (id) => {
    if (!editReport.reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    
    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    
    try {
      const res = await axios.put(
        `http://localhost:5000/api/reports/${id}`,
        editReport,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(res.data.message);
      setEditingReportId(null);
      fetchReports();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error updating report';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleDeleteReport = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    setLoading(prev => ({ ...prev, operations: true }));
    setError(prev => ({ ...prev, operations: null }));
    
    try {
      const res = await axios.delete(`http://localhost:5000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(res.data.message);
      fetchReports();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error deleting report';
      setError(prev => ({ ...prev, operations: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Unapproved Answers */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Unapproved Answers</h2>
        {loading.answers ? (
          <div className="text-center py-4">Loading answers...</div>
        ) : error.answers ? (
          <div className="text-red-500 p-2 bg-red-50 rounded">{error.answers}</div>
        ) : answers.length === 0 ? (
          <p className="text-gray-500">No unapproved answers.</p>
        ) : (
          <div className="space-y-3">
            {answers.map(answer => (
              <div key={answer.id} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50">
                <p className="font-semibold text-gray-800">Q: {answer.question.content}</p>
                <p className="mt-1 text-gray-700">A: {answer.content}</p>
                <div className="mt-3">
                  <button
                    onClick={() => handleApprove(answer.id)}
                    disabled={loading.operations}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {loading.operations ? 'Processing...' : 'Approve Answer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ Management */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Manage FAQs</h2>

        {/* Create FAQ */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Create New FAQ</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Question"
              value={newFaq.question}
              onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Answer"
              value={newFaq.answer}
              onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleCreateFaq}
              disabled={loading.operations}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading.operations ? 'Creating...' : 'Create FAQ'}
            </button>
          </div>
        </div>

        {/* FAQ List */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Existing FAQs</h3>
          {loading.faqs ? (
            <div className="text-center py-4">Loading FAQs...</div>
          ) : error.faqs ? (
            <div className="text-red-500 p-2 bg-red-50 rounded">{error.faqs}</div>
          ) : faqs.length === 0 ? (
            <p className="text-gray-500">No FAQs available.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="border border-gray-200 p-4 rounded-lg">
                  {editingFaqId === faq.id ? (
                    <div className="space-y-3">
                      <input
                        value={editFaq.question}
                        onChange={e => setEditFaq({ ...editFaq, question: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <textarea
                        value={editFaq.answer}
                        onChange={e => setEditFaq({ ...editFaq, answer: e.target.value })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateFaq(faq.id)}
                          disabled={loading.operations}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingFaqId(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-800">Q: {faq.question}</p>
                      <p className="mt-1 text-gray-700">A: {faq.answer}</p>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleEditFaq(faq)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          disabled={loading.operations}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Reports Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">User Reports</h2>
        {loading.reports ? (
          <div className="text-center py-4">Loading reports...</div>
        ) : error.reports ? (
          <div className="text-red-500 p-2 bg-red-50 rounded">{error.reports}</div>
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Question</th>
                  <th className="px-4 py-2 border">Category</th>
                  <th className="px-4 py-2 border">Reason</th>
                  <th className="px-4 py-2 border">Created At</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => {
                  // Fetch user details if not already loaded
                  if (report.user_id && !report.username) {
                    fetchUserDetails(report.user_id);
                  }
                  
                  // Fetch question details if not already loaded
                  if (report.question_id && !report.question_description) {
                    fetchQuestionDetails(report.question_id);
                  }
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{report.id}</td>
                      <td className="px-4 py-2 border">
                        {report.username || 
                          (loading.users[report.user_id] ? 'Loading...' : `User ${report.user_id}`)}
                      </td>
                      <td className="px-4 py-2 border">
                        {report.question_title ? (
                          <div title={report.question_description}>
                            {report.question_title.substring(0, 30)}
                            {report.question_title.length > 30 ? '...' : ''}
                          </div>
                        ) : (
                          loading.questions[report.question_id] ? 'Loading...' : `Question ${report.question_id}`
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        {loading.categories ? 'Loading...' : getCategoryName(report.category_id)}
                      </td>
                      <td className="px-4 py-2 border">
                        {editingReportId === report.id ? (
                          <input
                            type="text"
                            value={editReport.reason}
                            onChange={e => setEditReport({...editReport, reason: e.target.value})}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          report.reason
                        )}
                      </td>
                      <td className="px-4 py-2 border">{new Date(report.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 border">
                        {editingReportId === report.id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleUpdateReport(report.id)}
                              disabled={loading.operations}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReportId(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditReport(report)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              disabled={loading.operations}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Admin;