import React from 'react';
import heroBg from '../assets/hero-bg.png'; // Make sure this image exists
import postImg from '../assets/post-question.png';
import getAnswersImg from '../assets/get-answers.png';
import collaborateImg from '../assets/collaborate.png';

function Home() {
  return (
    <div className="min-h-screen bg-pink-100 text-black">

      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        {/* Background Image */}
        <img
          src={heroBg}
          alt="Hero Background"
          className="absolute w-full h-full object-cover object-center brightness-50"
        />

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-pink-300 mb-2 drop-shadow">
            Welcome to MoringaDesk
          </h1>
          <p className="text-lg md:text-xl text-white mb-4 drop-shadow">
            "Ask questions. Share knowledge. Learn together."
          </p>
          <button className="bg-gradient-to-r from-green-400 to-pink-500 hover:from-green-500 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg">
            Get started To explore our Experience
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section className="text-center py-12 px-6">
        <h2 className="text-2xl font-bold text-pink-700 mb-8">FEATURES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center">
          <div>
            <p className="mb-2 text-pink-600 font-semibold">Post Questions</p>
            <img
              src={postImg}
              alt="Post Questions"
              className="w-full max-w-[220px] mx-auto rounded shadow-lg"
            />
          </div>
          <div>
            <p className="mb-2 text-pink-600 font-semibold">Get Answers</p>
            <img
              src={getAnswersImg}
              alt="Get Answers"
              className="w-full max-w-[220px] mx-auto rounded shadow-lg"
            />
          </div>
          <div>
            <p className="mb-2 text-pink-600 font-semibold">Collaborate</p>
            <img
              src={collaborateImg}
              alt="Collaborate"
              className="w-full max-w-[220px] mx-auto rounded shadow-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
