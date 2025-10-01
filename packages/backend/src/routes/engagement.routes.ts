import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as engagementController from '../controllers/engagement.controller';

const router = Router();

// All engagement routes require authentication
router.use(authenticate);

// ==================== AVATAR ROUTES ====================
router.get('/avatar/items', engagementController.getAvailableAvatarItems);
router.get('/avatar/current', engagementController.getCurrentAvatar);
router.post('/avatar/purchase', engagementController.purchaseAvatarItem);
router.post('/avatar/equip', engagementController.equipAvatarItem);
router.post('/avatar/unequip', engagementController.unequipAvatarItem);

// ==================== PET ROUTES ====================
router.get('/pets/available', engagementController.getAvailablePets);
router.get('/pets/bonuses', engagementController.getPetBonuses);
router.post('/pets/purchase', engagementController.purchasePet);
router.post('/pets/activate', engagementController.setActivePet);
router.post('/pets/feed', engagementController.feedPet);
router.post('/pets/play', engagementController.playWithPet);

// ==================== QUEST ROUTES ====================
router.get('/quests/active', engagementController.getActiveQuests);
router.get('/quests/stats', engagementController.getQuestStats);
router.post('/quests/:questId/complete', engagementController.completeQuest);

// ==================== COMBO ROUTES ====================
router.get('/combo/current', engagementController.getCurrentCombo);
router.get('/combo/stats', engagementController.getComboStats);
router.get('/combo/top', engagementController.getTopCombos);

// ==================== BOSS ROUTES ====================
router.get('/bosses/available', engagementController.getAvailableBosses);
router.get('/bosses/:bossId/battle', engagementController.getBossBattle);
router.get('/bosses/:bossId/leaderboard', engagementController.getBossLeaderboard);
router.post('/bosses/battle/start', engagementController.startBossBattle);

// ==================== SHOP ROUTES ====================
router.get('/shop/items', engagementController.getShopItems);
router.get('/shop/validate', engagementController.validatePurchase);
router.post('/shop/purchase', engagementController.purchaseShopItem);

// ==================== INVENTORY ROUTES ====================
router.get('/inventory', engagementController.getInventory);
router.post('/inventory/use', engagementController.useItem);

// ==================== TREASURE ROUTES ====================
router.get('/treasure/unopened', engagementController.getUnopenedChests);
router.post('/treasure/:chestId/open', engagementController.openChest);

// ==================== STORY ROUTES ====================
router.get('/story/worlds', engagementController.getWorlds);
router.get('/story/worlds/:worldId/chapters', engagementController.getChapters);
router.post('/story/chapter/start', engagementController.startChapter);
router.post('/story/chapter/:chapterId/complete', engagementController.completeChapter);

// ==================== GUILD ROUTES ====================
router.get('/guilds/:guildId', engagementController.getGuild);
router.get('/guilds/:guildId/leaderboard', engagementController.getGuildLeaderboard);
router.post('/guilds/create', engagementController.createGuild);
router.post('/guilds/join', engagementController.joinGuild);
router.post('/guilds/leave', engagementController.leaveGuild);

// ==================== CHALLENGE ROUTES ====================
router.get('/challenges', engagementController.getChallenges);
router.get('/challenges/stats', engagementController.getChallengeStats);
router.post('/challenges/create', engagementController.createChallenge);
router.post('/challenges/:challengeId/accept', engagementController.acceptChallenge);

// ==================== LEADERBOARD ROUTES ====================
router.get('/leaderboards', engagementController.getLeaderboard);
router.get('/leaderboards/rank', engagementController.getPlayerRank);

// ==================== BATTLE PASS ROUTES ====================
router.get('/battlepass', engagementController.getBattlePass);
router.post('/battlepass/claim', engagementController.claimBattlePassReward);
router.post('/battlepass/upgrade', engagementController.upgradeToPremium);

// ==================== HOME BASE ROUTES ====================
router.get('/homebase', engagementController.getHomeBase);
router.get('/homebase/:ownerId/visit', engagementController.visitHomeBase);
router.post('/homebase/layout', engagementController.updateHomeBaseLayout);
router.post('/homebase/furniture/purchase', engagementController.purchaseFurniture);

// ==================== EVENT ROUTES ====================
router.get('/events/active', engagementController.getActiveEvents);
router.get('/events/:eventId/eligibility', engagementController.checkEventEligibility);
router.post('/events/:eventId/claim', engagementController.claimEventRewards);

// ==================== ANALYTICS ROUTES ====================
router.get('/analytics', engagementController.getStudentAnalytics);

// ==================== NOTIFICATION ROUTES ====================
router.get('/notifications', engagementController.getNotifications);
router.get('/notifications/unread/count', engagementController.getUnreadCount);
router.post('/notifications/:notificationId/read', engagementController.markAsRead);
router.post('/notifications/read-all', engagementController.markAllAsRead);

export default router;