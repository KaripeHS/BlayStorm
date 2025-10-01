import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';

interface Classroom {
  id: string;
  name: string;
}

interface Problem {
  id: string;
  question: string;
  difficulty: string;
  topic: string;
  subtopic: string;
}

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClassroom = searchParams.get('classroom');

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    classroomId: preselectedClassroom || '',
    title: '',
    description: '',
    dueDate: '',
    passingScore: '70',
    pointsWorth: '100',
    timeLimit: '',
    allowLateSubmissions: true,
  });

  const [filters, setFilters] = useState({
    difficulty: 'all',
    topic: 'all',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classroomsRes, problemsRes] = await Promise.all([
        api.get('/teacher/classrooms'),
        api.get('/game/problems'),
      ]);
      setClassrooms(classroomsRes.data.filter((c: any) => c.isActive));
      setProblems(problemsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load classrooms and problems');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProblem = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProblems.length === 0) {
      alert('Please select at least one problem');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        problemIds: selectedProblems,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        passingScore: parseInt(formData.passingScore),
        pointsWorth: parseInt(formData.pointsWorth),
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
        allowLateSubmissions: formData.allowLateSubmissions,
      };

      const res: any = await api.post(`/teacher/classrooms/${formData.classroomId}/assignments`, payload) as any;

      // Ask if teacher wants to publish now
      const shouldPublish = confirm('Assignment created! Would you like to publish it now to students?');
      if (shouldPublish) {
        await api.post(`/teacher/assignments/${res.data.id}/publish`) as any;
      }

      navigate(`/teacher/assignments/${res.data.id}`);
    } catch (error: any) {
      console.error('Failed to create assignment:', error);
      alert(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProblems = problems.filter((problem) => {
    if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) return false;
    if (filters.topic !== 'all' && problem.topic !== filters.topic) return false;
    return true;
  });

  const uniqueTopics = Array.from(new Set(problems.map((p) => p.topic)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Assignment</h1>
          <p className="text-gray-600">Select problems and configure assignment settings</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Assignment Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Details</h2>

                {/* Classroom Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classroom <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a classroom</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Week 1 Homework"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Assignment instructions..."
                  />
                </div>

                {/* Due Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Passing Score */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Points Worth */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Worth
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pointsWorth}
                    onChange={(e) => setFormData({ ...formData, pointsWorth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Time Limit */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave blank for no limit"
                  />
                </div>

                {/* Allow Late Submissions */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowLateSubmissions}
                      onChange={(e) =>
                        setFormData({ ...formData, allowLateSubmissions: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Allow late submissions
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || selectedProblems.length === 0}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : `Create Assignment (${selectedProblems.length} problems)`}
              </button>
            </div>

            {/* Right Column - Problem Bank */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Problem Bank ({selectedProblems.length} selected)
                  </h2>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                  <select
                    value={filters.topic}
                    onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Topics</option>
                    {uniqueTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Problems List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedProblems.includes(problem.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleProblem(problem.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProblems.includes(problem.id)}
                          onChange={() => handleToggleProblem(problem.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{problem.question}</p>
                          <div className="flex gap-3 mt-2 text-xs">
                            <span
                              className={`px-2 py-1 rounded ${
                                problem.difficulty === 'EASY'
                                  ? 'bg-green-100 text-green-700'
                                  : problem.difficulty === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {problem.topic}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {problem.subtopic}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}