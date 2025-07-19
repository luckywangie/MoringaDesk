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
      const res = await axios.get('/api/notifications/me', {
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
      await axios.put(`/api/notifications/${id}`, { is_read: !isRead }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Please log in to view notifications.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-700">My Notifications</h2>
          <button
            onClick={markAllAsRead}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-4 border rounded-lg flex justify-between items-start shadow-sm ${
                  n.is_read ? 'bg-gray-100' : 'bg-green-50'
                }`}
              >
                <div>
                  <div className="text-sm text-gray-600 capitalize">{n.type}</div>
                  <div className="font-medium text-black">{n.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.created_at}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRead(n.id, n.is_read)}
                    className="text-xs text-green-700 hover:underline"
                  >
                    {n.is_read ? 'Mark as unread' : 'Mark as read'}
                  </button>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
