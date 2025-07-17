// src/pages/QuestionAnswer.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function QuestionAnswer() {
  const { id } = useParams(); // This is the question ID
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionAndAnswer = async () => {
      try {
        const questionRes = await axios.get(`http://127.0.0.1:5000/api/questions/${id}`);
        const answerRes = await axios.get(`http://localhost:5000/api/answers/${id}`);

        setQuestion(questionRes.data);
        setAnswer(answerRes.data);
      } catch (err) {
        console.error("Error fetching question or answer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndAnswer();
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  if (!question) return <div className="text-center mt-10 text-red-500">Question not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-green-700 mb-2">{question.title}</h1>
        <p className="text-gray-800 mb-2">{question.description}</p>
        <div className="text-sm text-gray-500">
          <span>Language: {question.language}</span> |{" "}
          <span>Category ID: {question.category_id}</span> |{" "}
          <span>Posted by User ID: {question.user_id}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-black mb-4">Answer</h2>
        {!answer ? (
          <p className="text-gray-600">No answer found.</p>
        ) : (
          <div className="p-4 bg-white border rounded-md shadow-sm">
            <p className="text-black">{answer.content}</p>
            <div className="text-sm text-gray-500 mt-2">
              By User ID: {answer.user_id} | {new Date(answer.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionAnswer;
