
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-wrap items-center justify-between">
      <div className="text-xl font-bold text-blue-700">MoringaDesk</div>
      <div className="flex gap-4 text-sm md:text-base text-gray-700">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/about" className="hover:text-blue-600">About</Link>
        <Link to="/ask-question" className="hover:text-blue-600">Ask Question</Link>
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/faqs" className="hover:text-blue-600">FAQs</Link>
        <Link to="/questions" className="hover:text-blue-600">Questions</Link>
        <Link to="/question-answer" className="hover:text-blue-600">Q&A</Link>
        <Link to="/notifications" className="hover:text-blue-600">Notifications</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
        <Link to="/login" className="hover:text-blue-600">Login</Link>
        <Link to="/signup" className="hover:text-blue-600">Sign Up</Link>
      </div>
    </nav>
  );
}

export default Navbar;
