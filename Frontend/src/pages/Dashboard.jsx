import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user, token } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) {
      toast.error('Please login to access the dashboard');
      navigate('/login');
    }
  }, [user, token, navigate]);

  const [allQuestions, setAllQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [filteredMyQuestions, setFilteredMyQuestions] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState({
    questions: true,
    users: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [languageFilter, setLanguageFilter] = useState('');
  const [solvedFilter, setSolvedFilter] = useState('all');

  // Fetch user data and cache it
  const fetchUserData = async (userId) => {
    if (userMap[userId]) return userMap[userId];
    
    try {
      const res = await axios.get(`https://moringadesk-ckj3.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserMap(prev => ({ ...prev, [userId]: res.data.username }));
      return res.data.username;
    } catch (err) {
      console.error(`Failed to fetch user ${userId}:`, err);
      return `User #${userId}`;
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/questions');
      setAllQuestions(res.data);
      
      const uniqueUserIds = [...new Set(res.data.map(q => q.user_id))];
      await Promise.all(uniqueUserIds.map(fetchUserData));
      
      calculateTopContributors(res.data);
    } catch (err) {
      toast.error('Failed to fetch all questions');
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  const fetchUserQuestions = async () => {
    try {
      const res = await axios.get('https://moringadesk-ckj3.onrender.com/api/questions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userQs = res.data.filter(q => q.user_id === user.id);
      setMyQuestions(userQs);
      setFilteredMyQuestions(userQs);
    } catch (err) {
      toast.error('Failed to fetch your questions');
    }
  };

  const calculateTopContributors = async (questions) => {
    const countByUser = {};
    questions.forEach(q => {
      countByUser[q.user_id] = (countByUser[q.user_id] || 0) + 1;
    });

    const sortedUsers = Object.entries(countByUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const contributorsWithNames = await Promise.all(
      sortedUsers.map(async ([userId, count]) => {
        const username = await fetchUserData(userId);
        return { username, count, userId };
      })
    );

    setTopContributors(contributorsWithNames);
  };

  useEffect(() => {
    if (user && token) {
      setLoading({ questions: true, users: true });
      Promise.all([fetchUserQuestions(), fetchAllQuestions()])
        .finally(() => setLoading(prev => ({ ...prev, users: false })));
    }
  }, [user, token]);

  useEffect(() => {
    let filtered = [...myQuestions];

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (languageFilter) {
      filtered = filtered.filter(q =>
        q.language?.toLowerCase() === languageFilter.toLowerCase()
      );
    }

    if (solvedFilter === 'solved') {
      filtered = filtered.filter(q => q.is_solved === true);
    } else if (solvedFilter === 'unsolved') {
      filtered = filtered.filter(q => !q.is_solved || q.is_solved === null);
    }

    filtered = filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );

    setFilteredMyQuestions(filtered);
  }, [myQuestions, searchTerm, languageFilter, solvedFilter, sortOrder]);

  const chartData = {
    labels: ['You', 'Others'],
    datasets: [
      {
        label: 'Number of Questions',
        data: [myQuestions.length, allQuestions.length - myQuestions.length],
        backgroundColor: ['#4f46e5', '#10b981'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Questions Asked: You vs Others',
        font: {
          size: 16,
          family: 'Inter'
        },
        color: '#374151'
      },
    },
    scales: {
      y: {
        grid: {
          drawBorder: false,
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        }
      }
    }
  };

  if (!user || !token) {
    return null; // or a loading spinner while redirect happens
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
            Welcome back, {user?.username}
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your questions</p>
        </div>
        <button
          onClick={() => navigate('/ask-question')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ask a New Question
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar - Stats and filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filter My Questions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search my questions..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg"
                >
                  <option value="">All Languages</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="c++">C++</option>
                  <option value="ruby">Ruby</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={solvedFilter}
                  onChange={e => setSolvedFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg"
                >
                  <option value="all">All Questions</option>
                  <option value="solved">Solved Only</option>
                  <option value="unsolved">Unsolved Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              My Stats
            </h2>
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top Contributors
            </h2>
            <div className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div
                  key={contributor.userId}
                  className={`flex items-center p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 shadow-sm'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm'
                      : 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 shadow-inner ${
                    index === 0 ? 'bg-yellow-200 text-yellow-800' : 
                    index === 1 ? 'bg-gray-200 text-gray-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{contributor.username}</p>
                    <p className="text-sm text-gray-600">{contributor.count} questions</p>
                  </div>
                  {index === 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content - My Questions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                My Questions ({filteredMyQuestions.length})
              </h2>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                Showing {filteredMyQuestions.length} of {myQuestions.length} questions
              </div>
            </div>

            {filteredMyQuestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">
                  {myQuestions.length === 0 
                    ? "You haven't posted any questions yet." 
                    : "No questions match your filters."}
                </p>
                {myQuestions.length === 0 && (
                  <button
                    onClick={() => navigate('/ask-question')}
                    className="bg-gradient-to-r from-indigo-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    Ask Your First Question
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMyQuestions.map(q => (
                  <div 
                    key={q.id} 
                    className="border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:shadow-md cursor-pointer hover:border-indigo-200 group"
                    onClick={() => navigate(`/questions/${q.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 truncate">{q.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Posted on {new Date(q.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-3">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          q.is_solved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {q.is_solved ? 'Solved' : 'Unsolved'}
                        </span>
                        <span className="px-2.5 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                          {q.language || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600 line-clamp-2">
                      {q.description}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View question
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Questions (simplified view) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Community Questions
            </h2>
            {loading.questions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {allQuestions.slice(0, 5).map(q => (
                    <div 
                      key={q.id} 
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0 cursor-pointer transition-all duration-150 hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg"
                      onClick={() => navigate(`/questions/${q.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{q.title}</p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <span>{q.language || 'Unknown'} • </span>
                            <span className="ml-1">{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full ml-3 whitespace-nowrap">
                          {userMap[q.user_id] || `User #${q.user_id}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {allQuestions.length > 5 && (
                  <button 
                    className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline flex items-center gap-1 transition-all duration-200"
                    onClick={() => navigate('/questions')}
                  >
                    View all {allQuestions.length} community questions
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;