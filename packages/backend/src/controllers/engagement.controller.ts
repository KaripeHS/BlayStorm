// @ts-nocheck
import { Response, NextFunction } from 'express';
import avatarService from '../services/engagement/avatar.service';
import petService from '../services/engagement/pet.service';
import questService from '../services/engagement/quest.service';
import comboService from '../services/engagement/combo.service';
import bossService from '../services/engagement/boss.service';
import shopService from '../services/engagement/shop.service';
import inventoryService from '../services/engagement/inventory.service';
import treasureService from '../services/engagement/treasure.service';
import storyService from '../services/engagement/story.service';
import guildService from '../services/engagement/guild.service';
import challengeService from '../services/engagement/challenge.service';
import leaderboardService from '../services/engagement/leaderboard.service';
import battlePassService from '../services/engagement/battlepass.service';
import homeBaseService from '../services/engagement/homebase.service';
import eventService from '../services/engagement/event.service';
import analyticsService from '../services/engagement/analytics.service';
import notificationService from '../services/engagement/notification.service';

// Extended request type with user data populated by auth middleware
type Request = any;

// ==================== AVATAR ROUTES ====================

export const getAvailableAvatarItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { category, rarity, minLevel } = req.query;

    const items = await avatarService.getAvailableItems(studentId, {
      category: category as any,
      rarity: rarity as any,
      minLevel: minLevel ? parseInt(minLevel as string) : undefined,
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const purchaseAvatarItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { itemId } = req.body;

    const result = await avatarService.purchaseItem(studentId, itemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const equipAvatarItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { itemId } = req.body;

    const result = await avatarService.equipItem(studentId, itemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const unequipAvatarItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { category } = req.body;

    const result = await avatarService.unequipItem(studentId, category);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const avatar = await avatarService.getCurrentAvatar(studentId);
    res.json(avatar);
  } catch (error) {
    next(error);
  }
};

// ==================== PET ROUTES ====================

export const getAvailablePets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { rarity, minLevel } = req.query;

    const pets = await petService.getAvailablePets(studentId, {
      rarity: rarity as any,
      minLevel: minLevel ? parseInt(minLevel as string) : undefined,
    });

    res.json(pets);
  } catch (error) {
    next(error);
  }
};

export const purchasePet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { petId } = req.body;

    const result = await petService.purchasePet(studentId, petId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setActivePet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { petId } = req.body;

    const result = await petService.setActivePet(studentId, petId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const feedPet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { petId } = req.body;

    const result = await petService.feedPet(studentId, petId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const playWithPet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { petId } = req.body;

    const result = await petService.playWithPet(studentId, petId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPetBonuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const bonuses = await petService.getPetBonuses(studentId);
    res.json(bonuses);
  } catch (error) {
    next(error);
  }
};

// ==================== QUEST ROUTES ====================

export const getActiveQuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const quests = await questService.getActiveQuests(studentId);
    res.json(quests);
  } catch (error) {
    next(error);
  }
};

export const completeQuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { questId } = req.params;

    const result = await questService.completeQuest(studentId, questId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getQuestStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const stats = await questService.getQuestStats(studentId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// ==================== COMBO ROUTES ====================

export const getCurrentCombo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const combo = await comboService.getCurrentCombo(studentId);
    res.json(combo);
  } catch (error) {
    next(error);
  }
};

export const getComboStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const stats = await comboService.getComboStats(studentId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getTopCombos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;
    const combos = await comboService.getTopCombos(limit ? parseInt(limit as string) : 10);
    res.json(combos);
  } catch (error) {
    next(error);
  }
};

// ==================== BOSS ROUTES ====================

export const getAvailableBosses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const bosses = await bossService.getAvailableBosses(studentId);
    res.json(bosses);
  } catch (error) {
    next(error);
  }
};

export const startBossBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { bossId } = req.body;

    const battle = await bossService.startBossBattle(studentId, bossId);
    res.json(battle);
  } catch (error) {
    next(error);
  }
};

export const getBossBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { bossId } = req.params;

    const battle = await bossService.getBossBattle(studentId, bossId);
    res.json(battle);
  } catch (error) {
    next(error);
  }
};

export const getBossLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bossId } = req.params;
    const { limit } = req.query;

    const leaderboard = await bossService.getBossLeaderboard(
      bossId,
      limit ? parseInt(limit as string) : 10
    );
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

// ==================== SHOP ROUTES ====================

export const getShopItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, rarity, featured } = req.query;

    const items = await shopService.getShopItems({
      type: type as any,
      rarity: rarity as any,
      featuredOnly: featured === 'true',
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const purchaseShopItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { itemId, currency } = req.body;

    const result = await shopService.purchaseItem(studentId, itemId, currency);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const validatePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { itemId, currency } = req.query;

    const validation = await shopService.validatePurchase(
      studentId,
      itemId as string,
      currency as 'coins' | 'gems'
    );

    res.json(validation);
  } catch (error) {
    next(error);
  }
};

