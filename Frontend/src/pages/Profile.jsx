// src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout_user, update_user_profile, delete_profile } = useContext(UserContext);
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(`profileImage_${user?.email}`) ||
    'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg'
  );

  const [showDetails, setShowDetails] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    const stored = localStorage.getItem(`profileImage_${user?.email}`);
    if (stored) setProfileImage(stored);
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem(`profileImage_${user.email}`, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout_user();
    navigate('/login');
  };

  const handleNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const success = await update_user_profile(user.id, { username, email });
    if (success) {
      setEditMode(false);
    }
  };

  const handleDelete = async () => {
    await delete_profile();
    navigate('/signup');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Please log in to view your profile.</h2>
          <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-1/3 p-6 flex flex-col items-center border-r border-gray-200">
          <img
            src={profileImage}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-3 text-sm"
          />
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user.username || 'Moringa User'}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className={`mt-3 text-xs px-3 py-1 rounded-full font-medium ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
            {user.is_admin ? 'Administrator' : 'Standard User'}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-sm text-green-700 underline hover:text-green-900"
          >
            Profile Settings
          </button>
          <button
            onClick={handleLogout}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div className="md:w-2/3 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Account Details</h3>
              <button
                onClick={handleNotificationPermission}
                className="bg-gray-200 text-sm px-3 py-1 rounded-full text-gray-700 hover:bg-gray-300"
              >
                🔔 {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
              </button>
            </div>

            {!editMode ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600">Username</label>
                  <div className="p-3 border border-gray-200 rounded bg-gray-50">{user.username}</div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600">Email</label>
                  <div className="p-3 border border-gray-200 rounded bg-gray-50">{user.email}</div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600">Username</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Save Changes
                  </button>
                  <button onClick={() => setEditMode(false)} type="button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Danger Zone */}
            <div className="mt-10 border-t pt-6">
              <h4 className="text-lg text-red-700 font-semibold mb-3">Danger Zone</h4>
              <p className="text-sm text-gray-600 mb-3">Deleting your account will remove all your data permanently.</p>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
