import React from 'react';

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section 1: About MoringaDesk */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3w5MTMyMXwwfDF8c2VhcmNofDN8fHN0dWRlbnRzJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzAwMjg3NjM0&auto=format&fit=crop&w=800&q=80"
              alt="Students solving problems"
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
              About MoringaDesk
            </h2>
            <p className="text-gray-600">
              MoringaDesk is a student-powered platform designed to simplify how technical problems are solved within Moringa School.
              It provides a central space where learners can post questions, share solutions, vote on helpful answers, and avoid duplicating issues that have already been addressed.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Our Mission */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Mission focused"
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Our Mission
            </h2>
            <p className="text-gray-600">
              To empower learners by building a collaborative ecosystem for troubleshooting, sharing ideas, and growing together through knowledge exchange.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: How It Works */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Platform usage"
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              How It Works
            </h2>
            <p className="text-gray-600">
              Students post questions, receive answers, and highlight the most useful ones. Questions are tagged and categorized, making it easy to search for solutions related to specific technologies or stages.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Why Use MoringaDesk */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Learning community"
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Why Use MoringaDesk?
            </h2>
            <p className="text-gray-600">
              Whether you're stuck on a bug, confused about a concept, or just want to share your insights, MoringaDesk helps you tap into the collective intelligence of your cohort — saving time and building teamwork.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Built By Students */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Student devs"
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Built by Students, for Students
            </h2>
            <p className="text-gray-600">
              This platform is a group project built by passionate Moringa students using React, Flask, and PostgreSQL. It reflects real-world teamwork and problem-solving in action.
            </p>
          </div>
        </div>
      </div>

      {/* Section 6: Call to Action */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-medium text-gray-900 mb-3">Want to contribute or suggest improvements?</h3>
        <p className="text-gray-600 mb-4">
          Reach out to the team or explore our GitHub repository.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          GitHub Repository
        </button>
      </div>
    </div>
  );
}

export default About;