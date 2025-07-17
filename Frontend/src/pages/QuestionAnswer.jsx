import React, { useState } from 'react';

const QuestionAnswerPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaList, setQaList] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      setQaList([{ question, answer }, ...qaList]);
      setQuestion('');
      setAnswer('');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Q&A Page</h1>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Post Q&A
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">All Q&As</h2>
        {qaList.length === 0 ? (
          <p className="text-gray-500">No Q&As yet.</p>
        ) : (
          <ul className="space-y-3">
            {qaList.map((item, index) => (
              <li key={index} className="bg-gray-100 p-3 rounded shadow">
                <p className="font-bold">Q: {item.question}</p>
                <p className="text-gray-700">A: {item.answer}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswerPage;
