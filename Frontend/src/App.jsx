import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { AuthProvider } from './context/UserContext';
import { AdminProvider } from './context/AdminContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Admin from './pages/Admin';
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
import RelatedQuestions from './pages/RelatedQuestions';
import Analytics from './pages/Analytics';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword'; 

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AdminProvider>
            <div className="min-h-screen flex flex-col bg-white text-black transition-colors duration-300">
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
                  <Route path="/questions/:id" element={<QuestionAnswer />} />
                  <Route path="/questions" element={<Questions />} />
                  <Route path="/category-manager" element={<CategoryManager />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/related-questions" element={<RelatedQuestions />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  {/* Add these new routes */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </main>

              <Footer />

              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </div>
          </AdminProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;