import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function CreateClassroom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gradeLevel: 6,
    subject: 'Math',
    studentLimit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        gradeLevel: formData.gradeLevel,
        subject: formData.subject,
        studentLimit: formData.studentLimit ? parseInt(formData.studentLimit) : undefined,
      };

      const res: any = await api.post('/teacher/classrooms', payload);
      navigate(`/teacher/classrooms/${res.data.id}`);
    } catch (error: any) {
      console.error('Failed to create classroom:', error);
      alert(error.response?.data?.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/classrooms')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            ← Back to Classrooms
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Classroom</h1>
          <p className="text-gray-600">Set up a new class for your students</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Classroom Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Math 101, Algebra 1A"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the class..."
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={4}>Grade 4</option>
                <option value={5}>Grade 5</option>
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Math">Math</option>
                <option value="Algebra">Algebra</option>
                <option value="Geometry">Geometry</option>
                <option value="Pre-Algebra">Pre-Algebra</option>
              </select>
            </div>

            {/* Student Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Limit (Optional)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.studentLimit}
                onChange={(e) => setFormData({ ...formData, studentLimit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 30"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank for unlimited students
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>📋 Note:</strong> After creating the classroom, you'll receive a unique
                class code that students can use to join.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Classroom'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/classrooms')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}