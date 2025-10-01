import { useState, useEffect, useCallback } from 'react';
import engagementApi, * as EngagementTypes from '../services/api/engagement';

// ========================================
// QUESTS HOOK
// ========================================
export function useDailyQuests() {
  const [quests, setQuests] = useState<EngagementTypes.Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getDailyQuests();
      setQuests(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const claimReward = useCallback(async (questId: string) => {
    try {
      await engagementApi.claimQuestReward(questId);
      await fetchQuests(); // Refresh quests after claiming
    } catch (err) {
      throw err;
    }
  }, [fetchQuests]);

  return { quests, loading, error, claimReward, refresh: fetchQuests };
}

// ========================================
// PETS HOOK
// ========================================
export function useActivePet() {
  const [pet, setPet] = useState<EngagementTypes.Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getActivePet();
      setPet(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  const feedPet = useCallback(async () => {
    if (!pet) return;
    try {
      const updated = await engagementApi.feedPet(pet.id);
      setPet(updated);
    } catch (err) {
      throw err;
    }
  }, [pet]);

  const playWithPet = useCallback(async () => {
    if (!pet) return;
    try {
      const updated = await engagementApi.playWithPet(pet.id);
      setPet(updated);
    } catch (err) {
      throw err;
    }
  }, [pet]);

  return { pet, loading, error, feedPet, playWithPet, refresh: fetchPet };
}

// ========================================
// AVATAR HOOK
// ========================================
export function useAvatar() {
  const [items, setItems] = useState<EngagementTypes.AvatarItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<string, EngagementTypes.AvatarItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvatar = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsData, equippedData] = await Promise.all([
        engagementApi.getAvatarItems(),
        engagementApi.getEquippedItems(),
      ]);
      setItems(itemsData);
      setEquippedItems(equippedData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const equipItem = useCallback(async (itemId: string, category: string) => {
    try {
      await engagementApi.equipItem(itemId, category);
      await fetchAvatar();
    } catch (err) {
      throw err;
    }
  }, [fetchAvatar]);

  const unequipItem = useCallback(async (category: string) => {
    try {
      await engagementApi.unequipItem(category);
      await fetchAvatar();
    } catch (err) {
      throw err;
    }
  }, [fetchAvatar]);

  const purchaseItem = useCallback(async (itemId: string, currency: 'coins' | 'gems') => {
    try {
      await engagementApi.purchaseAvatarItem(itemId, currency);
      await fetchAvatar();
    } catch (err) {
      throw err;
    }
  }, [fetchAvatar]);

  return { items, equippedItems, loading, error, equipItem, unequipItem, purchaseItem, refresh: fetchAvatar };
}

// ========================================
// SHOP HOOK
// ========================================
export function useShop() {
  const [items, setItems] = useState<EngagementTypes.ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShop = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getShopItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const purchaseItem = useCallback(async (itemId: string, currency: 'coins' | 'gems') => {
    try {
      await engagementApi.purchaseShopItem(itemId, currency);
      await fetchShop();
    } catch (err) {
      throw err;
    }
  }, [fetchShop]);

  return { items, loading, error, purchaseItem, refresh: fetchShop };
}

// ========================================
// LEADERBOARD HOOK
// ========================================
export function useLeaderboard(
  type: 'XP' | 'PROBLEMS_SOLVED' | 'STREAK' | 'ACCURACY' | 'COMBO' | 'SPEED',
  scope: 'GLOBAL' | 'SCHOOL' | 'CLASS' | 'GRADE' | 'FRIENDS'
) {
  const [entries, setEntries] = useState<EngagementTypes.LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getLeaderboard(type, scope);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [type, scope]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, error, refresh: fetchLeaderboard };
}

// ========================================
// BATTLE PASS HOOK
// ========================================
export function useBattlePass() {
  const [battlePassData, setBattlePassData] = useState<EngagementTypes.BattlePassData | null>(null);
  const [rewards, setRewards] = useState<EngagementTypes.BattlePassReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBattlePass = useCallback(async () => {
    try {
      setLoading(true);
      const [dataRes, rewardsRes] = await Promise.all([
        engagementApi.getBattlePassData(),
        engagementApi.getBattlePassRewards(),
      ]);
      setBattlePassData(dataRes);
      setRewards(rewardsRes);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattlePass();
  }, [fetchBattlePass]);

  const claimReward = useCallback(async (rewardId: string) => {
    try {
      await engagementApi.claimBattlePassReward(rewardId);
      await fetchBattlePass();
    } catch (err) {
      throw err;
    }
  }, [fetchBattlePass]);

  const purchasePremium = useCallback(async () => {
    try {
      await engagementApi.purchasePremiumPass();
      await fetchBattlePass();
    } catch (err) {
      throw err;
    }
  }, [fetchBattlePass]);

  return { battlePassData, rewards, loading, error, claimReward, purchasePremium, refresh: fetchBattlePass };
}

// ========================================
// GUILD HOOK
// ========================================
export function useGuild() {
  const [guild, setGuild] = useState<EngagementTypes.Guild | null>(null);
  const [members, setMembers] = useState<EngagementTypes.GuildMember[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGuild = useCallback(async () => {
    try {
      setLoading(true);
      const guildData = await engagementApi.getGuildData();
      setGuild(guildData);

      if (guildData) {
        const [membersData, eventsData] = await Promise.all([
          engagementApi.getGuildMembers(guildData.id),
          engagementApi.getGuildEvents(guildData.id),
        ]);
        setMembers(membersData);
        setEvents(eventsData);
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuild();
  }, [fetchGuild]);

  const leaveGuild = useCallback(async () => {
    try {
      await engagementApi.leaveGuild();
      await fetchGuild();
    } catch (err) {
      throw err;
    }
  }, [fetchGuild]);

  return { guild, members, events, loading, error, leaveGuild, refresh: fetchGuild };
}

// ========================================
// CHALLENGES HOOK
// ========================================
export function useChallenges() {
  const [activeChallenges, setActiveChallenges] = useState<EngagementTypes.Challenge[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<EngagementTypes.Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<EngagementTypes.Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const [active, pending, completed] = await Promise.all([
        engagementApi.getActiveChallenges(),
        engagementApi.getPendingChallenges(),
        engagementApi.getCompletedChallenges(),
      ]);
      setActiveChallenges(active);
      setPendingChallenges(pending);
      setCompletedChallenges(completed);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const acceptChallenge = useCallback(async (challengeId: string) => {
    try {
      await engagementApi.acceptChallenge(challengeId);
      await fetchChallenges();
    } catch (err) {
      throw err;
    }
  }, [fetchChallenges]);

  const declineChallenge = useCallback(async (challengeId: string) => {
    try {
      await engagementApi.declineChallenge(challengeId);
      await fetchChallenges();
    } catch (err) {
      throw err;
    }
  }, [fetchChallenges]);

  return {
    activeChallenges,
    pendingChallenges,
    completedChallenges,
    loading,
    error,
    acceptChallenge,
    declineChallenge,
    refresh: fetchChallenges
  };
}

// ========================================
// HOME BASE HOOK
// ========================================
export function useHomeBase() {
  const [availableFurniture, setAvailableFurniture] = useState<EngagementTypes.FurnitureItem[]>([]);
  const [placedFurniture, setPlacedFurniture] = useState<EngagementTypes.PlacedFurniture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHomeBase = useCallback(async () => {
    try {
      setLoading(true);
      const [furniture, placed] = await Promise.all([
        engagementApi.getHomeBaseFurniture(),
        engagementApi.getPlacedFurniture(),
      ]);
      setAvailableFurniture(furniture);
      setPlacedFurniture(placed);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeBase();
  }, [fetchHomeBase]);

  const saveLayout = useCallback(async (furniture: EngagementTypes.PlacedFurniture[]) => {
    try {
      await engagementApi.saveHomeBaseLayout(furniture);
      setPlacedFurniture(furniture);
    } catch (err) {
      throw err;
    }
  }, []);

  const purchaseFurniture = useCallback(async (itemId: string, currency: 'coins' | 'gems') => {
    try {
      await engagementApi.purchaseFurniture(itemId, currency);
      await fetchHomeBase();
    } catch (err) {
      throw err;
    }
  }, [fetchHomeBase]);

  return { availableFurniture, placedFurniture, loading, error, saveLayout, purchaseFurniture, refresh: fetchHomeBase };
}

// ========================================
// STORY HOOK
// ========================================
export function useStory() {
  const [worlds, setWorlds] = useState<EngagementTypes.World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorlds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getStoryWorlds();
      setWorlds(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorlds();
  }, [fetchWorlds]);

  const getChapters = useCallback(async (worldId: string) => {
    try {
      return await engagementApi.getWorldChapters(worldId);
    } catch (err) {
      throw err;
    }
  }, []);

  const startChapter = useCallback(async (chapterId: string) => {
    try {
      await engagementApi.startChapter(chapterId);
      await fetchWorlds();
    } catch (err) {
      throw err;
    }
  }, [fetchWorlds]);

  return { worlds, loading, error, getChapters, startChapter, refresh: fetchWorlds };
}

// ========================================
// BOSSES HOOK
// ========================================
export function useBosses() {
  const [bosses, setBosses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBosses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getAvailableBosses();
      setBosses(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBosses();
  }, [fetchBosses]);

  const startBattle = useCallback(async (bossId: string) => {
    try {
      const result = await engagementApi.startBossBattle(bossId);
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  return { bosses, loading, error, startBattle, refresh: fetchBosses };
}