import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function Navbar() {
  const { user, logout_user } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout_user();
    setMenuOpen(false);
    navigate('/login');
  };

  const linkClasses =
    "px-3 py-1 border border-gray-300 rounded-md hover:border-green-600 hover:bg-green-100 transition text-sm md:text-base";

  const isAdmin = user?.is_admin === true;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex flex-col items-center space-y-1">
          <img
            src="https://i.postimg.cc/NfNCngcQ/moringa-logo.png"
            alt="Moringa Logo"
            className="w-16 h-16 rounded-full border border-green-600 shadow-md"
          />
          <span className="text-green-700 font-semibold text-sm">MoringaDesk</span>
        </Link>

        <div className="hidden md:flex flex-wrap gap-2 text-gray-700 items-center">
          {!isAdmin && (
            <>
              <Link to="/" className={linkClasses}>Home</Link>
              <Link to="/about" className={linkClasses}>About</Link>
              <Link to="/ask-question" className={linkClasses}>Ask Question</Link>
            </>
          )}

          <Link to="/faqs" className={linkClasses}>FAQs</Link>

          {user && (
            <>
              <Link to="/dashboard" className={linkClasses}>Dashboard</Link>
              <Link to="/questions" className={linkClasses}>Questions</Link>
              <Link to="/question-answer" className={linkClasses}>Q&A</Link>
              <Link to="/notifications" className={linkClasses}>Notifications</Link>
              <Link to="/profile" className={linkClasses}>Profile</Link>
              {isAdmin && (
                <Link to="/category-manager" className={linkClasses}>Category Manager</Link>
              )}
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 border border-red-300 rounded-md text-red-600 hover:border-red-600 hover:bg-red-100 transition"
            >
              Logout
            </button>
          ) : (
            <Link to="/signup" className="px-3 py-1 border border-green-500 text-green-600 rounded-md hover:bg-green-100 hover:border-green-600 transition font-semibold">
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 px-4 space-y-2 text-gray-700">
          {!isAdmin && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className={linkClasses}>Home</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className={linkClasses}>About</Link>
              <Link to="/ask-question" onClick={() => setMenuOpen(false)} className={linkClasses}>Ask Question</Link>
            </>
          )}

          <Link to="/faqs" onClick={() => setMenuOpen(false)} className={linkClasses}>FAQs</Link>

          {user && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={linkClasses}>Dashboard</Link>
              <Link to="/questions" onClick={() => setMenuOpen(false)} className={linkClasses}>Questions</Link>
              <Link to="/question-answer" onClick={() => setMenuOpen(false)} className={linkClasses}>Q&A</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className={linkClasses}>Notifications</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className={linkClasses}>Profile</Link>
              {isAdmin && (
                <Link to="/category-manager" onClick={() => setMenuOpen(false)} className={linkClasses}>
                  Category Manager
                </Link>
              )}
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-100 hover:border-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-1 border border-green-500 text-green-600 rounded-md hover:bg-green-100 hover:border-green-600 transition font-semibold"
            >
              Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
