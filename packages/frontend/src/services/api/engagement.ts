import apiClient from './client';
import type {
  ItemCategory,
  ShopItemCategory,
  RewardType,
  ChallengeStatus,
  FurnitureCategory,
  QuestType,
  QuestDifficulty,
  ItemRarity
} from '../../types/engagement';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  targetValue: number;
  currentProgress: number;
  progress?: number;
  target?: number;
  coinReward: number;
  xpReward: number;
  gemReward: number;
  isClaimed?: boolean;
  completedAt?: Date;
  claimedAt?: Date;
  expiresAt: Date;
}

export interface Pet {
  id: string;
  name: string;
  emoji: string;
  level: number;
  xp: number;
  currentXp?: number;
  xpToNextLevel: number;
  xpForNextLevel?: number;
  happiness: number;
  imageUrl: string;
  baseAbility: string;
  abilityValue: number;
  bonusType?: string;
  bonusValue?: number;
  lastFed?: Date;
  lastFedAt?: Date;
  lastPlayed?: Date;
  lastPlayedAt?: Date;
}

export interface ComboData {
  currentCombo: number;
  maxCombo: number;
  multiplier: number;
  sessionId: string;
}

export interface AvatarItem {
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

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopItemCategory;
  type: ShopItemCategory;
  rarity: ItemRarity;
  imageUrl: string;
  coinsCost: number;
  gemsCost: number;
  requiredLevel: number;
  stock?: number;
  isLimitedEdition: boolean;
  isFeatured: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  level?: number;
  schoolName?: string;
  className?: string;
  change?: number;
}

export interface BattlePassData {
  seasonName: string;
  seasonNumber: number;
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  endsAt: Date;
  isPremium: boolean;
  premiumCost: number;
}

export interface BattlePassReward {
  id: string;
  level: number;
  tier: 'FREE' | 'PREMIUM';
  type: RewardType;
  name: string;
  description: string;
  imageUrl: string;
  quantity?: number;
  isClaimed: boolean;
  isLocked: boolean;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  memberCount: number;
  maxMembers: number;
  totalXp: number;
  weeklyXp: number;
  rank: number;
  benefits: string[];
  createdAt: Date;
}

export interface GuildMember {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  role: 'LEADER' | 'OFFICER' | 'MEMBER';
  weeklyXp: number;
  totalContribution: number;
  joinedAt: Date;
  isOnline: boolean;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerLevel: number;
  challengerAvatar?: string;
  opponentId: string;
  opponentName: string;
  opponentLevel: number;
  opponentAvatar?: string;
  status: ChallengeStatus;
  topic: string;
  problemCount: number;
  timeLimit: number;
  wagerCoins: number;
  wagerGems: number;
  createdAt: Date;
  expiresAt: Date;
  challengerScore?: number;
  opponentScore?: number;
  winnerId?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  rarity: ItemRarity;
  imageUrl: string;
  coinsCost: number;
  gemsCost: number;
  requiredLevel: number;
  isOwned: boolean;
  size: { width: number; height: number };
}

