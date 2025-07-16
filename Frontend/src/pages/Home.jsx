import React from 'react';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-4">
          Welcome to the Home Page
        </h1>
        <p className="text-gray-700 text-lg">
          This is the homepage of our Vite React app. Explore and enjoy building!
        </p>
      </div>
    </div>
  );
}

export default Home;
