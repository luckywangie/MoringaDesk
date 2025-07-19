import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.png';
import postImg from '../assets/post-question.png';
import getAnswersImg from '../assets/get-answers.png';
import collaborateImg from '../assets/collaborate.png';
import { FiArrowRight, FiUsers, FiMessageSquare, FiCode, FiAward, FiClock } from 'react-icons/fi';

function Home({ sidebarOpen, setSidebarOpen }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Button styles from your navbar
  const baseBtn = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  const primaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-600 to-green-500 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-green-600`;
  const secondaryBtn = `${baseBtn} bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-green-500`;

  const testimonials = [
    {
      quote: "MoringaDesk helped me solve a complex React issue in minutes that had me stuck for hours.",
      author: "Sarah K., Frontend Developer",
      role: "Cohort 45"
    },
    {
      quote: "The community support here is incredible. I've learned more from peers here than anywhere else.",
      author: "James M., Fullstack Student",
      role: "Cohort 46"
    },
    {
      quote: "As a TA, this platform makes it easy to track common student questions and provide consistent answers.",
      author: "David P., Technical Mentor",
      role: "Cohort 40-45"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Questions Answered", icon: <FiMessageSquare className="text-indigo-500" /> },
    { value: "2,500+", label: "Active Users", icon: <FiUsers className="text-green-500" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <FiAward className="text-indigo-400" /> },
    { value: "24/7", label: "Support", icon: <FiClock className="text-green-400" /> }
  ];

  return (
    <div className={`min-h-screen bg-white text-gray-900 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-3 text-gray-500 hover:text-green-600 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
          MoringaDesk
        </Link>
      </div>

 {/* Hero Section - Updated to respect sidebar space */}
<div className="relative w-full overflow-hidden">
  {/* Background with proper constraints */}
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-green-500">
    <div className="absolute inset-0 bg-black opacity-10"></div>
  </div>
  
  {/* Content container with proper margins */}
  <div className={`relative z-10 mx-auto ${sidebarOpen ? 'pl-64' : 'pl-0'} transition-all duration-200`}>
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Welcome to <span className="bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">MoringaDesk</span>
        </h1>
        <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8">
          The collaborative platform for Moringa School students
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/signup" 
            className={`${primaryBtn} flex items-center justify-center gap-2 hover:scale-105 transform transition-transform text-lg px-8 py-3`}
          >
            Get Started <FiArrowRight />
          </Link>
          <Link 
            to="/profile" 
            className={`${secondaryBtn} flex items-center justify-center gap-2 hover:scale-105 transform transition-transform text-lg px-8 py-3`}
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>
      {/* Stats Section */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-green-50">
              <div className="text-3xl font-bold mb-2 flex justify-center">
                {stat.icon}
                <span className="ml-2 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-50 to-green-50 p-4 rounded-lg mb-4 flex justify-center">
              <img
                src={postImg}
                alt="Post Questions"
                className="w-full max-w-[180px] mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Post Questions</h3>
            <p className="text-gray-600">Get help from our community of developers and mentors</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-50 to-green-50 p-4 rounded-lg mb-4 flex justify-center">
              <img
                src={getAnswersImg}
                alt="Get Answers"
                className="w-full max-w-[180px] mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Answers</h3>
            <p className="text-gray-600">Receive expert solutions to your coding challenges</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 hover:border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-50 to-green-50 p-4 rounded-lg mb-4 flex justify-center">
              <img
                src={collaborateImg}
                alt="Collaborate"
                className="w-full max-w-[180px] mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-gray-600">Work together with peers to solve complex problems</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-50 to-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            What Our Community Says
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-center mb-6">
              <FiCode className="mx-auto text-4xl text-indigo-500 mb-4" />
              <p className="text-xl italic text-gray-700 mb-4">"{testimonials[activeTestimonial].quote}"</p>
              <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</p>
              <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
            </div>
            <div className="flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${activeTestimonial === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Ready to join our community?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Thousands of developers are already helping each other and growing their skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className={`${primaryBtn} flex items-center gap-2 hover:scale-105 transform transition-transform`}
            >
              Sign Up Now <FiArrowRight />
            </Link>
            <Link 
              to="/questions" 
              className={`${baseBtn} border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2`}
            >
              Browse Questions
            </Link>
          </div>
        </div>
      </section>

    
    </div>
  );
}

export default Home;