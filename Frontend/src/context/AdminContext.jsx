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
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [userDetailsCache, setUserDetailsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch all questions
  const fetchQuestions = async () => {
    if (!user?.is_admin) return;
    
    try {
      setLoading(true);
      const res = await api.get('/questions');
      setQuestions(res.data);
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
      await fetchAnswersForQuestion(questionId);
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
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      fetchCategories();
      fetchNotifications();
      fetchUsers();
    }
  }, [user]);

  return (
    <AdminContext.Provider
      value={{
        questions,
        answersByQuestion,
        followupsByAnswer,
        reports,
        categories,
        notifications,
        users,
        userDetailsCache,
        loading,
        activeTab,
        setActiveTab,
        fetchQuestions,
        fetchAnswersForQuestion,
        fetchFollowupsForAnswer,
        fetchNotifications,
        fetchUsers,
        getUserDetails,
        toggleAnswerApproval,
        createFollowup,
        deleteFollowup,
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