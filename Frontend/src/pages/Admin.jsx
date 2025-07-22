import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useUser } from '../context/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const FollowupForm = ({ answerId, onFollowupCreated }) => {
  const [content, setContent] = useState('');
  const { createFollowup, loading } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await createFollowup(answerId, content);
    if (success) {
      setContent('');
      onFollowupCreated && onFollowupCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex items-start gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a follow-up question..."
          className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          rows={2}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Post
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const ReportForm = ({ questionId, onReportSubmit, onCancel }) => {
  const { loading, user } = useAdmin();
  const [reason, setReason] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !categoryId) return;

    const success = await onReportSubmit(questionId, categoryId, reason);
    if (success) {
      setReason('');
      setCategoryId('');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Report Question
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            required
            disabled={user?.is_admin}
          >
            <option value="">Select a category</option>
            <option value="1">Inappropriate Content</option>
            <option value="2">Spam</option>
            <option value="3">Duplicate Question</option>
            <option value="4">Other</option>
          </select>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for reporting..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          rows={3}
          required
          disabled={user?.is_admin}
        />
        <div className="flex justify-end space-x-3 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || user?.is_admin}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reporting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const FaqForm = ({ faq, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    question: faq?.question || '',
    answer: faq?.answer || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-200 hover:shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            rows={4}
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {faq ? 'Update' : 'Create'} FAQ
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationItem = ({ notification, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(notification.message);

  const handleUpdate = async () => {
    const success = await onUpdate(notification.id, { message: editedMessage });
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification #{notification.id}</h3>
          {isEditing ? (
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              rows={3}
            />
          ) : (
            <p className="text-gray-700">{notification.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {new Date(notification.created_at).toLocaleString()}
          </span>
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(notification.id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const {
    questions,
    answersByQuestion,
    followupsByAnswer,
    reports,
    notifications,
    users,
    faqs,
    userDetailsCache,
    loading,
    activeTab,
    setActiveTab,
    fetchAnswersForQuestion,
    fetchFollowupsForAnswer,
    fetchFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    deleteFollowup,
    toggleAnswerApproval,
    createReport,
    deleteReport,
    deleteQuestion,
    deleteNotification,
    updateNotification,
    getUserDetails,
    updateUserAdminStatus,
    toggleUserActivation,
    deleteUser
  } = useAdmin();

  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFollowups, setExpandedFollowups] = useState({});
  const [editingFaq, setEditingFaq] = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(null);

  const toggleAnswers = (questionId) => {
    if (activeQuestionId === questionId) {
      setActiveQuestionId(null);
    } else {
      setActiveQuestionId(questionId);
      fetchAnswersForQuestion(questionId);
    }
  };

  const toggleFollowups = (answerId) => {
    setExpandedFollowups(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
    if (!followupsByAnswer[answerId]) {
      fetchFollowupsForAnswer(answerId);
    }
  };

  const handleCreateFaq = async (faqData) => {
    const success = await createFaq(faqData);
    if (success) {
      setShowFaqForm(false);
      fetchFaqs();
    }
  };

  const handleUpdateFaq = async (faqData) => {
    const success = await updateFaq(editingFaq.id, faqData);
    if (success) {
      setEditingFaq(null);
      fetchFaqs();
    }
  };

  const handleDeleteFaq = async (id) => {
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
      await deleteFaq(id);
    }
  };

  const handleReportSubmit = async (questionId, categoryId, reason) => {
    const success = await createReport(questionId, categoryId, reason);
    if (success) {
      setShowReportForm(null);
    }
    return success;
  };

  const handleToggleActivation = async (userId, isActive) => {
    await toggleUserActivation(userId, isActive);
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser(userId);
  };

  const handleDeleteQuestion = async (questionId) => {
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
      await deleteQuestion(questionId);
    }
  };

  // Filtered lists with nullish coalescing for safe .toLowerCase() calls
  const filteredQuestions = questions.filter(q =>
    (q.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    (r.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.question?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = notifications.filter(n =>
    (n.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((userDetailsCache[n.user_id]?.username || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq =>
    (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserName = (userId) => {
    return userDetailsCache[userId]?.username || 'Loading...';
  };

  useEffect(() => {
    notifications.forEach(n => {
      if (!userDetailsCache[n.user_id]) {
        getUserDetails(n.user_id);
      }
    });
  }, [notifications, userDetailsCache, getUserDetails]); // Added dependencies for useEffect

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 w-full max-w-md text-center transition-all duration-200 hover:shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            Admin Access Required
          </h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-200 hover:shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mt-1">Welcome, {user?.username || 'Admin'}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-200 hover:shadow-md">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex overflow-x-auto pb-2">
              <button
                className={`px-4 py-2 font-medium rounded-lg mr-2 ${activeTab === 'questions' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('questions')}
              >
                Questions ({questions.length})
              </button>
              <button
                className={`px-4 py-2 font-medium rounded-lg mr-2 ${activeTab === 'reports' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('reports')}
              >
                Reports ({reports.length})
              </button>
              <button
                className={`px-4 py-2 font-medium rounded-lg mr-2 ${activeTab === 'notifications' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications ({notifications.length})
              </button>
              <button
                className={`px-4 py-2 font-medium rounded-lg mr-2 ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('users')}
              >
                Users ({users.length})
              </button>
              <button
                className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'faqs' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('faqs')}
              >
                FAQs ({faqs.length})
              </button>
            </div>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : activeTab === 'questions' ? (
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No questions found</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{question.title}</h3>
                      <p className="text-gray-700 mb-4">{question.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {question.language}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {getUserName(question.user_id)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(question.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={() => toggleAnswers(question.id)}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        activeQuestionId === question.id
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {activeQuestionId === question.id ? 'Hide Answers' : `Show Answers (${question.answers_count || 0})`}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                      {!user?.is_admin && (
                        <button
                          onClick={() => setShowReportForm(showReportForm === question.id ? null : question.id)}
                          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Report
                        </button>
                      )}
                    </div>
                  </div>

                  {showReportForm === question.id && (
                    <ReportForm
                      questionId={question.id}
                      onReportSubmit={handleReportSubmit}
                      onCancel={() => setShowReportForm(null)}
                    />
                  )}

                  {activeQuestionId === question.id && (
                    <div className="mt-6 space-y-4">
                      {answersByQuestion[question.id]?.length > 0 ? (
                        answersByQuestion[question.id].map((answer) => (
                          <div key={answer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-800">{answer.content}</p>
                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  {getUserName(answer.user_id)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  {new Date(answer.created_at).toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleAnswerApproval(answer.id, question.id, !answer.is_approved)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                  answer.is_approved
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {answer.is_approved ? 'Unapprove' : 'Approve'}
                              </button>
                            </div>

                            <div className="mt-4">
                              <button
                                onClick={() => toggleFollowups(answer.id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                {expandedFollowups[answer.id] ? 'Hide Follow-ups' : 'Show Follow-ups'}
                                {followupsByAnswer[answer.id]?.length > 0 && (
                                  <span className="text-gray-500 ml-1">({followupsByAnswer[answer.id].length})</span>
                                )}
                              </button>

                              {expandedFollowups[answer.id] && (
                                <div className="mt-3 ml-4 pl-4 border-l-2 border-indigo-200">
                                  <FollowupForm
                                    answerId={answer.id}
                                    onFollowupCreated={() => fetchFollowupsForAnswer(answer.id)}
                                  />

                                  {followupsByAnswer[answer.id]?.length > 0 ? (
                                    followupsByAnswer[answer.id].map(followup => (
                                      <div key={followup.id} className="bg-white rounded-lg p-3 my-2 shadow-sm border border-gray-200">
                                        <p className="text-gray-700">{followup.content}</p>
                                        <div className="flex justify-between items-center mt-2">
                                          <div className="text-xs text-gray-500">
                                            <span className="inline-flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                              </svg>
                                              {getUserName(followup.user_id)}
                                            </span>
                                            <span className="inline-flex items-center gap-1 ml-2">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                              </svg>
                                              {new Date(followup.created_at).toLocaleString()}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => deleteFollowup(followup.id, answer.id)}
                                            className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-xs"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-600 text-sm mt-3">No follow-up questions yet.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No answers for this question yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Report ID: {report.id}</h3>
                  <p className="text-gray-700 mb-2">
                    <strong className="text-gray-800">Reason:</strong> {report.reason}
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong className="text-gray-800">Category:</strong> {report.category_name}
                  </p>
                  {report.question && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                      <p className="font-medium text-gray-800">Reported Question:</p>
                      <p className="text-gray-700 text-sm italic">{report.question.title}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {getUserName(report.user_id)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'notifications' ? (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={deleteNotification}
                  onUpdate={updateNotification}
                />
              ))
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{u.username}</h3>
                      <p className="text-gray-600 text-sm">{u.email}</p>
                      <p className="text-gray-600 text-xs mt-1">Joined: {new Date(u.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${u.is_admin ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>
                      {u.is_admin ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => updateUserAdminStatus(u.id, !u.is_admin)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
                        u.is_admin
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm-1.555 6.816A5.002 5.002 0 0110 13a5.002 5.002 0 01-1.445-.184l-2.618 1.619A1.5 1.5 0 005.152 15.63l-.756 2.37A1 1 0 004.99 19h10.02a1 1 0 00.593-1.002l-.756-2.37a1.5 1.5 0 00-.775-1.004l-2.618-1.619z" />
                      </svg>
                      {u.is_admin ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                    <button
                      onClick={() => handleToggleActivation(u.id, !u.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
                        u.is_active
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {u.is_active ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        )}
                      </svg>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'faqs' ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setShowFaqForm(true); setEditingFaq(null); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create New FAQ
              </button>
            </div>
            {showFaqForm && (
              <FaqForm
                faq={editingFaq}
                onCancel={() => { setShowFaqForm(false); setEditingFaq(null); }}
                onSubmit={editingFaq ? handleUpdateFaq : handleCreateFaq}
              />
            )}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">No FAQs found</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-700 mb-4">{faq.answer}</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => { setEditingFaq(faq); setShowFaqForm(true); }}
                      className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.387 7.388A4 4 0 019.172 14H8a1 1 0 01-1-1v-1.172a4 4 0 011.172-2.828l7.387-7.388zM14.5 9.5l.707.707L11.707 14H11v-.707l2.8-2.8z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Admin;