import React from 'react';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-4">Welcome back [Username]</h1>
      <h2 className="text-xl mb-6">Recent Questions</h2>

      {/* Question cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {/* Placeholder question card x3 */}
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white border rounded shadow p-4">
            <p className="font-bold">Title</p>
            <p className="text-sm text-gray-600">AuthorName</p>
            <p className="text-sm text-gray-600">Tags</p>

            <div className="flex justify-between mt-4 text-sm text-gray-700">
              <span>Upvotes</span>
              <span>Downvotes</span>
            </div>

            <button className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-3 py-1 rounded">
              ViewDetails
            </button>
          </div>
        ))}
      </div>

      {/* Browse Questions button */}
      <div className="text-center">
        <button className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded text-lg">
          Browse Questions
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
