import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  gradeLevel: number;
  subject: string;
  classCode: string;
  isActive: boolean;
  currentStudents: number;
  studentLimit: number | null;
  createdAt: string;
}

export default function ClassroomList() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const res = await api.get('/teacher/classrooms');
      setClassrooms(res.data);
    } catch (error) {
      console.error('Failed to load classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter((c) => {
    if (filter === 'active') return c.isActive;
    if (filter === 'archived') return !c.isActive;
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/teacher/classrooms/${id}`);
      setClassrooms(classrooms.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      alert('Failed to delete classroom. Please try again.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/teacher/classrooms/${id}`, {
        isActive: !currentStatus,
      });
      setClassrooms(
        classrooms.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (error) {
      console.error('Failed to update classroom:', error);
      alert('Failed to update classroom status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading classrooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Classrooms</h1>
            <p className="text-gray-600">Manage your classes and students</p>
          </div>
          <button
            onClick={() => navigate('/teacher/classrooms/new')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            + Create Classroom
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({classrooms.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({classrooms.filter((c) => c.isActive).length})
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'archived'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Archived ({classrooms.filter((c) => !c.isActive).length})
            </button>
          </div>
        </div>

        {/* Classrooms Grid */}
        {filteredClassrooms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📚</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No classrooms found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Create your first classroom to get started!'
                : `No ${filter} classrooms yet.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/teacher/classrooms/new')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Create Your First Classroom
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.map((classroom) => (
              <div
                key={classroom.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl ${
                  !classroom.isActive ? 'opacity-75' : ''
                }`}
              >
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-2xl">📚</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        classroom.isActive
                          ? 'bg-green-400/30 text-white'
                          : 'bg-gray-400/30 text-gray-100'
                      }`}
                    >
                      {classroom.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{classroom.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classroom.description || 'No description provided'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Grade:</span>
                      {classroom.gradeLevel}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Subject:</span>
                      {classroom.subject}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Class Code:</span>
                      <span className="font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {classroom.classCode}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Students:</span>
                      {classroom.currentStudents}
                      {classroom.studentLimit && ` / ${classroom.studentLimit}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/teacher/classrooms/${classroom.id}`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleToggleActive(classroom.id, classroom.isActive)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      title={classroom.isActive ? 'Archive' : 'Activate'}
                    >
                      {classroom.isActive ? '📦' : '✅'}
                    </button>
                    <button
                      onClick={() => handleDelete(classroom.id, classroom.name)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}