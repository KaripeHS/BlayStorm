import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
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

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  classroom: {
    name: string;
  };
  _count: {
    submissions: number;
  };
}

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [classroomsRes, assignmentsRes] = await Promise.all([
        api.get('/teacher/classrooms'),
        api.get('/teacher/assignments?limit=5'),
      ]);
      setClassrooms(classroomsRes.data);
      setRecentAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const activeClassrooms = classrooms.filter((c) => c.isActive);
  const totalStudents = classrooms.reduce((sum, c) => sum + c.currentStudents, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.displayName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your classes today.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classrooms</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeClassrooms.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {recentAssignments.filter((a) => a.status === 'PUBLISHED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Classrooms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">My Classrooms</h2>
              <Link
                to="/teacher/classrooms/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                + New Class
              </Link>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No classrooms yet</p>
                <p className="text-sm">Create your first classroom to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classrooms.slice(0, 5).map((classroom) => (
                  <Link
                    key={classroom.id}
                    to={`/teacher/classrooms/${classroom.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                        <p className="text-sm text-gray-600">
                          Grade {classroom.gradeLevel} • {classroom.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">
                          Code: {classroom.classCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {classroom.currentStudents} students
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {classrooms.length > 5 && (
                  <Link
                    to="/teacher/classrooms"
                    className="block text-center py-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View all classrooms →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Assignments</h2>
              <Link
                to="/teacher/assignments/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + New Assignment
              </Link>
            </div>

            {recentAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No assignments yet</p>
                <p className="text-sm">Create assignments to track student progress!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    to={`/teacher/assignments/${assignment.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.classroom.name}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            assignment.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {assignment.status}
                        </span>
                        {assignment.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/teacher/classrooms/new"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 transition"
            >
              <span className="text-2xl mb-2 block">🏫</span>
              <p className="font-semibold">Create Classroom</p>
              <p className="text-sm text-white/80">Start a new class</p>
            </Link>
            <Link
              to="/teacher/assignments/new"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 transition"
            >
              <span className="text-2xl mb-2 block">📋</span>
              <p className="font-semibold">New Assignment</p>
              <p className="text-sm text-white/80">Create homework or quiz</p>
            </Link>
            <Link
              to="/teacher/analytics"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 transition"
            >
              <span className="text-2xl mb-2 block">📊</span>
              <p className="font-semibold">View Analytics</p>
              <p className="text-sm text-white/80">Track student progress</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}