import React from 'react';

function About() {
  return (
    <div className="bg-gray-50 min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Section 1: About MoringaDesk */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3w5MTMyMXwwfDF8c2VhcmNofDN8fHN0dWRlbnRzJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzAwMjg3NjM0&auto=format&fit=crop&w=800&q=80"
              alt="Students solving problems"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-green-600 mb-4">About MoringaDesk</h2>
            <p className="text-gray-700 text-lg">
              MoringaDesk is a student-powered platform designed to simplify how technical problems are solved within Moringa School.
              It provides a central space where learners can post questions, share solutions, vote on helpful answers, and avoid duplicating issues that have already been addressed.
            </p>
          </div>
        </div>

        {/* Section 2: Our Mission */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Mission focused"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">Our Mission</h2>
            <p className="text-gray-700 text-lg">
              To empower learners by building a collaborative ecosystem for troubleshooting, sharing ideas, and growing together through knowledge exchange.
            </p>
          </div>
        </div>

        {/* Section 3: How It Works */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Platform usage"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">How It Works</h2>
            <p className="text-gray-700 text-lg">
              Students post questions, receive answers, and highlight the most useful ones. Questions are tagged and categorized, making it easy to search for solutions related to specific technologies or stages.
            </p>
          </div>
        </div>

        {/* Section 4: Why Use MoringaDesk */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Learning community"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">Why Use MoringaDesk?</h2>
            <p className="text-gray-700 text-lg">
              Whether you're stuck on a bug, confused about a concept, or just want to share your insights, MoringaDesk helps you tap into the collective intelligence of your cohort — saving time and building teamwork.
            </p>
          </div>
        </div>

        {/* Section 5: Built By Students */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Student devs"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-green-700 mb-3">Built by Students, for Students</h2>
            <p className="text-gray-700 text-lg">
              This platform is a group project built by passionate Moringa students using React, Flask, and PostgreSQL. It reflects real-world teamwork and problem-solving in action.
            </p>
          </div>
        </div>

        {/* Section 6: Call to Action */}
        <div className="text-center mt-12">
          <p className="text-md text-gray-700">
            Want to contribute or suggest improvements? Reach out to the team or explore our GitHub repository.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
