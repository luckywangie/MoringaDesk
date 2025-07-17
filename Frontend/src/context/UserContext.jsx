<<<<<<< Updated upstream
import React, { createContext, useState } from 'react';
=======
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

<<<<<<< Updated upstream
  const DEFAULT_TEST_EMAIL = 'test@moringa.com';
  const DEFAULT_TEST_PASSWORD = '1234';

  const login_user = async (email, password) => {
    const loginEmail = email || DEFAULT_TEST_EMAIL;
    const loginPassword = password || DEFAULT_TEST_PASSWORD;

    if (
      loginEmail === DEFAULT_TEST_EMAIL &&
      loginPassword === DEFAULT_TEST_PASSWORD
    ) {
      const dummyToken = 'fake-jwt-token';
=======
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const navigate = useNavigate();

  // Register
  const register = async ({ username, email, password }) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || data.error || 'Registration failed';
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }

      toast.success(data.success || 'Registration successful');
      navigate('/login'); // redirect after successful registration

      return { success: true, message: data.success };
    } catch (error) {
      const msg = error.message || 'An error occurred during registration';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
>>>>>>> Stashed changes

      // ✅ Mark the user as admin
      setUser({ id: 1, email: loginEmail, is_admin: true });
      setToken(dummyToken);

<<<<<<< Updated upstream
      toast.success('Logged in as Admin!');
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
=======
      if (!res.ok) {
        const errorMsg = data.error || data.message || 'Login failed';
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);

      toast.success(data.message || 'Login successful');

      if (data.user?.is_admin) {
        navigate('/Admin');
      } else {
        navigate('/Dashboard');
      }

      return { success: true };
    } catch (error) {
      const msg = error.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
>>>>>>> Stashed changes
    }
  };

  const logout_user = () => {
    setUser(null);
<<<<<<< Updated upstream
    setToken(null);
    toast.info('Logged out.');
  };

  const update_user_profile = async (userId, { username, email }) => {
    toast.info('This feature is disabled in test mode.');
    return false;
  };

  const delete_profile = async () => {
    if (!user || !token) {
      toast.error('You must be logged in.');
      return;
=======
    setToken('');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Update profile
  const updateProfile = async (userId, updatedData) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Update failed');

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      toast.success(data.message || 'Profile updated');
      return { success: true, user: data.user };
    } catch (error) {
      toast.error(error.message || 'Update failed');
      return { success: false, message: error.message };
    }
  };

  // Delete profile
  const deleteProfile = async (userId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Delete failed');

      logout();
      toast.success(data.message || 'Profile deleted');
      return { success: true, message: data.message };
    } catch (error) {
      toast.error(error.message || 'Delete failed');
      return { success: false, message: error.message };
>>>>>>> Stashed changes
    }

    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;

    setUser(null);
    setToken(null);
    toast.success('Your account has been deleted (test mode).');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
<<<<<<< Updated upstream
        login_user,
        logout_user,
        update_user_profile,
        delete_profile,
=======
        login,
        logout,
        register,
        updateProfile,
        deleteProfile,
>>>>>>> Stashed changes
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
