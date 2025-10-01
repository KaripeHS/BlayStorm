import { Shop } from '../components/engagement/Shop';
import { useShop } from '../hooks/useEngagement';
import { useAuthStore } from '../stores/auth-store';
import { useState, useEffect } from 'react';
import engagementApi from '../services/api/engagement';

const ShopPage = () => {
  const { user } = useAuthStore();
  const { items, loading, purchaseItem } = useShop();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading shop...</div>
      </div>
    );
  }

  return (
    <Shop
      items={items}
      studentCoins={studentData.coins || 0}
      studentGems={studentData.gems || 0}
      studentLevel={studentData.level || 1}
      onPurchase={purchaseItem}
    />
  );
};

export default ShopPage;
