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
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex items-start">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a follow-up question..."
          className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          rows={2}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="ml-2 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
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
    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
      <h4 className="font-medium text-gray-700 mb-2">Report Question</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm text-black"
            required
            disabled={user?.is_admin}
          >
            <option value="" className="text-gray-500">Select a category</option>
            <option value="1" className="text-black">Inappropriate Content</option>
            <option value="2" className="text-black">Spam</option>
            <option value="3" className="text-black">Duplicate Question</option>
            <option value="4" className="text-black">Other</option>
          </select>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for reporting..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm text-black"
          rows={2}
          required
          disabled={user?.is_admin}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || user?.is_admin}
            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {loading ? 'Reporting...' : 'Submit Report'}
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
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
            Question
          </label>
          <input
            type="text"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answer">
            Answer
          </label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Notification {notification.id}</h3>
            {isEditing ? (
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-black mt-1"
                rows={2}
              />
            ) : (
              <p className="text-gray-600 mt-1">{notification.message}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              <p>Date: {new Date(notification.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm"
              >
                Save
              </button>
            </>
          ) : (
            <>
             
              <button
                onClick={() => onDelete(notification.id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm"
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

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.question?.title && r.question.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredNotifications = notifications.filter(n =>
    n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userDetailsCache[n.user_id]?.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [notifications]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h2 className="text-2xl font-bold text-emerald-800 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-emerald-50">
      <ToastContainer />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-800">Admin Dashboard</h2>
          <button
            onClick={logout}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-800 font-medium">Welcome, {user?.username || 'Admin'}!</p>
              <p className="text-gray-600 text-sm">Administrator Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'questions' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions ({questions.length})
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'reports' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports ({reports.length})
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'notifications' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications ({notifications.length})
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'faqs' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
              onClick={() => setActiveTab('faqs')}
            >
              FAQs ({faqs.length})
            </button>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : activeTab === 'questions' ? (
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">No questions found</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-emerald-800">{question.title}</h3>
                        <p className="text-gray-600 mt-1">{question.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Asked by: {getUserName(question.user_id)} • {new Date(question.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        className={`px-4 py-2 rounded-md font-medium flex items-center ${activeQuestionId === question.id ? 
                          'bg-emerald-700 text-white hover:bg-emerald-800' : 
                          'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                        onClick={() => toggleAnswers(question.id)}
                      >
                        {activeQuestionId === question.id ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Answers
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show Answers ({question.answers_count || 0})
                          </>
                        )}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </button>
                        {!user?.is_admin && (
                          <button
                            className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 transition-colors text-sm"
                            onClick={() => setShowReportForm(showReportForm === question.id ? null : question.id)}
                          >
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
                      <div className="mt-4 space-y-3">
                        {answersByQuestion[question.id]?.length > 0 ? (
                          answersByQuestion[question.id].map((ans) => (
                            <div key={ans.id} className="p-4 bg-gray-50 rounded border border-gray-100">
                              <p className="text-gray-800">{ans.content}</p>
                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Answered by: {getUserName(ans.user_id)} • {new Date(ans.created_at).toLocaleString()}
                                </span>
                                <div>
                                  {ans.is_approved ? (
                                    <button
                                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                                      onClick={() => toggleAnswerApproval(ans.id, question.id, false)}
                                      disabled={loading}
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      {loading ? 'Updating...' : 'Unapprove'}
                                    </button>
                                  ) : (
                                    <button
                                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                                      onClick={() => toggleAnswerApproval(ans.id, question.id, true)}
                                      disabled={loading}
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      {loading ? 'Approving...' : 'Approve'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4">
                                <button
                                  onClick={() => toggleFollowups(ans.id)}
                                  className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  {expandedFollowups[ans.id] ? 'Hide Follow-ups' : 'Show Follow-ups'} 
                                  {followupsByAnswer[ans.id]?.length > 0 && (
                                    <span className="ml-1 text-gray-500">({followupsByAnswer[ans.id].length})</span>
                                  )}
                                </button>
                                
                                {expandedFollowups[ans.id] && (
                                  <div className="mt-2 ml-4 pl-4 border-l-2 border-emerald-200">
                                    <FollowupForm 
                                      answerId={ans.id} 
                                      onFollowupCreated={() => fetchFollowupsForAnswer(ans.id)}
                                    />
                                    
                                    {followupsByAnswer[ans.id]?.length > 0 ? (
                                      followupsByAnswer[ans.id].map(followup => (
                                        <div key={followup.id} className="p-3 my-2 bg-white rounded shadow-sm">
                                          <p className="text-gray-700">{followup.content}</p>
                                          <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">
                                              By: {getUserName(followup.user_id)} • {new Date(followup.created_at).toLocaleString()}
                                            </span>
                                            <button
                                              onClick={() => deleteFollowup(followup.id, ans.id)}
                                              className="text-xs text-red-600 hover:text-red-800"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-2 text-sm text-gray-500">
                                        No follow-ups yet
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-emerald-50 rounded border border-emerald-100 text-emerald-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No answers yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-red-100">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Report #{report.id}</h3>
                        <p className="text-gray-600 mt-1">{report.reason}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Reported by: {getUserName(report.user_id)}</p>
                          <p>Date: {new Date(report.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {report.question && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-1">Related Question:</h4>
                        <p className="text-gray-800 font-medium">{report.question.title}</p>
                        <p className="text-gray-600 text-sm mt-1">{report.question.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Language: {report.question.language} • {new Date(report.question.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                        onClick={() => deleteReport(report.id)}
                      >
                        Delete Report
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'notifications' ? (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={user.is_admin}
                              onChange={(e) => updateUserAdminStatus(user.id, e.target.checked)}
                              className="form-checkbox h-4 w-4 text-emerald-600 transition duration-150 ease-in-out"
                              disabled={loading}
                            />
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleToggleActivation(user.id, !user.is_active)}
                            disabled={loading}
                            className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-emerald-800">Frequently Asked Questions</h3>
              <button
                onClick={() => {
                  setEditingFaq(null);
                  setShowFaqForm(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Add New FAQ
              </button>
            </div>

            {showFaqForm && (
              <FaqForm
                faq={editingFaq}
                onCancel={() => {
                  setShowFaqForm(false);
                  setEditingFaq(null);
                }}
                onSubmit={editingFaq ? handleUpdateFaq : handleCreateFaq}
              />
            )}

            {filteredFaqs.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">No FAQs found</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-800">{faq.question}</h3>
                        <p className="text-gray-600 mt-2 whitespace-pre-line">{faq.answer}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Created by: {getUserName(faq.created_by)} • {new Date(faq.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 transition-colors text-sm"
                        onClick={() => {
                          setEditingFaq(faq);
                          setShowFaqForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;