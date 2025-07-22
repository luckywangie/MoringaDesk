import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Notifications = () => {
  const { user, token } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/notifications/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Notification API response:', res.data);

      // ✅ Ensure notifications is always an array
      const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const toggleRead = async (id, isRead) => {
    try {
      await axios.put(`https://moringadesk-ckj3.onrender.com/api/notifications/${id}`, { is_read: !isRead }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`https://moringadesk-ckj3.onrender.com/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('https://moringadesk-ckj3.onrender.com/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600">Please log in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
              My Notifications
            </h1>
            <p className="text-gray-500 mt-1">Your recent activity and alerts</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:shadow-md ${
                  n.is_read ? 'bg-white' : 'bg-indigo-50 border-indigo-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        n.is_read ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{n.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRead(n.id, n.is_read)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {n.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;