import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

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
        toast.error(data.error || 'Registration failed');
        return { success: false };
      }

      toast.success(data.success || 'Registration successful');
      return { success: true, message: data.success };
    } catch (error) {
      toast.error(error.message || 'An error occurred during registration');
      return { success: false, message: error.message };
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

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.message || 'Login failed');
        return { success: false, message: data.error || data.message };
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
      toast.error(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  };

  // ✅ Google Login Handler
  const google_login_user = async (googleToken) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Google login failed');
        return false;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);

      toast.success('Google login successful');

      if (data.user?.is_admin) {
        navigate('/Admin');
      } else {
        navigate('/Dashboard');
      }

      return true;
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        updateProfile,
        deleteProfile,
        google_login_user, // ✅ Make available to Signup.jsx
        setUser,
        setToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
