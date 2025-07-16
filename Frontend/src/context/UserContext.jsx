// src/context/UserContext.jsx
import React, { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login_user = (email, password) => {
    if (email === 'admin@moringa.com' && password === '123456') {
      const newUser = { id: 1, username: 'Admin', email, is_admin: true };
      setUser(newUser);
      toast.success('Logged in successfully!');
      return true;
    } else {
      toast.error('Invalid credentials!');
      return false;
    }
  };

  const logout_user = () => {
    setUser(null);
    toast.info('Logged out.');
  };

  const update_user_profile = async (userId, { username, email }) => {
    if (!username || !email) {
      toast.error('Username and Email are required');
      return false;
    }

    // For mock update
    setUser((prevUser) => ({ ...prevUser, username, email }));
    toast.success('Profile updated successfully!');
    return true;
  };

  const delete_profile = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      setUser(null);
      toast.success('Your account has been deleted.');
    }
  };

  return (
    <UserContext.Provider value={{ user, login_user, logout_user, update_user_profile, delete_profile }}>
      {children}
    </UserContext.Provider>
  );
};
