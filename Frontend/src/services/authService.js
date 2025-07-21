import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Update with your backend URL

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Failed to send reset email'
    );
  }
};

const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { 
      token, 
      password 
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Failed to reset password'
    );
  }
};

export { forgotPassword, resetPassword };