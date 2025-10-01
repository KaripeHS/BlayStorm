import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface ClassroomAnalytics {
  classroom: {
    id: string;
    name: string;
    gradeLevel: number;
    subject: string;
    currentStudents: number;
  };
  totalStudents: number;
  activeStudents: number;
  averageScore: number | null;
  completionRate: number;
  assignments: number;
}

export default function Analytics() {
  const [classrooms, setClassrooms] = useState<ClassroomAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res: any = await api.get('/teacher/classrooms');
      const classroomData = res.data;

      // Load analytics for each classroom
      const analyticsPromises = classroomData.map(async (classroom: any) => {
        try {
          const analyticsRes: any = await api.get(`/teacher/classrooms/${classroom.id}/analytics`);
          return {
            classroom,
            ...analyticsRes.data,
          };
        } catch (error) {
          console.error(`Failed to load analytics for ${classroom.name}:`, error);
          return {
            classroom,
            totalStudents: 0,
            activeStudents: 0,
            averageScore: null,
            completionRate: 0,
            assignments: 0,
          };
        }
      });

      const analyticsData = await Promise.all(analyticsPromises);
      setClassrooms(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  const totalStudents = classrooms.reduce((sum, c) => sum + c.totalStudents, 0);
  const totalAssignments = classrooms.reduce((sum, c) => sum + c.assignments, 0);
  const overallAverage =
    classrooms.filter((c) => c.averageScore !== null).length > 0
      ? classrooms
          .filter((c) => c.averageScore !== null)
          .reduce((sum, c) => sum + (c.averageScore || 0), 0) /
        classrooms.filter((c) => c.averageScore !== null).length
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard 📊</h1>
          <p className="text-gray-600">Track performance across all your classrooms</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{classrooms.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
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

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Average</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {overallAverage !== null ? `${overallAverage.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Classroom Performance</h2>

          {classrooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-lg mb-2">No classrooms yet</p>
              <p className="text-sm mb-6">Create a classroom to start tracking analytics</p>
              <Link
                to="/teacher/classrooms/new"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Create Classroom
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {classrooms.map((analytics) => (
                <div
                  key={analytics.classroom.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link
                        to={`/teacher/classrooms/${analytics.classroom.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-purple-600 transition"
                      >
                        {analytics.classroom.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Grade {analytics.classroom.gradeLevel} • {analytics.classroom.subject}
                      </p>
                    </div>
                    <Link
                      to={`/teacher/classrooms/${analytics.classroom.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalStudents}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Active</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.activeStudents}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Assignments</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.assignments}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Avg Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.averageScore !== null
                          ? `${analytics.averageScore.toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Completion</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {analytics.completionRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Class Performance</span>
                      <span>
                        {analytics.averageScore !== null
                          ? analytics.averageScore >= 80
                            ? 'Excellent 🌟'
                            : analytics.averageScore >= 70
                            ? 'Good 👍'
                            : analytics.averageScore >= 60
                            ? 'Fair 📈'
                            : 'Needs Improvement 📚'
                          : 'No data yet'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          analytics.averageScore !== null
                            ? analytics.averageScore >= 80
                              ? 'bg-green-500'
                              : analytics.averageScore >= 70
                              ? 'bg-blue-500'
                              : analytics.averageScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-gray-300'
                        }`}
                        style={{
                          width: `${analytics.averageScore !== null ? analytics.averageScore : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        {classrooms.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">📈 Quick Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-white/90 text-sm mb-1">Best Performing Class</p>
                <p className="font-bold text-lg">
                  {classrooms.reduce((best, current) =>
                    (current.averageScore || 0) > (best.averageScore || 0) ? current : best
                  ).classroom.name}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-white/90 text-sm mb-1">Largest Class</p>
                <p className="font-bold text-lg">
                  {classrooms.reduce((largest, current) =>
                    current.totalStudents > largest.totalStudents ? current : largest
                  ).classroom.name}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-white/90 text-sm mb-1">Most Active Class</p>
                <p className="font-bold text-lg">
                  {classrooms.reduce((active, current) =>
                    current.activeStudents > active.activeStudents ? current : active
                  ).classroom.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}