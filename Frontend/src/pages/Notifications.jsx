import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { currentUser, token } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Button styles matching FAQs
  const baseBtn = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  const primaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-600 to-green-500 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-green-600`;
  const secondaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-green-500`;
  const logoutBtn = `${baseBtn} bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-600`;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/notifications/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
      setNotifications(data);
      setFilteredNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  useEffect(() => {
    const results = notifications.filter(notification => 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      notification.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotifications(results);
  }, [searchTerm, notifications]);

  const toggleRead = async (id, isRead) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}`, { is_read: !isRead }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      toast.success(`Notification marked as ${isRead ? 'unread' : 'read'}`);
    } catch (err) {
      console.error('Error updating read status:', err);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Please log in</h3>
          <p className="text-gray-600">You need to log in to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 text-gray-500 hover:text-green-600 focus:outline-none transition-colors md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            My Notifications
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Notification' : 'Notifications'}
          </h2>
          <button
            onClick={markAllAsRead}
            className={`${secondaryBtn} flex items-center gap-2 hover:scale-105 transform transition-transform`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`bg-white shadow-lg hover:shadow-xl rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 transform ${
                  notification.is_read ? 'opacity-90' : 'ring-2 ring-indigo-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                        notification.is_read ? 'bg-gray-400' : 'bg-indigo-500 animate-pulse'
                      }`}></div>
                      <span className="text-sm font-medium text-indigo-600 capitalize">
                        {notification.type}
                      </span>
                    </div>
                    <div className="text-gray-800 pl-5 mb-2">{notification.message}</div>
                    <div className="text-xs text-gray-500 pl-5">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleRead(notification.id, notification.is_read)}
                      className={`${baseBtn} ${
                        notification.is_read 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white'
                      } shadow-md hover:shadow-lg hover:scale-105 transform transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {notification.is_read ? (
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        ) : (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className={`${logoutBtn} flex items-center gap-1 hover:scale-105 transform transition-all`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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