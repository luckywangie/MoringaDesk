import React from 'react';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">

      {/* Existing Navbar from your project will automatically render here from App.jsx layout */}

      {/* Page Content */}
      <div className="flex flex-col lg:flex-row p-6 gap-6">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 space-y-3">
          <h2 className="text-xl font-semibold">BrowseQuestions</h2>
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <button className="w-full bg-green-500 text-white px-3 py-2 rounded">Solved</button>
          <button className="w-full bg-gray-200 text-black px-3 py-2 rounded">Unsolved</button>
          <button className="w-full bg-gray-200 text-black px-3 py-2 rounded">Language</button>
          <button className="w-full bg-gray-200 text-black px-3 py-2 rounded">Category</button>
        </div>

        {/* Questions List Placeholder */}
        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full text-center text-gray-500">
            No questions available yet.
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
