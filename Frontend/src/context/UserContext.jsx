import React, { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

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

      // ✅ Mark the user as admin
      setUser({ id: 1, email: loginEmail, is_admin: true });
      setToken(dummyToken);

      toast.success('Logged in as Admin!');
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
    }
  };

  const logout_user = () => {
    setUser(null);
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
        login_user,
        logout_user,
        update_user_profile,
        delete_profile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
