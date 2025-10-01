import { AvatarCustomizer } from '../components/engagement/AvatarCustomizer';
import { useAvatar } from '../hooks/useEngagement';
import { useState, useEffect } from 'react';
import engagementApi from '../services/api/engagement';

const AvatarPage = () => {
  const { items, equippedItems, loading, equipItem, unequipItem, purchaseItem } = useAvatar();
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading avatar customizer...</div>
      </div>
    );
  }

  return (
    <AvatarCustomizer
      items={items}
      equippedItems={equippedItems}
      studentLevel={studentData.level || 1}
      studentCoins={studentData.coins || 0}
      studentGems={studentData.gems || 0}
      onEquip={equipItem}
      onUnequip={unequipItem}
      onPurchase={purchaseItem}
    />
  );
};

export default AvatarPage;
