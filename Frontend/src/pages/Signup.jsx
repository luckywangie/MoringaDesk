import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const { login_user, google_login_user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm } = formData;

    if (!name || !email || !password || !confirm) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    toast.success('Signup successful!');
    await login_user(email, password);
    navigate('/dashboard');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const success = await google_login_user(token);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <img
            src="https://i.postimg.cc/NfNCngcQ/moringa-logo.png"
            alt="Moringa Logo"
            className="w-24 h-24 rounded-full border border-green-600 shadow"
          />
          <h2 className="text-xl font-bold text-green-700">MoringaDesk</h2>
        </div>

        <h3 className="text-lg font-semibold text-center text-gray-700 mb-6">Create an account</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
