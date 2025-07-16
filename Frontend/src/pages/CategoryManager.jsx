import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';

const CategoryManager = () => {
  const { token } = useContext(UserContext);
  const { isAdmin } = useContext(AdminContext);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // ✅ Only fetch categories if user is an admin
  useEffect(() => {
    if (!isAdmin) return;

    fetch('/api/categories/')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(setCategories)
      .catch((err) => {
        console.error('Error fetching categories:', err.message);
        toast.error('Failed to load categories');
      });
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!newCategory) {
      toast.error('Category name is required');
      return;
    }

    try {
      const res = await fetch('/api/categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: newCategory }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error);
        return;
      }

      toast.success('Category created');
      setCategories([...categories, { id: data.id, category_name: newCategory }]);
      setNewCategory('');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error);
        return;
      }

      toast.success('Category deleted');
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  const startEdit = (id, name) => {
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

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: editingName }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error);
        return;
      }

      toast.success('Category updated');
      setCategories(
        categories.map((c) =>
          c.id === id ? { ...c, category_name: editingName } : c
        )
      );
      cancelEdit();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
    }
  };

  // ✅ Show access denial if not admin
  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-red-600 text-lg">Access Denied</h2>
        <p>You must be an admin to manage categories.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">Manage Categories</h2>

      {/* Create */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
                <button
                  onClick={() => handleUpdate(cat.id)}
                  className="text-green-700 hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{cat.category_name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(cat.id, cat.category_name)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
