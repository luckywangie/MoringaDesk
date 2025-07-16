// src/components/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-white shadow-md text-center text-gray-600 py-4 mt-8">
      <p className="text-sm">&copy; {new Date().getFullYear()} MoringaDesk. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
