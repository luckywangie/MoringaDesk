import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-green-500 py-6 text-sm">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">

        {/* Branding Column */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">MoringaDesk</h2>
          <p className="text-indigo-100/90">Coding solutions made simple</p>
          <p className="text-xs text-indigo-100/70 pt-2">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
        </div>

        {/* Links Columns */}
        <div className="space-y-1">
          <h3 className="font-medium text-white mb-2">Navigation</h3>
          <ul className="space-y-1 text-indigo-100/90">
            {['Home', 'About', 'Ask Question', 'Dashboard', 'FAQs'].map((item) => (
              <li key={item}>
                <Link 
                  to={`/${item.toLowerCase().replace(' ', '-')}`} 
                  className="hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-white mb-2">Account</h3>
          <ul className="space-y-1 text-indigo-100/90">
            {['Questions', 'Q&A', 'Profile', 'Login', 'Sign Up'].map((item) => (
              <li key={item}>
                <Link 
                  to={`/${item.toLowerCase().replace(' ', '-')}`} 
                  className="hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 pt-4 border-t border-indigo-300/20 text-center">
        <p className="text-xs text-indigo-100/70">
          Made with <span className="text-white">❤️</span> for Moringa students
        </p>
      </div>
    </footer>
  );
}

export default Footer;