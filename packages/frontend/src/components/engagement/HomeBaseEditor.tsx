import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid, Save, RotateCw, Trash2, ShoppingCart, Lock, Check, Star } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

type FurnitureCategory = 'FLOOR' | 'WALL' | 'FURNITURE' | 'DECORATION' | 'LIGHTING' | 'SPECIAL';
type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  rarity: ItemRarity;
  imageUrl: string;
  coinsCost: number;
  gemsCost: number;
  requiredLevel: number;
  isOwned: boolean;
  size: { width: number; height: number }; // Grid units
}

interface PlacedFurniture {
  id: string; // Unique placement ID
  itemId: string;
  item: FurnitureItem;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
}

interface HomeBaseEditorProps {
  gridWidth: number;
  gridHeight: number;
  placedFurniture: PlacedFurniture[];
  availableFurniture: FurnitureItem[];
  studentLevel: number;
  studentCoins: number;
  studentGems: number;
  onSave: (furniture: PlacedFurniture[]) => Promise<void>;
  onPurchaseFurniture?: (itemId: string, currency: 'coins' | 'gems') => Promise<void>;
}

export const HomeBaseEditor: React.FC<HomeBaseEditorProps> = ({
  gridWidth,
  gridHeight,
  placedFurniture,
  availableFurniture,
  studentLevel,
  studentCoins,
  studentGems,
  onSave,
  onPurchaseFurniture,
}) => {
  const [furniture, setFurniture] = useState<PlacedFurniture[]>(placedFurniture);
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [draggingItem, setDraggingItem] = useState<PlacedFurniture | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [editMode, setEditMode] = useState<'place' | 'edit'>('edit');
  const [saving, setSaving] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const categories: Array<{ id: FurnitureCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: '🏠' },
    { id: 'FLOOR', label: 'Flooring', icon: '🟫' },
    { id: 'WALL', label: 'Walls', icon: '🧱' },
    { id: 'FURNITURE', label: 'Furniture', icon: '🪑' },
    { id: 'DECORATION', label: 'Decor', icon: '🖼️' },
    { id: 'LIGHTING', label: 'Lighting', icon: '💡' },
    { id: 'SPECIAL', label: 'Special', icon: '✨' },
  ];

  const ownedFurniture = availableFurniture.filter(f => f.isOwned);
  const filteredFurniture = selectedCategory === 'all'
    ? ownedFurniture
    : ownedFurniture.filter(f => f.category === selectedCategory);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(furniture);
      fireConfetti({ particleCount: 100, spread: 90 });
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceFurniture = (x: number, y: number) => {
    if (!selectedItem || editMode !== 'place') return;

    // Check if placement is valid
    if (!canPlaceAt(x, y, selectedItem.size.width, selectedItem.size.height)) {
      return;
    }

    const newPlacement: PlacedFurniture = {
      id: `placed_${Date.now()}_${Math.random()}`,
      itemId: selectedItem.id,
      item: selectedItem,
      x,
      y,
      rotation: 0,
    };

    setFurniture([...furniture, newPlacement]);
    setEditMode('edit');
    setSelectedItem(null);
  };

  const handleRemoveFurniture = (placementId: string) => {
    setFurniture(furniture.filter(f => f.id !== placementId));
  };

  const handleRotateFurniture = (placementId: string) => {
    setFurniture(furniture.map(f => {
      if (f.id === placementId) {
        const newRotation = ((f.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...f, rotation: newRotation };
      }
      return f;
    }));
  };

  const canPlaceAt = (x: number, y: number, width: number, height: number, excludeId?: string): boolean => {
    // Check bounds
    if (x < 0 || y < 0 || x + width > gridWidth || y + height > gridHeight) {
      return false;
    }

    // Check collision with other furniture
    for (const placed of furniture) {
      if (excludeId && placed.id === excludeId) continue;

      const placedWidth = placed.rotation === 90 || placed.rotation === 270 ? placed.item.size.height : placed.item.size.width;
      const placedHeight = placed.rotation === 90 || placed.rotation === 270 ? placed.item.size.width : placed.item.size.height;

      if (
        x < placed.x + placedWidth &&
        x + width > placed.x &&
        y < placed.y + placedHeight &&
        y + height > placed.y
      ) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
                Home Base Editor
              </h1>
              <p className="text-gray-400 text-lg">Design your personal math headquarters!</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShop(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </motion.button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode('edit')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  editMode === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Edit Mode
              </button>
              <button
                onClick={() => setEditMode('place')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  editMode === 'place'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Place Mode
              </button>
            </div>

            {editMode === 'place' && selectedItem && (
              <div className="flex items-center gap-2 bg-green-900 px-4 py-2 rounded-lg">
                <div className="text-3xl">{selectedItem.imageUrl}</div>
                <span className="text-white font-bold">{selectedItem.name}</span>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setEditMode('edit');
                  }}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Furniture Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-4 sticky top-8">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Furniture ({ownedFurniture.length})
              </h3>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Furniture List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFurniture.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedItem(item);
                      setEditMode('place');
                    }}
                    className={`w-full p-3 rounded-lg transition-all text-left ${
                      selectedItem?.id === item.id
                        ? 'bg-green-600 ring-2 ring-green-400'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl flex-shrink-0">{item.imageUrl}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                        <p className="text-gray-400 text-xs">{item.size.width}×{item.size.height}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
                {filteredFurniture.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <p className="text-sm">No furniture in this category</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid Editor */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="relative inline-block">
                {/* Grid */}
                <div
                  className="grid gap-1 bg-gray-800 p-4 rounded-xl"
                  style={{
                    gridTemplateColumns: `repeat(${gridWidth}, 60px)`,
                    gridTemplateRows: `repeat(${gridHeight}, 60px)`,
                  }}
                >
                  {Array.from({ length: gridHeight }).map((_, y) =>
                    Array.from({ length: gridWidth }).map((_, x) => {
                      const canPlace = editMode === 'place' && selectedItem
                        ? canPlaceAt(x, y, selectedItem.size.width, selectedItem.size.height)
                        : false;

                      return (
                        <motion.div
                          key={`${x}-${y}`}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => editMode === 'place' && handlePlaceFurniture(x, y)}
                          onMouseEnter={() => setHoveredCell({ x, y })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-[60px] h-[60px] rounded border-2 transition-colors cursor-pointer ${
                            editMode === 'place' && hoveredCell?.x === x && hoveredCell?.y === y
                              ? canPlace
                                ? 'bg-green-600/30 border-green-400'
                                : 'bg-red-600/30 border-red-400'
                              : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          }`}
                        />
                      );
                    })
                  )}

                  {/* Placed Furniture */}
                  {furniture.map((placed) => {
                    const width = placed.rotation === 90 || placed.rotation === 270
                      ? placed.item.size.height
                      : placed.item.size.width;
                    const height = placed.rotation === 90 || placed.rotation === 270
                      ? placed.item.size.width
                      : placed.item.size.height;

                    return (
                      <motion.div
                        key={placed.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          gridColumn: `${placed.x + 1} / span ${width}`,
                          gridRow: `${placed.y + 1} / span ${height}`,
                          transform: `rotate(${placed.rotation}deg)`,
                        }}
                        className="relative group"
                      >
                        {/* Furniture Display */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl flex items-center justify-center">
                          <div className="text-5xl">{placed.item.imageUrl}</div>
                        </div>

                        {/* Controls (show on hover) */}
                        {editMode === 'edit' && (
                          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRotateFurniture(placed.id)}
                              className="w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                              <RotateCw className="w-3 h-3" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveFurniture(placed.id)}
                              className="w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Furniture Shop Modal */}
        <AnimatePresence>
          {showShop && onPurchaseFurniture && (
            <FurnitureShopModal
              furniture={availableFurniture.filter(f => !f.isOwned)}
              studentLevel={studentLevel}
              studentCoins={studentCoins}
              studentGems={studentGems}
              onPurchase={onPurchaseFurniture}
              onClose={() => setShowShop(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface FurnitureShopModalProps {
  furniture: FurnitureItem[];
  studentLevel: number;
  studentCoins: number;
  studentGems: number;
  onPurchase: (itemId: string, currency: 'coins' | 'gems') => Promise<void>;
  onClose: () => void;
}

const FurnitureShopModal: React.FC<FurnitureShopModalProps> = ({
  furniture,
  studentLevel,
  studentCoins,
  studentGems,
  onPurchase,
  onClose,
}) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  const handlePurchase = async (item: FurnitureItem, currency: 'coins' | 'gems') => {
    setPurchasing(item.id);
    try {
      await onPurchase(item.id, currency);
      fireConfetti({ particleCount: 100, spread: 90 });
      setSelectedItem(null);
    } finally {
      setPurchasing(null);
    }
  };

  const canAfford = (item: FurnitureItem, currency: 'coins' | 'gems') => {
    if (currency === 'coins') return studentCoins >= item.coinsCost;
    return studentGems >= item.gemsCost;
  };

  const isLocked = (item: FurnitureItem) => {
    return studentLevel < item.requiredLevel;
  };

  const rarityColors = {
    COMMON: 'from-gray-500 to-gray-600',
    UNCOMMON: 'from-green-500 to-green-600',
    RARE: 'from-blue-500 to-blue-600',
    EPIC: 'from-purple-500 to-purple-600',
    LEGENDARY: 'from-yellow-500 to-orange-500',
    MYTHIC: 'from-red-500 to-pink-500',
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
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-auto border-2 border-purple-500/50 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-white">Furniture Shop</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-yellow-400">{studentCoins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-blue-400">{studentGems.toLocaleString()}</span>
          </div>
        </div>

        {/* Furniture Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {furniture.map((item) => {
            const locked = isLocked(item);
            const bgGradient = rarityColors[item.rarity];

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: locked ? 1 : 1.05 }}
                whileTap={{ scale: locked ? 1 : 0.95 }}
                onClick={() => !locked && setSelectedItem(item)}
                disabled={locked}
                className={`relative bg-gradient-to-br ${bgGradient} rounded-xl p-4 text-white ${
                  locked && 'opacity-50 cursor-not-allowed grayscale'
                }`}
              >
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                    <div className="text-center">
                      <Lock className="w-6 h-6 mx-auto mb-1 text-white" />
                      <div className="text-white font-bold text-xs">Lvl {item.requiredLevel}</div>
                    </div>
                  </div>
                )}

                <div className="text-5xl mb-2">{item.imageUrl}</div>
                <h4 className="font-bold text-sm mb-1 line-clamp-1">{item.name}</h4>
                <p className="text-xs opacity-75 mb-2">{item.size.width}×{item.size.height}</p>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {item.coinsCost > 0 && (
                    <span className="text-xs bg-black/30 px-2 py-1 rounded">
                      {item.coinsCost} 🪙
                    </span>
                  )}
                  {item.gemsCost > 0 && (
                    <span className="text-xs bg-black/30 px-2 py-1 rounded">
                      {item.gemsCost} 💎
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {furniture.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">All furniture unlocked!</p>
            <p className="text-sm">You own everything in the shop</p>
          </div>
        )}

        {/* Purchase Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4"
              >
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">{selectedItem.imageUrl}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h3>
                  <p className="text-gray-400 text-sm">Size: {selectedItem.size.width}×{selectedItem.size.height}</p>
                </div>

                <div className="space-y-2">
                  {selectedItem.coinsCost > 0 && (
                    <button
                      onClick={() => handlePurchase(selectedItem, 'coins')}
                      disabled={!canAfford(selectedItem, 'coins') || purchasing === selectedItem.id}
                      className={`w-full py-3 rounded-lg font-bold transition-colors ${
                        canAfford(selectedItem, 'coins')
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {purchasing === selectedItem.id ? 'Purchasing...' : `Buy for ${selectedItem.coinsCost} 🪙`}
                    </button>
                  )}
                  {selectedItem.gemsCost > 0 && (
                    <button
                      onClick={() => handlePurchase(selectedItem, 'gems')}
                      disabled={!canAfford(selectedItem, 'gems') || purchasing === selectedItem.id}
                      className={`w-full py-3 rounded-lg font-bold transition-colors ${
                        canAfford(selectedItem, 'gems')
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {purchasing === selectedItem.id ? 'Purchasing...' : `Buy for ${selectedItem.gemsCost} 💎`}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default HomeBaseEditor;