// ==================== INVENTORY ROUTES ====================

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { type } = req.query;

    const inventory = await inventoryService.getInventory(studentId, type as any);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const useItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { itemId } = req.body;

    const result = await inventoryService.useItem(studentId, itemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== TREASURE ROUTES ====================

export const getUnopenedChests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const chests = await treasureService.getUnopenedChests(studentId);
    res.json(chests);
  } catch (error) {
    next(error);
  }
};

export const openChest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { chestId } = req.params;

    const rewards = await treasureService.openChest(studentId, chestId);
    res.json(rewards);
  } catch (error) {
    next(error);
  }
};

// ==================== STORY ROUTES ====================

export const getWorlds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const worlds = await storyService.getWorlds(studentId);
    res.json(worlds);
  } catch (error) {
    next(error);
  }
};

export const getChapters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { worldId } = req.params;

    const chapters = await storyService.getChapters(studentId, worldId);
    res.json(chapters);
  } catch (error) {
    next(error);
  }
};

export const startChapter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { chapterId } = req.body;

    const result = await storyService.startChapter(studentId, chapterId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const completeChapter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { chapterId } = req.params;
    const { problemsSolved, problemsCorrect, timeSpent } = req.body;

    const result = await storyService.completeChapter(
      studentId,
      chapterId,
      problemsSolved,
      problemsCorrect,
      timeSpent
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== GUILD ROUTES ====================

export const createGuild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const founderId = req.user!.studentProfile!.id;
    const { name, tag, description } = req.body;

    const guild = await guildService.createGuild(founderId, { name, tag, description });
    res.json(guild);
  } catch (error) {
    next(error);
  }
};

export const joinGuild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { guildId } = req.body;

    const result = await guildService.joinGuild(studentId, guildId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const leaveGuild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const result = await guildService.leaveGuild(studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getGuild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const guild = await guildService.getGuild(guildId);
    res.json(guild);
  } catch (error) {
    next(error);
  }
};

export const getGuildLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const { timeframe } = req.query;

    const leaderboard = await guildService.getGuildLeaderboard(
      guildId,
      timeframe as 'all' | 'weekly'
    );

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

// ==================== CHALLENGE ROUTES ====================

export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initiatorId = req.user!.studentProfile!.id;
    const { receiverId, type, topicFilter, problemCount } = req.body;

    const challenge = await challengeService.createChallenge(initiatorId, receiverId, {
      type,
      topicFilter,
      problemCount,
    });

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

export const acceptChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { challengeId } = req.params;
    const result = await challengeService.acceptChallenge(challengeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { status } = req.query;

    const challenges = await challengeService.getChallenges(studentId, status as any);
    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

export const getChallengeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const stats = await challengeService.getChallengeStats(studentId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// ==================== LEADERBOARD ROUTES ====================

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, scope } = req.query;
    const leaderboard = await leaderboardService.getLeaderboard(type as any, scope as any);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

export const getPlayerRank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { type, scope } = req.query;

    const rank = await leaderboardService.getPlayerRank(studentId, type as any, scope as any);
    res.json(rank);
  } catch (error) {
    next(error);
  }
};

// ==================== BATTLE PASS ROUTES ====================

export const getBattlePass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const battlePass = await battlePassService.getCurrentPass(studentId);
    res.json(battlePass);
  } catch (error) {
    next(error);
  }
};

export const claimBattlePassReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { level, track } = req.body;

    const result = await battlePassService.claimReward(studentId, level, track);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const upgradeToPremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const result = await battlePassService.upgradeToPremium(studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== HOME BASE ROUTES ====================

export const getHomeBase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const homeBase = await homeBaseService.getHomeBase(studentId);
    res.json(homeBase);
  } catch (error) {
    next(error);
  }
};

export const updateHomeBaseLayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { layout } = req.body;

    const result = await homeBaseService.updateLayout(studentId, layout);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const purchaseFurniture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { furnitureId } = req.body;

    const result = await homeBaseService.purchaseFurniture(studentId, furnitureId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const visitHomeBase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = req.user!.studentProfile!.id;
    const { ownerId } = req.params;

    const homeBase = await homeBaseService.visitHomeBase(visitorId, ownerId);
    res.json(homeBase);
  } catch (error) {
    next(error);
  }
};

// ==================== EVENT ROUTES ====================

export const getActiveEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await eventService.getActiveEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const checkEventEligibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { eventId } = req.params;

    const eligible = await eventService.checkEligibility(studentId, eventId);
    res.json({ eligible });
  } catch (error) {
    next(error);
  }
};

export const claimEventRewards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { eventId } = req.params;

    const result = await eventService.claimEventRewards(studentId, eventId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== ANALYTICS ROUTES ====================

export const getStudentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentProfile!.id;
    const { startDate, endDate } = req.query;

    const analytics = await analyticsService.getStudentAnalytics(
      studentId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// ==================== NOTIFICATION ROUTES ====================

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { unreadOnly, type, limit } = req.query;

    const notifications = await notificationService.getNotifications(userId, {
      unreadOnly: unreadOnly === 'true',
      type: type as any,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    const result = await notificationService.markAsRead(notificationId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const count = await notificationService.markAllAsRead(userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};