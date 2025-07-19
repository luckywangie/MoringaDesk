import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    setMenuOpen(false);
    navigate('/login');
  };

  const isAdmin = user?.is_admin === true;

  // ✅ Figma-inspired button styles
  const baseBtn =
    'px-4 py-2 text-white font-bold rounded-sm transition duration-200 text-sm md:text-base';
  const pinkBtn = `${baseBtn} bg-[#ff007f] hover:bg-[#e60073]`;     // Home / FAQs
  const darkPinkBtn = `${baseBtn} bg-[#d10072] hover:bg-[#b80066]`; // GetStarted
  const logoutBtn = 'px-4 py-2 font-bold rounded-sm transition duration-200 text-sm md:text-base bg-white text-red-600 hover:bg-red-600 hover:text-white';

  return (
    <nav className="bg-gradient-to-r from-[#f72585] to-[#b5179e] text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo and Title */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://i.postimg.cc/NfNCngcQ/moringa-logo.png"
            alt="Moringa Logo"
            className="w-10 h-10 rounded-full border-2 border-white shadow"
          />
          <span className="text-lg font-bold">MoringaDesk</span>
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex flex-wrap gap-3 items-center">
          {!isAdmin && (
            <>
              <Link to="/" className={pinkBtn}>Home</Link>
              <Link to="/faqs" className={pinkBtn}>FAQs</Link>
              {user && <Link to="/ask-question" className={darkPinkBtn}>GetStarted</Link>}
            </>
          )}

          {user && (
            <>
              {!isAdmin && (
                <Link to="/dashboard" className={pinkBtn}>Dashboard</Link>
              )}
              <Link to="/questions" className={pinkBtn}>Questions</Link>
              <Link to="/notifications" className={pinkBtn}>Notifications</Link>
              <Link to="/profile" className={pinkBtn}>Profile</Link>
              {isAdmin && (
                <>
                  <Link to="/admin" className={pinkBtn}>Admin</Link>
                  <Link to="/related-questions" className={pinkBtn}>Related Questions</Link>
                </>
              )}
            </>
          )}

          {user ? (
            <button onClick={handleLogout} className={logoutBtn}>Logout</button>
          ) : (
            <Link to="/signup" className={darkPinkBtn}>GetStarted</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden mt-4 px-4 space-y-2">
          {!isAdmin && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className={pinkBtn}>Home</Link>
              <Link to="/faqs" onClick={() => setMenuOpen(false)} className={pinkBtn}>FAQs</Link>
              {user && (
                <Link to="/ask-question" onClick={() => setMenuOpen(false)} className={darkPinkBtn}>
                  GetStarted
                </Link>
              )}
            </>
          )}

          {user && (
            <>
              {!isAdmin && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={pinkBtn}>Dashboard</Link>
              )}
              <Link to="/questions" onClick={() => setMenuOpen(false)} className={pinkBtn}>Questions</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className={pinkBtn}>Notifications</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className={pinkBtn}>Profile</Link>
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className={pinkBtn}>Admin</Link>
                  <Link to="/related-questions" onClick={() => setMenuOpen(false)} className={pinkBtn}>Related Questions</Link>
                </>
              )}
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 font-bold rounded-sm bg-white text-red-600 hover:bg-red-600 hover:text-white transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className={darkPinkBtn + " block w-full text-center"}
            >
              GetStarted
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
