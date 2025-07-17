import React, { useState } from 'react';

const QuestionsPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  const [questions, setQuestions] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuestion = {
      id: Date.now(),
      ...formData,
      postedAt: new Date().toLocaleString(),
    };
    setQuestions([newQuestion, ...questions]);
    setFormData({ title: '', description: '', category: '' });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Ask a Question</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-lg p-6 mb-8">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Description"
          rows="4"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="React">React</option>
          <option value="JavaScript">JavaScript</option>
          <option value="CSS">CSS</option>
          <option value="Backend">Backend</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Post Question
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions posted yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q) => (
              <li key={q.id} className="bg-gray-100 p-4 rounded shadow">
                <h3 className="text-xl font-bold">{q.title}</h3>
                <p className="text-gray-700">{q.description}</p>
                <div className="text-sm text-gray-500 mt-2">
                  Category: <span className="font-medium">{q.category}</span> | Posted at: {q.postedAt}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;
