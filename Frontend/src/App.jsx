import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { UserProvider } from './context/UserContext';
import { AdminProvider } from './context/AdminContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import About from './pages/About';
import CategoryManager from './pages/CategoryManager';
import AskQuestion from './pages/AskQuestion';
import Dashboard from './pages/Dashboard';
import FAQs from './pages/FAQs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import QuestionAnswer from './pages/QuestionAnswer';
import Questions from './pages/Questions';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <UserProvider>
        <AdminProvider>
          <Router>
            <div className="min-h-screen flex flex-col text-gray-800 dark:text-white transition-colors duration-300">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/ask-question" element={<AskQuestion />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/question-answer" element={<QuestionAnswer />} />
                  <Route path="/questions" element={<Questions />} />
                  <Route path="/category-manager" element={<CategoryManager />} />
                </Routes>
              </main>
              <Footer />
              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </Router>
        </AdminProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
