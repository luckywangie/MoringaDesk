import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout, updateProfile, deleteProfile } = useContext(UserContext);
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(`profileImage_${user?.email}`) ||
    'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg'
  );

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

  const handleLogout = async () => {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, log me out'
    });

    if (confirmed.isConfirmed) {
      logout();
      toast.success("Logged out successfully");
    }
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
    const res = await updateProfile(user.id, { username, email });
    if (res.success) {
      setEditMode(false);
      toast.success('Profile updated!');
    } else {
      toast.error(res.message || 'Update failed.');
    }
  };

  const handleDelete = async () => {
    const confirmed = await Swal.fire({
      title: 'Delete Account?',
      text: 'This action is permanent and cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#888',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      const res = await deleteProfile(user.id);
      if (res.success) {
        toast.success('Account deleted!');
        navigate('/register');
      } else {
        toast.error(res.message || 'Failed to delete account.');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center border-2 border-green-500">
          <h2 className="text-xl font-semibold text-black mb-4">Please log in to view your profile.</h2>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row border-2 border-green-500">
        {/* Left Sidebar */}
        <div className="md:w-1/3 p-6 flex flex-col items-center border-r-2 border-pink-300 bg-gradient-to-b from-white to-pink-50">
          <img
            src={profileImage}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-3 text-sm text-black file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-400 file:text-black hover:file:bg-green-500"
          />
          <h2 className="mt-4 text-xl font-bold text-black">{user.username || 'Moringa User'}</h2>
          <p className="text-sm text-black">{user.email}</p>
          <span className={`mt-3 text-xs px-3 py-1 rounded-full font-medium ${user.is_admin ? 'bg-pink-300' : 'bg-green-300'} text-black`}>
            {user.is_admin ? 'Administrator' : 'Standard User'}
          </span>
          <button
            onClick={handleLogout}
            className="mt-6 text-sm text-black hover:text-gray-800 hover:bg-pink-200 px-4 py-2 rounded-lg w-full max-w-xs"
          >
            Logout
          </button>
        </div>

        {/* Right Section */}
        <div className="md:w-2/3 p-6 bg-gradient-to-b from-white to-green-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Profile Settings</h3>
            <button
              onClick={handleNotificationPermission}
              className={`text-sm px-3 py-1 rounded-full text-black ${notificationsEnabled ? 'bg-green-300' : 'bg-pink-300'} hover:opacity-90`}
            >
              🔔 {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
            </button>
          </div>

          {!editMode ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Username</label>
                <div className="p-3 border-2 border-green-300 rounded-lg bg-white text-black mt-1">{user.username}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Email</label>
                <div className="p-3 border-2 border-green-300 rounded-lg bg-white text-black mt-1">{user.email}</div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Username</label>
                <input
                  type="text"
                  className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-black mt-1 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Email</label>
                <input
                  type="email"
                  className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-black mt-1 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-medium"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditMode(false)} 
                  type="button" 
                  className="bg-pink-300 hover:bg-pink-400 text-black px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 border-t-2 border-red-300 pt-6">
            <h4 className="text-lg font-bold text-black mb-3">Danger Zone</h4>
            <p className="text-sm text-black mb-3">Deleting your account will remove all your data permanently.</p>
            <button
              onClick={handleDelete}
              className="bg-red-400 hover:bg-red-500 text-black px-4 py-2 rounded-lg font-medium"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
