import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

interface Submission {
  id: string;
  status: string;
  score: number | null;
  passed: boolean | null;
  problemsAttempted: number;
  problemsCorrect: number;
  timeSpent: number | null;
  submittedAt: string | null;
  teacherComments: string | null;
  student: {
    user: {
      profile: {
        displayName: string;
        username: string;
      };
    };
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  passingScore: number;
  pointsWorth: number;
  timeLimit: number | null;
  status: string;
  classroom: {
    id: string;
    name: string;
  };
  _count: {
    submissions: number;
  };
}

interface Stats {
  notStarted: number;
  inProgress: number;
  submitted: number;
  graded: number;
  lateSubmissions: number;
  averageScore: number | null;
  passRate: number | null;
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({
    score: '',
    comments: '',
  });

  useEffect(() => {
    loadAssignmentData();
  }, [id]);

  const loadAssignmentData = async () => {
    try {
      const [assignmentRes, statsRes] = await Promise.all([
        api.get(`/teacher/assignments/${id}`),
        api.get(`/teacher/assignments/${id}/stats`),
      ]);

      setAssignment(assignmentRes.data);
      setSubmissions(assignmentRes.data.submissions || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load assignment:', error);
      alert('Failed to load assignment data');
      navigate('/teacher/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this assignment to all students in the classroom?')) return;

    try {
      await api.post(`/teacher/assignments/${id}/publish`);
      await loadAssignmentData();
      alert('Assignment published successfully!');
    } catch (error) {
      console.error('Failed to publish assignment:', error);
      alert('Failed to publish assignment');
    }
  };

  const handleStartGrading = (submissionId: string, currentScore: number | null) => {
    setGradingSubmission(submissionId);
    setGradeForm({
      score: currentScore?.toString() || '',
      comments: '',
    });
  };

  const handleSubmitGrade = async (submissionId: string) => {
    if (!gradeForm.score) {
      alert('Please enter a score');
      return;
    }

    try {
      const score = parseFloat(gradeForm.score);
      await api.post(`/teacher/submissions/${submissionId}/grade`, {
        score,
        passed: score >= (assignment?.passingScore || 70),
        teacherComments: gradeForm.comments || undefined,
      });

      await loadAssignmentData();
      setGradingSubmission(null);
      setGradeForm({ score: '', comments: '' });
    } catch (error) {
      console.error('Failed to grade submission:', error);
      alert('Failed to save grade');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment || !stats) {
    return <div>Assignment not found</div>;
  }

  const isDraft = assignment.status === 'DRAFT';
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/teacher/classrooms/${assignment.classroom.id}`)}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            ← Back to {assignment.classroom.name}
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900">{assignment.title}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isDraft
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{assignment.description || 'No description'}</p>
                <div className="flex gap-6 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Due:</span>{' '}
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleString()
                      : 'No due date'}
                  </div>
                  <div>
                    <span className="font-medium">Passing Score:</span> {assignment.passingScore}%
                  </div>
                  <div>
                    <span className="font-medium">Points:</span> {assignment.pointsWorth}
                  </div>
                  {assignment.timeLimit && (
                    <div>
                      <span className="font-medium">Time Limit:</span> {assignment.timeLimit} min
                    </div>
                  )}
                </div>
              </div>
              {isDraft && (
                <button
                  onClick={handlePublish}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  📢 Publish Now
                </button>
              )}
            </div>

            {isOverdue && !isDraft && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ This assignment is overdue. {stats.lateSubmissions} late submission(s).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Not Started</p>
            <p className="text-3xl font-bold text-gray-900">{stats.notStarted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Submitted</p>
            <p className="text-3xl font-bold text-purple-600">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Graded</p>
            <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageScore !== null ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.passRate !== null ? `${stats.passRate.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Late Submissions</p>
            <p className="text-3xl font-bold text-orange-600">{stats.lateSubmissions}</p>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h2>

          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No submissions yet</p>
              {isDraft && <p className="text-sm">Publish the assignment to see student submissions</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {submission.student.user.profile.displayName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{submission.student.user.profile.username}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        submission.status === 'NOT_STARTED'
                          ? 'bg-gray-100 text-gray-700'
                          : submission.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : submission.status === 'SUBMITTED'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>

                  {submission.status !== 'NOT_STARTED' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Problems Correct</p>
                        <p className="font-semibold text-gray-900">
                          {submission.problemsCorrect} / {submission.problemsAttempted}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time Spent</p>
                        <p className="font-semibold text-gray-900">
                          {submission.timeSpent ? `${Math.floor(submission.timeSpent / 60)}m` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Score</p>
                        <p className="font-semibold text-gray-900">
                          {submission.score !== null ? `${submission.score}%` : 'Not graded'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Result</p>
                        <p className={`font-semibold ${submission.passed ? 'text-green-600' : submission.passed === false ? 'text-red-600' : 'text-gray-900'}`}>
                          {submission.passed === null ? 'N/A' : submission.passed ? 'Passed ✓' : 'Failed ✗'}
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.status === 'SUBMITTED' && (
                    <>
                      {gradingSubmission === submission.id ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Score (%)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeForm.score}
                                onChange={(e) =>
                                  setGradeForm({ ...gradeForm, score: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comments (optional)
                              </label>
                              <textarea
                                value={gradeForm.comments}
                                onChange={(e) =>
                                  setGradeForm({ ...gradeForm, comments: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Great work! Focus on..."
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitGrade(submission.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              Save Grade
                            </button>
                            <button
                              onClick={() => setGradingSubmission(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartGrading(submission.id, submission.score)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                          📝 Grade Submission
                        </button>
                      )}
                    </>
                  )}

                  {submission.status === 'GRADED' && submission.teacherComments && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Teacher Comments:</p>
                      <p className="text-sm text-blue-800">{submission.teacherComments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}