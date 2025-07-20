import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.is_admin && location.pathname === '/dashboard') {
      navigate('/admin');
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    setMenuOpen(false);
    setSidebarOpen(false);
    navigate('/login');
  };

  const isAdmin = user?.is_admin === true;

  const baseBtn = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  const primaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-600 to-green-500 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-green-600`;
  const secondaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-green-500`;
  const logoutBtn = `${baseBtn} bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-600`;

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-gradient-to-r from-indigo-50 to-green-50 text-indigo-700 border-l-4 border-green-500' 
      : 'text-gray-700 hover:bg-gray-50';
  };

  // Regular user links
  const userLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/questions', name: 'Community Qs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { path: '/profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { path: '/about', name: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  // Admin links - added notifications and profile
  const adminLinks = [
    { path: '/admin', name: 'Admin Dashboard', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { path: '/admin/analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/category-manager', name: 'Categories', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path: '/related-questions', name: 'Related Questions', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { path: '/notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { path: '/profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  const currentLinks = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo and Title with Sidebar Toggle */}
        <div className="flex items-center">
          {user && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-3 text-gray-500 hover:text-green-600 focus:outline-none transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="https://i.postimg.cc/NfNCngcQ/moringa-logo.png"
              alt="Moringa Logo"
              className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:shadow-lg transition-shadow duration-200"
            />
            <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
              MoringaDesk
            </span>
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex flex-wrap gap-3 items-center">
          {!isAdmin && (
            <>
              <Link to="/" className={`${baseBtn} text-gray-700 hover:bg-gray-100 px-3 py-1.5`}>
                Home
              </Link>
              <Link to="/faqs" className={`${baseBtn} text-gray-700 hover:bg-gray-100 px-3 py-1.5`}>
                FAQs
              </Link>
              <Link to="/about" className={`${baseBtn} text-gray-700 hover:bg-gray-100 px-3 py-1.5`}>
                About
              </Link>
              {user && (
                <Link to="/ask-question" className={`${secondaryBtn} flex items-center gap-1 transform hover:-translate-y-0.5`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ask Question
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-medium bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
                {isAdmin ? 'Admin' : 'Welcome'}, {user.username}
              </span>
              <button 
                onClick={handleLogout} 
                className={`${logoutBtn} flex items-center gap-1`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/signup" className={`${primaryBtn} flex items-center gap-1 transform hover:-translate-y-0.5`}>
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 focus:outline-none hover:bg-gray-100 p-2 rounded-lg transition-colors"
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

      {/* Sidebar Navigation - Only show when user is logged in */}
      {user && sidebarOpen && (
        <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 pt-20 px-4 pb-4 overflow-y-auto shadow-sm">
          <nav className="space-y-1">
            {currentLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-r-lg ${isActive(link.path)} transition-colors duration-200 group`}
              >
                <div className={`p-2 mr-3 rounded-lg bg-gradient-to-r ${isActive(link.path).includes('indigo') 
                  ? 'from-indigo-100 to-green-100 text-indigo-600' 
                  : 'from-gray-100 to-gray-200 text-gray-600 group-hover:from-indigo-100 group-hover:to-green-100 group-hover:text-indigo-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                </div>
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}

            {/* Logout in Sidebar */}
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 rounded-r-lg text-gray-700 hover:bg-red-50 transition-colors duration-200 group`}
            >
              <div className="p-2 mr-3 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 group-hover:from-red-100 group-hover:to-pink-100 group-hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 px-4 space-y-2 pb-4">
          {!isAdmin && (
            <>
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/faqs" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                FAQs
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                About
              </Link>
              {user && (
                <Link 
                  to="/ask-question" 
                  onClick={() => setMenuOpen(false)} 
                  className={`${secondaryBtn} flex items-center gap-1 w-full text-center justify-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ask Question
                </Link>
              )}
            </>
          )}

          {/* Mobile Navigation Links - Only show when user is logged in */}
          {user && (
            <div className="pt-2">
              {currentLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg ${isActive(link.path)} transition-colors duration-200`}
                >
                  <svg 
                    className={`w-5 h-5 mr-3 ${isActive(link.path).includes('indigo') ? 'text-green-500' : 'text-gray-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Logout/Login */}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className={`${logoutBtn} flex items-center gap-1 w-full justify-center mt-4`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setMenuOpen(false)} 
              className={`${primaryBtn} flex items-center gap-1 w-full justify-center mt-4`}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;