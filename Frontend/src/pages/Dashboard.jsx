import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, token } = useContext(UserContext);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.is_admin;

  // Fetch reports for admin
  useEffect(() => {
    if (isAdmin) {
      fetch('/reports/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setReports(data);
          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load reports');
          setLoading(false);
        });
    }
  }, [isAdmin, token]);

  // Fetch categories for user reporting
  useEffect(() => {
    if (!isAdmin) {
      fetch('/categories/') // ✅ Ensure this route exists in your backend
        .then((res) => res.json())
        .then(setCategories)
        .catch(() => toast.error('Failed to load categories'));
    }
  }, [isAdmin]);

  const submitReport = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    try {
      const res = await fetch('/reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_id: selectedCategoryId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit report');
        return;
      }

      toast.success('Report submitted');
      setSelectedCategoryId('');
    } catch (err) {
      toast.error('Server error');
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;

    try {
      const res = await fetch(`/reports/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
        return;
      }

      setReports(reports.filter((r) => r.report_id !== id));
      toast.success('Report deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Dashboard</h1>

      {isAdmin ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">All Reports</h2>
          {loading ? (
            <p>Loading...</p>
          ) : reports.length === 0 ? (
            <p>No reports yet.</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => (
                <li
                  key={report.report_id}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">Category: {report.category}</p>
                    <p className="text-sm text-gray-500">Reported by: {report.reported_by}</p>
                  </div>
                  <button
                    onClick={() => deleteReport(report.report_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-medium mb-2">Submit a Report</h2>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          <button
            onClick={submitReport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
