import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkles, Crown, Lock, Check, Star } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
type ItemCategory = 'AVATAR' | 'PET' | 'POWER_UP' | 'CONSUMABLE' | 'BUNDLE';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ItemCategory;
  rarity: ItemRarity;
  coinsCost: number;
  gemsCost: number;
  imageUrl: string;
  isFeatured?: boolean;
  isLimitedTime?: boolean;
  stock?: number;
  requiredLevel?: number;
  isOwned?: boolean;
}

interface ShopProps {
  items: ShopItem[];
  studentCoins: number;
  studentGems: number;
  studentLevel: number;
  onPurchase: (itemId: string, currency: 'coins' | 'gems') => Promise<void>;
  onPreview?: (item: ShopItem) => void;
}

export const Shop: React.FC<ShopProps> = ({
  items,
  studentCoins,
  studentGems,
  studentLevel,
  onPurchase,
  onPreview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ItemCategory>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const categories: Array<{ id: 'all' | ItemCategory; label: string; icon: string }> = [
    { id: 'all', label: 'All Items', icon: '🛍️' },
    { id: 'AVATAR', label: 'Avatar', icon: '👤' },
    { id: 'PET', label: 'Pets', icon: '🐾' },
    { id: 'POWER_UP', label: 'Power-Ups', icon: '⚡' },
    { id: 'CONSUMABLE', label: 'Consumables', icon: '✨' },
    { id: 'BUNDLE', label: 'Bundles', icon: '🎁' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.type === selectedCategory);

  const featuredItems = items.filter(item => item.isFeatured);

  const handlePurchase = async (item: ShopItem, currency: 'coins' | 'gems') => {
    setPurchasing(true);
    try {
      await onPurchase(item.id, currency);
      fireConfetti({ particleCount: 100, spread: 90 });
      setSelectedItem(null);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const canAfford = (item: ShopItem, currency: 'coins' | 'gems') => {
    if (currency === 'coins') return studentCoins >= item.coinsCost;
    return studentGems >= item.gemsCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            Shop
          </h1>

          {/* Currency Display */}
          <div className="flex items-center justify-center gap-6 text-xl">
            <div className="flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full">
              <span className="text-3xl">🪙</span>
              <span className="font-bold text-yellow-400">{studentCoins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full">
              <span className="text-3xl">💎</span>
              <span className="font-bold text-blue-400">{studentGems.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Items</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  studentLevel={studentLevel}
                  onSelect={() => setSelectedItem(item)}
                  isFeatured
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              studentLevel={studentLevel}
              onSelect={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {selectedItem && (
            <PurchaseModal
              item={selectedItem}
              studentCoins={studentCoins}
              studentGems={studentGems}
              studentLevel={studentLevel}
              purchasing={purchasing}
              canAfford={canAfford}
              onPurchase={handlePurchase}
              onClose={() => setSelectedItem(null)}
              onPreview={onPreview}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ShopItemCardProps {
  item: ShopItem;
  studentLevel: number;
  onSelect: () => void;
  isFeatured?: boolean;
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, studentLevel, onSelect, isFeatured }) => {
  const rarityColors = {
    COMMON: 'from-gray-500 to-gray-600',
    UNCOMMON: 'from-green-500 to-green-600',
    RARE: 'from-blue-500 to-blue-600',
    EPIC: 'from-purple-500 to-purple-600',
    LEGENDARY: 'from-yellow-500 to-orange-500',
    MYTHIC: 'from-red-500 to-pink-500',
  };

  const isLocked = !!(item.requiredLevel && studentLevel < item.requiredLevel);
  const bgGradient = rarityColors[item.rarity];

  return (
    <motion.button
      whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -5 }}
      whileTap={{ scale: isLocked ? 1 : 0.95 }}
      onClick={onSelect}
      disabled={isLocked}
      className={`relative bg-gradient-to-br ${bgGradient} rounded-xl p-4 shadow-2xl border-2 border-white/20 text-left ${
        isLocked && 'opacity-50 cursor-not-allowed grayscale'
      } ${isFeatured && 'ring-4 ring-yellow-400'}`}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 text-black font-black px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          FEATURED
        </div>
      )}

      {/* Limited Time Badge */}
      {item.isLimitedTime && (
        <div className="absolute top-2 left-2 bg-red-500 text-white font-bold px-2 py-1 rounded text-xs">
          LIMITED!
        </div>
      )}

      {/* Owned Check */}
      {item.isOwned && (
        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white font-bold text-sm">Level {item.requiredLevel}</div>
          </div>
        </div>
      )}

      {/* Item Image/Icon */}
      <div className="w-full aspect-square bg-white/10 rounded-lg mb-3 flex items-center justify-center text-6xl">
        {item.imageUrl || '📦'}
      </div>

      {/* Item Info */}
      <div>
        <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
        <p className="text-white/70 text-xs mb-3 line-clamp-2">{item.description}</p>

        {/* Rarity Badge */}
        <div className="inline-block px-2 py-1 bg-black/30 rounded text-xs font-bold text-white mb-2">
          {item.rarity}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {item.coinsCost > 0 && (
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-white text-sm">{item.coinsCost}</span>
            </div>
          )}
          {item.gemsCost > 0 && (
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
              <span className="text-lg">💎</span>
              <span className="font-bold text-white text-sm">{item.gemsCost}</span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

interface PurchaseModalProps {
  item: ShopItem;
  studentCoins: number;
  studentGems: number;
  studentLevel: number;
  purchasing: boolean;
  canAfford: (item: ShopItem, currency: 'coins' | 'gems') => boolean;
  onPurchase: (item: ShopItem, currency: 'coins' | 'gems') => void;
  onClose: () => void;
  onPreview?: (item: ShopItem) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  item,
  studentCoins,
  studentGems,
  studentLevel,
  purchasing,
  canAfford,
  onPurchase,
  onClose,
  onPreview,
}) => {
  const isLocked = item.requiredLevel && studentLevel < item.requiredLevel;
  const canBuyWithCoins = item.coinsCost > 0 && canAfford(item, 'coins');
  const canBuyWithGems = item.gemsCost > 0 && canAfford(item, 'gems');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-lg w-full border-2 border-purple-500/50 shadow-2xl"
      >
        {/* Item Display */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{item.imageUrl || '📦'}</div>
          <h2 className="text-3xl font-black text-white mb-2">{item.name}</h2>
          <p className="text-gray-400 mb-4">{item.description}</p>

          <div className="inline-block px-4 py-2 bg-purple-600 rounded-full text-white font-bold">
            {item.rarity}
          </div>
        </div>

        {/* Preview Button */}
        {onPreview && ['AVATAR', 'PET'].includes(item.type) && (
          <button
            onClick={() => onPreview(item)}
            className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            👁️ Preview
          </button>
        )}

        {/* Purchase Options */}
        {!isLocked && !item.isOwned ? (
          <div className="space-y-3">
            {item.coinsCost > 0 && (
              <motion.button
                whileHover={{ scale: canBuyWithCoins ? 1.02 : 1 }}
                whileTap={{ scale: canBuyWithCoins ? 0.98 : 1 }}
                onClick={() => onPurchase(item, 'coins')}
                disabled={!canBuyWithCoins || purchasing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  canBuyWithCoins
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {purchasing ? 'Purchasing...' : `Buy for ${item.coinsCost} 🪙`}
              </motion.button>
            )}

            {item.gemsCost > 0 && (
              <motion.button
                whileHover={{ scale: canBuyWithGems ? 1.02 : 1 }}
                whileTap={{ scale: canBuyWithGems ? 0.98 : 1 }}
                onClick={() => onPurchase(item, 'gems')}
                disabled={!canBuyWithGems || purchasing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  canBuyWithGems
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {purchasing ? 'Purchasing...' : `Buy for ${item.gemsCost} 💎`}
              </motion.button>
            )}
          </div>
        ) : item.isOwned ? (
          <div className="py-4 bg-green-600 rounded-xl text-center">
            <Check className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold">Already Owned!</p>
          </div>
        ) : (
          <div className="py-4 bg-red-600 rounded-xl text-center">
            <Lock className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold">Requires Level {item.requiredLevel}</p>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Shop;