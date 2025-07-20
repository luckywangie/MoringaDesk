import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const CategoryManager = () => {
  const { token, user } = useUser();

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/categories`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => setCategories(data))
      .catch((err) => {
        console.error('Error fetching categories:', err.message);
        toast.error('Failed to load categories');
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newCategory) {
      toast.error('Category name is required');
      return;
    }

    if (!user) {
      toast.error('You need to be logged in to create categories');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: newCategory }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      toast.success('Category created successfully');
      setCategories([...categories, data]);
      setNewCategory('');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      toast.error('You need to be logged in to delete categories');
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (id, name) => {
    if (!user) {
      toast.error('You need to be logged in to edit categories');
      return;
    }
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async (id) => {
    if (!editingName) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: editingName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update category');
      }

      const data = await res.json();
      toast.success('Category updated successfully');
      setCategories(
        categories.map((c) =>
          c.id === id ? data : c
        )
      );
      cancelEdit();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-200 hover:shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-green-500 bg-clip-text text-transparent">
          Categories
        </h2>

        {/* Create Form - Only shown to logged in users */}
        {user && (
          <div className="flex items-center gap-3 mb-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              disabled={loading}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !newCategory}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        )}

        {/* Categories List */}
        {loading && categories.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <p className="text-gray-600">No categories found</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
              >
                {editingId === cat.id ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      disabled={loading || !editingName}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">{cat.category_name}</span>
                    {user && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(cat.id, cat.category_name)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;