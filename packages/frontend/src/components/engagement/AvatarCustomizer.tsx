import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ShoppingCart, Check, Lock, Palette, X } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
type ItemCategory = 'HEAD' | 'BODY' | 'FACE' | 'ACCESSORY' | 'BACKGROUND' | 'EMOTE' | 'TITLE';

interface AvatarItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  imageUrl: string;
  coinsCost: number;
  gemsCost: number;
  requiredLevel: number;
  isOwned: boolean;
  isEquipped: boolean;
}

interface EquippedItems {
  HEAD?: AvatarItem;
  BODY?: AvatarItem;
  FACE?: AvatarItem;
  ACCESSORY?: AvatarItem;
  BACKGROUND?: AvatarItem;
  EMOTE?: AvatarItem;
  TITLE?: AvatarItem;
}

interface AvatarCustomizerProps {
  items: AvatarItem[];
  equippedItems: EquippedItems;
  studentLevel: number;
  studentCoins: number;
  studentGems: number;
  onEquip: (itemId: string, category: ItemCategory) => Promise<void>;
  onUnequip: (category: ItemCategory) => Promise<void>;
  onPurchase: (itemId: string, currency: 'coins' | 'gems') => Promise<void>;
  onRandomize?: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  items,
  equippedItems,
  studentLevel,
  studentCoins,
  studentGems,
  onEquip,
  onUnequip,
  onPurchase,
  onRandomize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('HEAD');
  const [selectedItem, setSelectedItem] = useState<AvatarItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const categories: Array<{ id: ItemCategory; label: string; icon: string }> = [
    { id: 'HEAD', label: 'Head', icon: '🎩' },
    { id: 'BODY', label: 'Body', icon: '👕' },
    { id: 'FACE', label: 'Face', icon: '😊' },
    { id: 'ACCESSORY', label: 'Accessories', icon: '💍' },
    { id: 'BACKGROUND', label: 'Background', icon: '🌅' },
    { id: 'EMOTE', label: 'Emotes', icon: '🎭' },
    { id: 'TITLE', label: 'Titles', icon: '👑' },
  ];

  const categoryItems = items.filter(item => item.category === selectedCategory);
  const ownedItems = categoryItems.filter(item => item.isOwned);
  const shopItems = categoryItems.filter(item => !item.isOwned);

  const handleItemClick = (item: AvatarItem) => {
    if (!item.isOwned) {
      setSelectedItem(item);
      setShowPurchaseModal(true);
    } else if (item.isEquipped) {
      onUnequip(item.category);
    } else {
      onEquip(item.id, item.category);
    }
  };