export interface PlacedFurniture {
  id: string;
  itemId: string;
  item: FurnitureItem;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface World {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  requiredLevel: number;
  theme: string;
  isUnlocked: boolean;
  isLocked: boolean;
  chaptersCompleted: number;
  completedChapters: number;
  totalChapters: number;
  stars: number;
  maxStars: number;
  imageUrl: string;
}

export interface Chapter {
  id: string;
  worldId: string;
  name: string;
  description: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  stars: number;
  problemCount: number;
  topics: string[];
  rewardCoins: number;
  rewardXp: number;
}

// ========================================
// API FUNCTIONS
// ========================================

export const engagementApi = {
  // ========================================
  // QUESTS
  // ========================================
  async getDailyQuests(): Promise<Quest[]> {
    return apiClient.get<Quest[]>('/api/engagement/quests/daily');
  },

  async claimQuestReward(questId: string): Promise<{ coins: number; xp: number; gems: number }> {
    return apiClient.post(`/api/engagement/quests/${questId}/claim`);
  },

  // ========================================
  // PETS
  // ========================================
  async getActivePet(): Promise<Pet | null> {
    return apiClient.get<Pet | null>('/api/engagement/pets/active');
  },

  async getAllPets(): Promise<Pet[]> {
    return apiClient.get<Pet[]>('/api/engagement/pets');
  },

  async feedPet(petId: string): Promise<Pet> {
    return apiClient.post<Pet>(`/api/engagement/pets/${petId}/feed`);
  },

  async playWithPet(petId: string): Promise<Pet> {
    return apiClient.post<Pet>(`/api/engagement/pets/${petId}/play`);
  },

  async setActivePet(petId: string): Promise<void> {
    return apiClient.post(`/api/engagement/pets/${petId}/set-active`);
  },

  // ========================================
  // COMBO
  // ========================================
  async getCurrentCombo(sessionId: string): Promise<ComboData> {
    return apiClient.get<ComboData>(`/api/engagement/combo/${sessionId}`);
  },

  // ========================================
  // AVATAR
  // ========================================
  async getAvatarItems(): Promise<AvatarItem[]> {
    return apiClient.get<AvatarItem[]>('/api/engagement/avatar/items');
  },

  async getEquippedItems(): Promise<Record<string, AvatarItem>> {
    return apiClient.get<Record<string, AvatarItem>>('/api/engagement/avatar/equipped');
  },

  async equipItem(itemId: string, category: string): Promise<void> {
    return apiClient.post('/api/engagement/avatar/equip', { itemId, category });
  },

  async unequipItem(category: string): Promise<void> {
    return apiClient.post('/api/engagement/avatar/unequip', { category });
  },

  async purchaseAvatarItem(itemId: string, currency: 'coins' | 'gems'): Promise<void> {
    return apiClient.post('/api/engagement/avatar/purchase', { itemId, currency });
  },

  // ========================================
  // SHOP
  // ========================================
  async getShopItems(): Promise<ShopItem[]> {
    return apiClient.get<ShopItem[]>('/api/engagement/shop');
  },

  async getFeaturedItems(): Promise<ShopItem[]> {
    return apiClient.get<ShopItem[]>('/api/engagement/shop/featured');
  },

  async purchaseShopItem(itemId: string, currency: 'coins' | 'gems'): Promise<void> {
    return apiClient.post('/api/engagement/shop/purchase', { itemId, currency });
  },

  // ========================================
  // LEADERBOARDS
  // ========================================
  async getLeaderboard(
    type: 'XP' | 'PROBLEMS_SOLVED' | 'STREAK' | 'ACCURACY' | 'COMBO' | 'SPEED',
    scope: 'GLOBAL' | 'SCHOOL' | 'CLASS' | 'GRADE' | 'FRIENDS'
  ): Promise<LeaderboardEntry[]> {
    return apiClient.get<LeaderboardEntry[]>('/api/engagement/leaderboards', {
      params: { type, scope },
    });
  },

  // ========================================
  // BATTLE PASS
  // ========================================
  async getBattlePassData(): Promise<BattlePassData> {
    return apiClient.get<BattlePassData>('/api/engagement/battlepass');
  },

  async getBattlePassRewards(): Promise<BattlePassReward[]> {
    return apiClient.get<BattlePassReward[]>('/api/engagement/battlepass/rewards');
  },

  async claimBattlePassReward(rewardId: string): Promise<void> {
    return apiClient.post(`/api/engagement/battlepass/rewards/${rewardId}/claim`);
  },

  async purchasePremiumPass(): Promise<void> {
    return apiClient.post('/api/engagement/battlepass/purchase-premium');
  },

  // ========================================
  // GUILD
  // ========================================
  async getGuildData(): Promise<Guild | null> {
    return apiClient.get<Guild | null>('/api/engagement/guilds/my-guild');
  },

  async getGuildMembers(guildId: string): Promise<GuildMember[]> {
    return apiClient.get<GuildMember[]>(`/api/engagement/guilds/${guildId}/members`);
  },

  async getGuildEvents(guildId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/engagement/guilds/${guildId}/events`);
  },

  async leaveGuild(): Promise<void> {
    return apiClient.post('/api/engagement/guilds/leave');
  },

  // ========================================
  // CHALLENGES
  // ========================================
  async getActiveChallenges(): Promise<Challenge[]> {
    return apiClient.get<Challenge[]>('/api/engagement/challenges/active');
  },

  async getPendingChallenges(): Promise<Challenge[]> {
    return apiClient.get<Challenge[]>('/api/engagement/challenges/pending');
  },

  async getCompletedChallenges(): Promise<Challenge[]> {
    return apiClient.get<Challenge[]>('/api/engagement/challenges/completed');
  },

  async acceptChallenge(challengeId: string): Promise<void> {
    return apiClient.post(`/api/engagement/challenges/${challengeId}/accept`);
  },

  async declineChallenge(challengeId: string): Promise<void> {
    return apiClient.post(`/api/engagement/challenges/${challengeId}/decline`);
  },

  // ========================================
  // HOME BASE
  // ========================================
  async getHomeBaseFurniture(): Promise<FurnitureItem[]> {
    return apiClient.get<FurnitureItem[]>('/api/engagement/homebase/furniture');
  },

  async getPlacedFurniture(): Promise<PlacedFurniture[]> {
    return apiClient.get<PlacedFurniture[]>('/api/engagement/homebase/placed');
  },

  async saveHomeBaseLayout(furniture: PlacedFurniture[]): Promise<void> {
    return apiClient.post('/api/engagement/homebase/save', { furniture });
  },

  async purchaseFurniture(itemId: string, currency: 'coins' | 'gems'): Promise<void> {
    return apiClient.post('/api/engagement/homebase/purchase', { itemId, currency });
  },

  // ========================================
  // STORY
  // ========================================
  async getStoryWorlds(): Promise<World[]> {
    return apiClient.get<World[]>('/api/engagement/story/worlds');
  },

  async getWorldChapters(worldId: string): Promise<Chapter[]> {
    return apiClient.get<Chapter[]>(`/api/engagement/story/worlds/${worldId}/chapters`);
  },

  async startChapter(chapterId: string): Promise<void> {
    return apiClient.post(`/api/engagement/story/chapters/${chapterId}/start`);
  },

  // ========================================
  // BOSSES
  // ========================================
  async getAvailableBosses(): Promise<any[]> {
    return apiClient.get<any[]>('/api/engagement/bosses/available');
  },

  async startBossBattle(bossId: string): Promise<any> {
    return apiClient.post<any>(`/api/engagement/bosses/${bossId}/start`);
  },

  async getActiveBattle(): Promise<any | null> {
    return apiClient.get<any | null>('/api/engagement/bosses/active');
  },

  async dealDamage(bossId: string, damage: number): Promise<any> {
    return apiClient.post<any>(`/api/engagement/bosses/${bossId}/damage`, { damage });
  },

  async abandonBattle(bossId: string): Promise<any> {
    return apiClient.post<any>(`/api/engagement/bosses/${bossId}/abandon`);
  },

  async getBattleHistory(): Promise<any[]> {
    return apiClient.get<any[]>('/api/engagement/bosses/history');
  },

  // ========================================
  // TREASURE CHESTS
  // ========================================
  async generateTreasure(): Promise<any> {
    return apiClient.post<any>('/api/engagement/treasures/generate');
  },

  async openTreasure(chestId: string): Promise<any> {
    return apiClient.post<any>(`/api/engagement/treasures/${chestId}/open`);
  },

  // ========================================
  // NOTIFICATIONS
  // ========================================
  async getNotifications(): Promise<any[]> {
    return apiClient.get<any[]>('/api/engagement/notifications');
  },

  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.post(`/api/engagement/notifications/${notificationId}/read`);
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(`/api/engagement/notifications/${notificationId}`);
  },

  // ========================================
  // ANALYTICS (for dashboard)
  // ========================================
  async getDashboardStats(): Promise<any> {
    return apiClient.get('/api/engagement/analytics/dashboard');
  },
};

export default engagementApi;