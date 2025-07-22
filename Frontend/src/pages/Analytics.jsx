import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
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

const Analytics = () => {
  const { token } = useUser();
  const [allQuestions, setAllQuestions] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [topContributors, setTopContributors] = useState([]);
  const [topLanguages, setTopLanguages] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [mostEncounteredProblems, setMostEncounteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [usernamesLoaded, setUsernamesLoaded] = useState(false);

  // Fetch user data and cache it
  const fetchUserData = async (userId) => {
    if (!userId) return null;
    try {
      const res = await axios.get(`https://moringadesk-ckj3.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserMap(prev => ({ ...prev, [userId]: res.data }));
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch user ${userId}:`, err);
      return null;
    }
  };

  // Fetch questions by a specific user
  const fetchUserQuestions = async (userId) => {
    try {
      const res = await axios.get(`https://moringadesk-ckj3.onrender.com/api/questions?user_id=${userId}`);
      setUserQuestions(res.data);
    } catch (err) {
      console.error(`Failed to fetch questions for user ${userId}:`, err);
      setUserQuestions([]);
    }
  };

  // Handle user profile click
  const handleUserClick = async (userId) => {
    const user = userMap[userId];
    if (user) {
      setSelectedUser(user);
      await fetchUserQuestions(userId);
    }
  };

  // Close the user profile modal
  const closeModal = () => {
    setSelectedUser(null);
    setUserQuestions([]);
  };

  // Fetch all questions and related data
  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch questions with no filters to get all questions
      const questionsRes = await axios.get('https://moringadesk-ckj3.onrender.com/api/questions');
      setAllQuestions(questionsRes.data);
      
      // Get unique user IDs from questions
      const userIds = [...new Set(questionsRes.data.map(q => q.user_id).filter(Boolean))];
      
      // Fetch all usernames in parallel
      const usernamePromises = userIds.map(userId => fetchUserData(userId));
      await Promise.all(usernamePromises);
      
      // Mark usernames as loaded
      setUsernamesLoaded(true);
      
      // Calculate all statistics
      calculateStats(questionsRes.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate all statistics
  const calculateStats = (questions) => {
    calculateContributors(questions);
    calculateLanguages(questions);
    calculateTopQuestions(questions);
    calculateProblems(questions);
  };

  // Calculate top contributors with usernames
  const calculateContributors = (questions) => {
    const contributorCounts = {};
    
    // Count questions per user
    questions.forEach(q => {
      if (!q.user_id) return;
      contributorCounts[q.user_id] = (contributorCounts[q.user_id] || 0) + 1;
    });
    
    // Sort by question count (descending)
    const sortedContributors = Object.entries(contributorCounts)
      .sort((a, b) => b[1] - a[1]);
    
    // Map to usernames and format for display
    const formattedContributors = sortedContributors
      .map(([userId, count]) => {
        const userData = userMap[userId];
        return {
          userId,
          username: userData?.username || 'Loading...',
          count,
          userData
        };
      })
      .slice(0, 10);
    
    setTopContributors(formattedContributors);
  };

  // Calculate language statistics
  const calculateLanguages = (questions) => {
    const languageCounts = {};
    
    questions.forEach(q => {
      const lang = (q.language || 'Unknown').trim().toLowerCase();
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
    
    // Normalize language names
    const normalizedLanguages = {};
    Object.entries(languageCounts).forEach(([lang, count]) => {
      const normalizedLang = lang.charAt(0).toUpperCase() + lang.slice(1);
      normalizedLanguages[normalizedLang] = (normalizedLanguages[normalizedLang] || 0) + count;
    });
    
    // Sort by count (descending)
    const sortedLanguages = Object.entries(normalizedLanguages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    setTopLanguages(sortedLanguages);
  };

  // Calculate top questions
  const calculateTopQuestions = (questions) => {
    const questionCounts = {};
    
    questions.forEach(q => {
      const key = `${q.language || 'Unknown'} - ${q.title}`.toLowerCase();
      questionCounts[key] = (questionCounts[key] || 0) + 1;
    });
    
    // Sort by count (descending) and normalize language names
    const sortedQuestions = Object.entries(questionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [lang, ...titleParts] = key.split(' - ');
        const normalizedLang = lang.charAt(0).toUpperCase() + lang.slice(1);
        return [`${normalizedLang} - ${titleParts.join(' - ')}`, count];
      })
      .slice(0, 10);
    
    setTopQuestions(sortedQuestions);
  };

  // Enhanced problem detection
  const calculateProblems = (questions) => {
    const problemCounts = {};
    const errorPatterns = [
      { pattern: /error/i, category: 'Errors' },
      { pattern: /exception/i, category: 'Exceptions' },
      { pattern: /not working|not function/i, category: 'Functionality Issues' },
      { pattern: /install|setup/i, category: 'Installation/Setup' },
      { pattern: /performance|slow|lag/i, category: 'Performance Issues' },
      { pattern: /compatib|version/i, category: 'Compatibility Issues' },
      { pattern: /syntax|parse/i, category: 'Syntax Issues' },
      { pattern: /import|export/i, category: 'Import/Export Issues' },
      { pattern: /api|endpoint/i, category: 'API Issues' },
      { pattern: /undefined|null/i, category: 'Null/Undefined Issues' },
      { pattern: /crash|break/i, category: 'Crash Issues' },
      { pattern: /memory|leak/i, category: 'Memory Issues' },
      { pattern: /network|request|fetch/i, category: 'Network Issues' },
      { pattern: /database|db|query/i, category: 'Database Issues' },
      { pattern: /authentication|auth|login/i, category: 'Auth Issues' },
      { pattern: /permission|access/i, category: 'Permission Issues' },
      { pattern: /security|vulnerability/i, category: 'Security Issues' },
      { pattern: /dependency|package/i, category: 'Dependency Issues' },
      { pattern: /build|compile/i, category: 'Build Issues' },
      { pattern: /deploy|server/i, category: 'Deployment Issues' },
    ];

    questions.forEach(q => {
      const title = q.title.toLowerCase();
      const description = q.description ? q.description.toLowerCase() : '';
      let problemFound = false;

      // Check against all patterns
      for (const { pattern, category } of errorPatterns) {
        if (pattern.test(title) || pattern.test(description)) {
          problemCounts[category] = (problemCounts[category] || 0) + 1;
          problemFound = true;
          break; // Stop at first match
        }
      }

      // If no specific problem found, categorize based on solved status
      if (!problemFound) {
        const category = q.is_solved ? 'Solved - Other Issues' : 'Unsolved - Other Issues';
        problemCounts[category] = (problemCounts[category] || 0) + 1;
      }
    });

    // Sort by count (descending)
    const sortedProblems = Object.entries(problemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Get top 10 problems
    
    setMostEncounteredProblems(sortedProblems);
  };

  // Recalculate contributors when usernames are loaded
  useEffect(() => {
    if (usernamesLoaded && allQuestions.length > 0) {
      calculateContributors(allQuestions);
    }
  }, [usernamesLoaded, userMap]);

  // Fetch data on component mount or when token changes
  useEffect(() => {
    if (token) {
      fetchAllQuestions();
    }
  }, [token]);

  // Chart data for languages
  const langChartData = {
    labels: topLanguages.map(([lang]) => lang),
    datasets: [{
      label: 'Questions per Language',
      data: topLanguages.map(([, count]) => count),
      backgroundColor: '#4f46e5',
      borderRadius: 8,
    }],
  };

  // Chart data for top questions
  const questionChartData = {
    labels: topQuestions.map(([q]) => q),
    datasets: [{
      label: 'Top Questions',
      data: topQuestions.map(([, count]) => count),
      backgroundColor: '#10b981',
      borderRadius: 8,
    }],
  };

  // Chart data for most encountered problems
  const problemsChartData = {
    labels: mostEncounteredProblems.map(([problem]) => problem),
    datasets: [{
      label: 'Most Encountered Problems',
      data: mostEncounteredProblems.map(([, count]) => count),
      backgroundColor: [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6',
        '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'
      ],
      borderRadius: 8,
    }],
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Analytics</h1>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                {selectedUser.profile_image ? (
                  <img 
                    src={selectedUser.profile_image} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-indigo-100">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-800">{selectedUser.username}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                {selectedUser.is_admin && (
                  <span className="mt-2 px-2 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Questions Asked: {userQuestions.length}</h4>
                {userQuestions.length > 0 ? (
                  <ul className="space-y-2">
                    {userQuestions.slice(0, 5).map(question => (
                      <li key={question.id} className="text-sm text-gray-600 truncate">
                        {question.title}
                      </li>
                    ))}
                    {userQuestions.length > 5 && (
                      <li className="text-sm text-indigo-600">+ {userQuestions.length - 5} more</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No questions asked yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Contributors Section */}
        <section className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Contributors</h2>
          <div className="bg-white rounded-lg shadow p-4 h-full">
            {topContributors.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {topContributors.map((contributor, index) => (
                  <li key={contributor.userId} className="py-3 flex justify-between items-center">
                    <button
                      onClick={() => handleUserClick(contributor.userId)}
                      className="flex items-center hover:text-indigo-600 transition-colors"
                    >
                      {contributor.userData?.profile_image ? (
                        <img 
                          src={contributor.userData.profile_image} 
                          alt={contributor.username}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium">
                        {contributor.username}
                        {index < 3 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">
                            #{index + 1}
                          </span>
                        )}
                      </span>
                    </button>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {contributor.count} {contributor.count === 1 ? 'question' : 'questions'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No contributor data available</p>
            )}
          </div>
        </section>

        {/* Most Asked Languages Section */}
        <section className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Asked Languages</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <Bar 
              data={langChartData} 
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y} questions`
                    }
                  }
                }
              }} 
            />
          </div>
        </section>

        {/* Most Encountered Problems Section */}
        <section className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Encountered Problems</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <Bar 
              data={problemsChartData} 
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y} occurrences`
                    }
                  }
                }
              }} 
            />
          </div>
        </section>

        {/* Most Asked Questions Section */}
        <section className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Asked Questions by Language</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <Bar 
              data={questionChartData} 
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y} occurrences`
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }} 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;