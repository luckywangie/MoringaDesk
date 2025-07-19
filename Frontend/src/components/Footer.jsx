import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#f72585] to-[#b5179e] text-white pt-10 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* Column 1: Branding */}
        <div>
          <h2 className="text-2xl font-bold text-white">MoringaDesk</h2>
          <p className="text-sm mt-2 text-pink-100">Helping students solve coding problems faster.</p>
          <p className="text-xs mt-4 text-pink-200">&copy; {new Date().getFullYear()} MoringaDesk. All rights reserved.</p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h3 className="font-semibold text-white mb-3">Navigation</h3>
          <ul className="space-y-2 text-pink-100">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About</Link></li>
            <li><Link to="/ask-question" className="hover:text-white transition">Ask Question</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3: User Links */}
        <div>
          <h3 className="font-semibold text-white mb-3">User</h3>
          <ul className="space-y-2 text-pink-100">
            <li><Link to="/questions" className="hover:text-white transition">Questions</Link></li>
            <li><Link to="/qna" className="hover:text-white transition">Q&A</Link></li>
            <li><Link to="/notifications" className="hover:text-white transition">Notifications</Link></li>
            <li><Link to="/profile" className="hover:text-white transition">Profile</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
            <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
