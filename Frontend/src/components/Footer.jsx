import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-700 pt-10 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* Column 1: Branding */}
        <div>
          <h2 className="text-2xl font-bold text-green-600">MoringaDesk</h2>
          <p className="text-sm mt-2">Helping students solve coding problems faster.</p>
          <p className="text-xs mt-4 text-gray-500">&copy; {new Date().getFullYear()} MoringaDesk. All rights reserved.</p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h3 className="font-semibold mb-3">Navigation</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-green-600">Home</Link></li>
            <li><Link to="/about" className="hover:text-green-600">About</Link></li>
            <li><Link to="/ask-question" className="hover:text-green-600">Ask Question</Link></li>
            <li><Link to="/dashboard" className="hover:text-green-600">Dashboard</Link></li>
            <li><Link to="/faqs" className="hover:text-green-600">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3: User Links */}
        <div>
          <h3 className="font-semibold mb-3">User</h3>
          <ul className="space-y-2">
            <li><Link to="/questions" className="hover:text-green-600">Questions</Link></li>
            <li><Link to="/qna" className="hover:text-green-600">Q&A</Link></li>
            <li><Link to="/notifications" className="hover:text-green-600">Notifications</Link></li>
            <li><Link to="/profile" className="hover:text-green-600">Profile</Link></li>
            <li><Link to="/login" className="hover:text-green-600">Login</Link></li>
            <li><Link to="/signup" className="hover:text-green-600">Sign Up</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