  const handlePurchase = async (item: AvatarItem, currency: 'coins' | 'gems') => {
    await onPurchase(item.id, currency);
    fireConfetti({ particleCount: 100, spread: 90 });
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const canAfford = (item: AvatarItem, currency: 'coins' | 'gems') => {
    if (currency === 'coins') return studentCoins >= item.coinsCost;
    return studentGems >= item.gemsCost;
  };

  const isLocked = (item: AvatarItem) => {
    return studentLevel < item.requiredLevel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-4">
            Avatar Customizer
          </h1>

          {/* Currency Display */}
          <div className="flex items-center justify-center gap-6 text-xl mb-6">
            <div className="flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full">
              <span className="text-3xl">🪙</span>
              <span className="font-bold text-yellow-400">{studentCoins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full">
              <span className="text-3xl">💎</span>
              <span className="font-bold text-blue-400">{studentGems.toLocaleString()}</span>
            </div>
          </div>

          {/* Randomize Button */}
          {onRandomize && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRandomize}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Randomize Look
            </motion.button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Avatar Preview */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 shadow-2xl border-2 border-purple-500/50 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Your Avatar
              </h2>

              {/* Avatar Display */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-purple-700 to-pink-700 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                {/* Background Layer */}
                {equippedItems.BACKGROUND && (
                  <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-30">
                    {equippedItems.BACKGROUND.imageUrl}
                  </div>
                )}

                {/* Character Layers */}
                <div className="relative z-10 text-center">
                  {/* Title */}
                  {equippedItems.TITLE && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-sm whitespace-nowrap">
                      {equippedItems.TITLE.name}
                    </div>
                  )}

                  {/* Head */}
                  <div className="text-8xl mb-2">
                    {equippedItems.HEAD?.imageUrl || '🧑'}
                  </div>

                  {/* Face (overlays on head) */}
                  {equippedItems.FACE && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-6xl">
                      {equippedItems.FACE.imageUrl}
                    </div>
                  )}

                  {/* Body */}
                  <div className="text-7xl">
                    {equippedItems.BODY?.imageUrl || '👔'}
                  </div>

                  {/* Accessory (overlays on body) */}
                  {equippedItems.ACCESSORY && (
                    <div className="absolute bottom-4 right-4 text-5xl">
                      {equippedItems.ACCESSORY.imageUrl}
                    </div>
                  )}
                </div>

                {/* Emote Display */}
                {equippedItems.EMOTE && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute bottom-4 left-4 text-5xl"
                  >
                    {equippedItems.EMOTE.imageUrl}
                  </motion.div>
                )}
              </div>

              {/* Equipped Items List */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Currently Equipped</h3>
                {categories.map((cat) => {
                  const equipped = equippedItems[cat.id];
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm text-gray-300">{cat.label}</span>
                      </div>
                      {equipped ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-bold">{equipped.name}</span>
                          <button
                            onClick={() => onUnequip(cat.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Item Selection */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </motion.button>
              ))}
            </div>

            {/* Owned Items Section */}
            {ownedItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Your Collection ({ownedItems.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ownedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      isLocked={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shop Items Section */}
            {shopItems.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  Available to Purchase ({shopItems.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {shopItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      isLocked={isLocked(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {categoryItems.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Palette className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">No items in this category yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedItem && (
            <PurchaseModal
              item={selectedItem}
              studentCoins={studentCoins}
              studentGems={studentGems}
              studentLevel={studentLevel}
              canAfford={canAfford}
              isLocked={isLocked(selectedItem)}
              onPurchase={handlePurchase}
              onClose={() => {
                setShowPurchaseModal(false);
                setSelectedItem(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ItemCardProps {
  item: AvatarItem;
  onClick: () => void;
  isLocked: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, isLocked }) => {
  const rarityColors = {
    COMMON: 'from-gray-500 to-gray-600',
    UNCOMMON: 'from-green-500 to-green-600',
    RARE: 'from-blue-500 to-blue-600',
    EPIC: 'from-purple-500 to-purple-600',
    LEGENDARY: 'from-yellow-500 to-orange-500',
    MYTHIC: 'from-red-500 to-pink-500',
  };

  const bgGradient = rarityColors[item.rarity];

  return (
    <motion.button
      whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -5 }}
      whileTap={{ scale: isLocked ? 1 : 0.95 }}
      onClick={onClick}
      disabled={isLocked}
      className={`relative bg-gradient-to-br ${bgGradient} rounded-xl p-4 shadow-2xl border-2 border-white/20 text-left ${
        isLocked && 'opacity-50 cursor-not-allowed grayscale'
      } ${item.isEquipped && 'ring-4 ring-green-400'}`}
    >
      {/* Equipped Badge */}
      {item.isEquipped && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white font-black px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Check className="w-3 h-3" />
          EQUIPPED
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="text-center">
            <Lock className="w-6 h-6 text-white mx-auto mb-1" />
            <div className="text-white font-bold text-xs">Lvl {item.requiredLevel}</div>
          </div>
        </div>
      )}

      {/* Item Image */}
      <div className="w-full aspect-square bg-white/10 rounded-lg mb-2 flex items-center justify-center text-5xl">
        {item.imageUrl}
      </div>

      {/* Item Info */}
      <div>
        <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.name}</h4>

        {/* Rarity Badge */}
        <div className="inline-block px-2 py-0.5 bg-black/30 rounded text-xs font-bold text-white mb-2">
          {item.rarity}
        </div>

        {/* Price (if not owned) */}
        {!item.isOwned && (
          <div className="flex items-center gap-1 flex-wrap">
            {item.coinsCost > 0 && (
              <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded">
                <span className="text-sm">🪙</span>
                <span className="font-bold text-white text-xs">{item.coinsCost}</span>
              </div>
            )}
            {item.gemsCost > 0 && (
              <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded">
                <span className="text-sm">💎</span>
                <span className="font-bold text-white text-xs">{item.gemsCost}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
};

interface PurchaseModalProps {
  item: AvatarItem;
  studentCoins: number;
  studentGems: number;
  studentLevel: number;
  canAfford: (item: AvatarItem, currency: 'coins' | 'gems') => boolean;
  isLocked: boolean;
  onPurchase: (item: AvatarItem, currency: 'coins' | 'gems') => void;
  onClose: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  item,
  studentCoins,
  studentGems,
  studentLevel,
  canAfford,
  isLocked,
  onPurchase,
  onClose,
}) => {
  const [purchasing, setPurchasing] = useState(false);
  const canBuyWithCoins = item.coinsCost > 0 && canAfford(item, 'coins');
  const canBuyWithGems = item.gemsCost > 0 && canAfford(item, 'gems');

  const handlePurchase = async (currency: 'coins' | 'gems') => {
    setPurchasing(true);
    try {
      await onPurchase(item, currency);
    } finally {
      setPurchasing(false);
    }
  };

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
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500/50 shadow-2xl"
      >
        {/* Item Display */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{item.imageUrl}</div>
          <h2 className="text-3xl font-black text-white mb-2">{item.name}</h2>

          <div className="inline-block px-4 py-2 bg-purple-600 rounded-full text-white font-bold mb-4">
            {item.rarity}
          </div>

          <p className="text-gray-400 text-sm">Category: {item.category}</p>
        </div>

        {/* Purchase Options */}
        {!isLocked ? (
          <div className="space-y-3">
            {item.coinsCost > 0 && (
              <motion.button
                whileHover={{ scale: canBuyWithCoins ? 1.02 : 1 }}
                whileTap={{ scale: canBuyWithCoins ? 0.98 : 1 }}
                onClick={() => handlePurchase('coins')}
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
                onClick={() => handlePurchase('gems')}
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
        ) : (
          <div className="py-4 bg-red-600 rounded-xl text-center">
            <Lock className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold">Requires Level {item.requiredLevel}</p>
            <p className="text-white/70 text-sm mt-1">You are level {studentLevel}</p>
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

export default AvatarCustomizer;