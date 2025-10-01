import { useState, useEffect } from 'react';
import { HomeBaseEditor } from '../components/engagement/HomeBaseEditor';
import { useHomeBase } from '../hooks/useEngagement';
import engagementApi from '../services/api/engagement';

const HomeBasePage = () => {
  const { availableFurniture, placedFurniture, loading, saveLayout, purchaseFurniture } = useHomeBase();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const stats = await engagementApi.getDashboardStats();
        setStudentData(stats);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      }
    };

    fetchStudentData();
  }, []);

  if (loading || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Home Base...</div>
      </div>
    );
  }

  return (
    <HomeBaseEditor
      gridWidth={10}
      gridHeight={8}
      placedFurniture={placedFurniture}
      availableFurniture={availableFurniture}
      studentLevel={studentData.level || 1}
      studentCoins={studentData.coins || 0}
      studentGems={studentData.gems || 0}
      onSave={saveLayout}
    />
  );
};

export default HomeBasePage;
