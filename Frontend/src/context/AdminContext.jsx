import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from './UserContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, token } = useUser();
  const [questions, setQuestions] = useState([]);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [followupsByAnswer, setFollowupsByAnswer] = useState({});
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [userDetailsCache, setUserDetailsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const [questionDetailsCache, setQuestionDetailsCache] = useState({});

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch question details
  const fetchQuestionDetails = async (questionId) => {
    try {
      const res = await api.get(`/questions/${questionId}`);
      setQuestionDetailsCache(prev => ({
        ...prev,
        [questionId]: res.data
      }));
      return res.data;
    } catch (error) {
      console.error('Error fetching question details:', error);
      return null;
    }
  };

  // Fetch all questions with answers count
  const fetchQuestions = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/questions');
      // Calculate answers count for each question
      const questionsWithDetails = await Promise.all(res.data.map(async (question) => {
        const questionDetails = await fetchQuestionDetails(question.id);
        const answersRes = await api.get(`/questions/${question.id}/answers`);
        return {
          ...questionDetails,
          answers_count: answersRes.data.length
        };
      }));
      setQuestions(questionsWithDetails);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch questions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch answers for a question
  const fetchAnswersForQuestion = async (questionId) => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/questions/${questionId}/answers`);
      setAnswersByQuestion(prev => ({ ...prev, [questionId]: res.data }));
    } catch (error) {
      console.error('Error fetching answers:', error);
      toast.error('Failed to fetch answers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch followups for an answer
  const fetchFollowupsForAnswer = async (answerId) => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/followups?answer_id=${answerId}`);
      setFollowupsByAnswer(prev => ({ ...prev, [answerId]: res.data }));
    } catch (error) {
      console.error('Error fetching followups:', error);
      toast.error('Failed to fetch followups');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all FAQs
  const fetchFaqs = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/faqs');
      setFaqs(res.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Create FAQ
  const createFaq = async (faqData) => {
    try {
      setLoading(true);
      const res = await api.post('/faqs', faqData);
      setFaqs(prev => [...prev, res.data.faq]);
      toast.success('FAQ created successfully');
      return true;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to create FAQ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update FAQ
  const updateFaq = async (id, faqData) => {
    try {
      setLoading(true);
      const res = await api.put(`/faqs/${id}`, faqData);
      setFaqs(prev => prev.map(faq => 
        faq.id === id ? res.data.faq : faq
      ));
      toast.success('FAQ updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to update FAQ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const deleteFaq = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/faqs/${id}`);
      setFaqs(prev => prev.filter(faq => faq.id !== id));
      toast.success('FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
      // Cache user details
      const cache = {};
      res.data.forEach(u => {
        cache[u.id] = u;
      });
      setUserDetailsCache(cache);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Get user details (from cache or API)
  const getUserDetails = async (userId) => {
    if (userDetailsCache[userId]) {
      return userDetailsCache[userId];
    }
    
    try {
      const res = await api.get(`/users/${userId}`);
      setUserDetailsCache(prev => ({
        ...prev,
        [userId]: res.data
      }));
      return res.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { username: 'Unknown', email: '', is_admin: false };
    }
  };

  // Toggle answer approval status
  const toggleAnswerApproval = async (answerId, questionId, shouldApprove) => {
    if (!user?.is_admin) {
      toast.error('Admin privileges required');
      return;
    }
    
    try {
      setLoading(true);
      await api.put(`/answers/${answerId}/is_approved`, { is_approved: shouldApprove });
      // Update the answer in the state
      setAnswersByQuestion(prev => ({
        ...prev,
        [questionId]: prev[questionId].map(answer => 
          answer.id === answerId ? { ...answer, is_approved: shouldApprove } : answer
        )
      }));
      toast.success(`Answer ${shouldApprove ? 'approved' : 'unapproved'}!`);
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast.error(error.response?.data?.message || `Failed to ${shouldApprove ? 'approve' : 'unapprove'} answer`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new followup
  const createFollowup = async (answerId, content) => {
    try {
      setLoading(true);
      const res = await api.post('/followups', {
        answer_id: answerId,
        content: content
      });
      
      setFollowupsByAnswer(prev => ({
        ...prev,
        [answerId]: [...(prev[answerId] || []), res.data.followup]
      }));
      
      toast.success('Follow-up added!');
      return true;
    } catch (error) {
      console.error('Error creating followup:', error);
      toast.error('Failed to add follow-up');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a followup
  const deleteFollowup = async (followupId, answerId) => {
    try {
      setLoading(true);
      await api.delete(`/followups/${followupId}`);
      setFollowupsByAnswer(prev => ({
        ...prev,
        [answerId]: prev[answerId].filter(f => f.id !== followupId)
      }));
      toast.success('Follow-up deleted');
    } catch (error) {
      console.error('Error deleting followup:', error);
      toast.error('Failed to delete follow-up');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all reports
  const fetchReports = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/reports');
      // Fetch question details for each report
      const reportsWithQuestions = await Promise.all(res.data.map(async report => {
        let question = null;
        if (report.question_id) {
          question = questionDetailsCache[report.question_id] || await fetchQuestionDetails(report.question_id);
        }
        return {
          ...report,
          question
        };
      }));
      setReports(reportsWithQuestions);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Create a report for a question
  const createReport = async (questionId, categoryId, reason) => {
    try {
      setLoading(true);
      const res = await api.post('/reports', {
        question_id: questionId,
        category_id: categoryId,
        reason: reason
      });
      toast.success('Question reported successfully');
      return true;
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error(error.response?.data?.message || 'Failed to report question');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a report
  const deleteReport = async (reportId) => {
    try {
      setLoading(true);
      await api.delete(`/reports/${reportId}`);
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Report deleted');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  // Delete a question
  const deleteQuestion = async (questionId) => {
    try {
      setLoading(true);
      await api.delete(`/questions/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success('Question deleted');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  // Update user admin status
  const updateUserAdminStatus = async (userId, isAdmin) => {
    try {
      setLoading(true);
      await api.put(`/users/${userId}/admin`, { is_admin: isAdmin });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: isAdmin } : u
      ));
      setUserDetailsCache(prev => ({
        ...prev,
        [userId]: { ...prev[userId], is_admin: isAdmin }
      }));
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      fetchQuestions();
      fetchReports();
      fetchNotifications();
      fetchUsers();
      fetchFaqs();
    }
  }, [user]);

  return (
    <AdminContext.Provider
      value={{
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
        fetchQuestions,
        fetchAnswersForQuestion,
        fetchFollowupsForAnswer,
        fetchNotifications,
        fetchUsers,
        fetchFaqs,
        createFaq,
        updateFaq,
        deleteFaq,
        getUserDetails,
        toggleAnswerApproval,
        createFollowup,
        deleteFollowup,
        createReport,
        deleteReport,
        deleteQuestion,
        deleteNotification,
        updateUserAdminStatus,
        deleteUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);