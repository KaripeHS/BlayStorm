import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

interface Student {
  id: string;
  studentId: string;
  student: {
    user: {
      profile: {
        username: string;
        displayName: string;
      };
    };
    gradeLevel: number;
  };
  joinedAt: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  _count: {
    submissions: number;
  };
}

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

export default function ClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addStudentUsername, setAddStudentUsername] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    loadClassroomData();
  }, [id]);

  const loadClassroomData = async () => {
    try {
      const [classroomRes, analyticsRes] = await Promise.all([
        api.get(`/teacher/classrooms/${id}`),
        api.get(`/teacher/classrooms/${id}/analytics`),
      ]);

      setClassroom(classroomRes.data);
      setStudents(analyticsRes.data.students || []);
      setAssignments(analyticsRes.data.assignments || []);
    } catch (error) {
      console.error('Failed to load classroom data:', error);
      alert('Failed to load classroom. You may not have permission to view this class.');
      navigate('/teacher/classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStudentUsername.trim()) return;

    setAddingStudent(true);
    try {
      await api.post(`/teacher/classrooms/${id}/students`, {
        username: addStudentUsername.trim(),
      });
      setAddStudentUsername('');
      await loadClassroomData();
    } catch (error: any) {
      console.error('Failed to add student:', error);
      alert(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, displayName: string) => {
    if (!confirm(`Remove ${displayName} from this classroom?`)) return;

    try {
      await api.delete(`/teacher/classrooms/${id}/students/${studentId}`);
      await loadClassroomData();
    } catch (error) {
      console.error('Failed to remove student:', error);
      alert('Failed to remove student');
    }
  };

  const copyClassCode = () => {
    if (classroom) {
      navigator.clipboard.writeText(classroom.classCode);
      alert('Class code copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading classroom...</div>
      </div>
    );
  }

  if (!classroom) {
    return <div>Classroom not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/classrooms')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            ← Back to Classrooms
          </button>

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
                <p className="text-white/90 mb-4">
                  {classroom.description || 'No description provided'}
                </p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-white/80">Grade:</span>{' '}
                    <span className="font-semibold">{classroom.gradeLevel}</span>
                  </div>
                  <div>
                    <span className="text-white/80">Subject:</span>{' '}
                    <span className="font-semibold">{classroom.subject}</span>
                  </div>
                  <div>
                    <span className="text-white/80">Students:</span>{' '}
                    <span className="font-semibold">
                      {classroom.currentStudents}
                      {classroom.studentLimit && ` / ${classroom.studentLimit}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                <p className="text-xs text-white/80 mb-1">Class Code</p>
                <p className="text-2xl font-mono font-bold mb-2">{classroom.classCode}</p>
                <button
                  onClick={copyClassCode}
                  className="text-xs bg-white/30 hover:bg-white/40 px-3 py-1 rounded transition"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Students ({students.length})
                </h2>
              </div>

              {/* Add Student Form */}
              <form onSubmit={handleAddStudent} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addStudentUsername}
                    onChange={(e) => setAddStudentUsername(e.target.value)}
                    placeholder="Enter student username..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={addingStudent || !addStudentUsername.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
                  >
                    {addingStudent ? 'Adding...' : '+ Add'}
                  </button>
                </div>
              </form>

              {/* Students List */}
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No students yet</p>
                  <p className="text-sm">
                    Share the class code <strong>{classroom.classCode}</strong> with students or
                    add them manually above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {enrollment.student.user.profile.displayName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {enrollment.student.user.profile.displayName}
                          </p>
                          <p className="text-sm text-gray-600">
                            @{enrollment.student.user.profile.username} • Grade{' '}
                            {enrollment.student.gradeLevel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Joined {new Date(enrollment.joinedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveStudent(
                              enrollment.studentId,
                              enrollment.student.user.profile.displayName
                            )
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to={`/teacher/assignments/new?classroom=${id}`}
                  className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center font-medium"
                >
                  📝 Create Assignment
                </Link>
                <button
                  onClick={copyClassCode}
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  📋 Copy Class Code
                </button>
                <Link
                  to={`/teacher/classrooms/${id}/edit`}
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center font-medium"
                >
                  ⚙️ Edit Classroom
                </Link>
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Assignments ({assignments.length})
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No assignments yet</p>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 5).map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/teacher/assignments/${assignment.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <p className="font-medium text-gray-900 text-sm">{assignment.title}</p>
                      <p className="text-xs text-gray-600">
                        {assignment._count.submissions} submissions
                      </p>
                    </Link>
                  ))}
                  {assignments.length > 5 && (
                    <Link
                      to="/teacher/assignments"
                      className="block text-center text-sm text-purple-600 hover:text-purple-700 py-2"
                    >
                      View all →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}