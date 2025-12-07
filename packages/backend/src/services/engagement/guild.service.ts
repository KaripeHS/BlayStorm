// @ts-nocheck
import { PrismaClient, GuildRole, GuildEventType } from '@prisma/client';

const prisma = new PrismaClient();

export class GuildService {
  /**
   * Create a new guild
   */
  async createGuild(
    founderId: string,
    data: {
      name: string;
      tag: string;
      description: string;
      emblemUrl: string;
      bannerUrl?: string;
      isPublic?: boolean;
      requiresApproval?: boolean;
      minLevel?: number;
      minGrade?: number;
    }
  ) {
    // Check if founder is already in a guild
    const existingMembership = await prisma.guildMember.findUnique({
      where: { studentId: founderId },
    });

    if (existingMembership) {
      throw new Error('Already in a guild');
    }

    // Check if name or tag is taken
    const existing = await prisma.guild.findFirst({
      where: {
        OR: [
          { name: data.name },
          { tag: data.tag },
        ],
      },
    });

    if (existing) {
      throw new Error('Guild name or tag already taken');
    }

    // Create guild and add founder as leader
    const guild = await prisma.$transaction(async (tx) => {
      const newGuild = await tx.guild.create({
        data: {
          ...data,
          currentMembers: 1,
        },
      });

      // Add founder as leader
      await tx.guildMember.create({
        data: {
          guildId: newGuild.id,
          studentId: founderId,
          role: 'LEADER',
        },
      });

      // Update student profile
      await tx.studentProfile.update({
        where: { id: founderId },
        data: {
          guildId: newGuild.id,
          guildRole: 'LEADER',
        },
      });

      return newGuild;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: founderId,
        type: 'SYSTEM',
        title: 'Guild Created!',
        message: `You created ${guild.name} [${guild.tag}]! Invite friends to join!`,
      },
    });

    return guild;
  }

  /**
   * Search for guilds
   */
  async searchGuilds(filters?: {
    name?: string;
    isPublic?: boolean;
    minLevel?: number;
    minGrade?: number;
  }) {
    const where: any = {};

    if (filters?.name) {
      where.OR = [
        { name: { contains: filters.name, mode: 'insensitive' } },
        { tag: { contains: filters.name, mode: 'insensitive' } },
      ];
    }

    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters?.minLevel) {
      where.minLevel = { lte: filters.minLevel };
    }

    if (filters?.minGrade) {
      where.minGrade = { lte: filters.minGrade };
    }

    const guilds = await prisma.guild.findMany({
      where,
      orderBy: [
        { currentMembers: 'desc' },
        { level: 'desc' },
      ],
      take: 50,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return guilds;
  }

  /**
   * Join a guild
   */
  async joinGuild(studentId: string, guildId: string) {
    const [student, guild] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { currentLevel: true, gradeLevel: true, guildId: true },
      }),
      prisma.guild.findUnique({
        where: { id: guildId },
      }),
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.guildId) {
      throw new Error('Already in a guild');
    }

    if (!guild) {
      throw new Error('Guild not found');
    }

    // Check requirements
    if (student.currentLevel < guild.minLevel) {
      throw new Error(`Level ${guild.minLevel} required`);
    }

    if (guild.minGrade && student.gradeLevel < guild.minGrade) {
      throw new Error(`Grade ${guild.minGrade} required`);
    }

    // Check if guild is full
    if (guild.currentMembers >= guild.memberLimit) {
      throw new Error('Guild is full');
    }

    // Add member
    await prisma.$transaction(async (tx) => {
      await tx.guildMember.create({
        data: {
          guildId,
          studentId,
          role: 'RECRUIT',
        },
      });

      await tx.guild.update({
        where: { id: guildId },
        data: {
          currentMembers: { increment: 1 },
        },
      });

      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          guildId,
          guildRole: 'RECRUIT',
        },
      });
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'GUILD_INVITE',
        title: 'Joined Guild!',
        message: `Welcome to ${guild.name}!`,
      },
    });

    return { success: true };
  }

  /**
   * Leave guild
   */
  async leaveGuild(studentId: string) {
    const member = await prisma.guildMember.findUnique({
      where: { studentId },
      include: { guild: true },
    });

    if (!member) {
      throw new Error('Not in a guild');
    }

    // Leaders cannot leave (must transfer leadership first)
    if (member.role === 'LEADER') {
      throw new Error('Leaders must transfer leadership before leaving');
    }

    await prisma.$transaction(async (tx) => {
      await tx.guildMember.delete({
        where: { studentId },
      });

      await tx.guild.update({
        where: { id: member.guildId },
        data: {
          currentMembers: { decrement: 1 },
        },
      });

      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          guildId: null,
          guildRole: null,
        },
      });
    });

    return { success: true };
  }

  /**
   * Promote/demote member
   */
  async updateMemberRole(guildId: string, studentId: string, newRole: GuildRole, actorId: string) {
    // Check if actor has permission
    const actor = await prisma.guildMember.findUnique({
      where: { studentId: actorId },
    });

    if (!actor || actor.guildId !== guildId) {
      throw new Error('Not authorized');
    }

    if (actor.role !== 'LEADER') {
      throw new Error('Only leaders can change roles');
    }

    // Update role
    await prisma.$transaction(async (tx) => {
      await tx.guildMember.update({
        where: { studentId },
        data: { role: newRole },
      });

      await tx.studentProfile.update({
        where: { id: studentId },
        data: { guildRole: newRole },
      });
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        title: 'Guild Role Updated!',
        message: `You are now a ${newRole} in your guild!`,
      },
    });

    return { success: true };
  }

  /**
   * Contribute XP to guild
   */
  async contributeXp(studentId: string, xp: number) {
    const member = await prisma.guildMember.findUnique({
      where: { studentId },
      include: { guild: true },
    });

    if (!member) {
      return null; // Not in a guild
    }

    const GUILD_XP_PER_LEVEL = 10000;
    const newGuildXp = member.guild.xp + xp;
    const levelsGained = Math.floor(newGuildXp / GUILD_XP_PER_LEVEL);

    await prisma.$transaction(async (tx) => {
      // Update guild
      await tx.guild.update({
        where: { id: member.guildId },
        data: {
          xp: newGuildXp % GUILD_XP_PER_LEVEL,
          level: { increment: levelsGained },
          totalXp: { increment: xp },
          totalProblems: { increment: 1 },
        },
      });

      // Update member contribution
      await tx.guildMember.update({
        where: { studentId },
        data: {
          contributionXp: { increment: xp },
          weeklyXp: { increment: xp },
          lastActiveAt: new Date(),
        },
      });
    });

    // Notify on level up
    if (levelsGained > 0) {
      const members = await prisma.guildMember.findMany({
        where: { guildId: member.guildId },
        select: { studentId: true },
      });

      for (const m of members) {
        await prisma.notification.create({
          data: {
            userId: m.studentId,
            type: 'SYSTEM',
            title: 'Guild Level Up!',
            message: `${member.guild.name} reached level ${member.guild.level + levelsGained}!`,
          },
        });
      }
    }

    return member.guild;
  }

  /**
   * Get guild leaderboard (by contribution)
   */
  async getGuildLeaderboard(guildId: string, timeframe: 'all' | 'weekly' = 'all') {
    const orderBy = timeframe === 'weekly' ? { weeklyXp: 'desc' } : { contributionXp: 'desc' };

    const members = await prisma.guildMember.findMany({
      where: { guildId },
      orderBy,
      include: {
        student: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return members.map((member, index) => ({
      rank: index + 1,
      studentId: member.studentId,
      displayName: member.student.user.profile?.displayName || 'Unknown',
      role: member.role,
      contributionXp: member.contributionXp,
      weeklyXp: member.weeklyXp,
      joinedAt: member.joinedAt,
    }));
  }

  /**
   * Create guild event
   */
  async createGuildEvent(
    guildId: string,
    data: {
      eventType: GuildEventType;
      title: string;
      description: string;
      targetValue: number;
      rewards: any;
      startDate: Date;
      endDate: Date;
    },
    creatorId: string
  ) {
    // Check if creator is leader/officer
    const creator = await prisma.guildMember.findUnique({
      where: { studentId: creatorId },
    });

    if (!creator || creator.guildId !== guildId) {
      throw new Error('Not authorized');
    }

    if (!['LEADER', 'OFFICER'].includes(creator.role)) {
      throw new Error('Only leaders and officers can create events');
    }

    const event = await prisma.guildEvent.create({
      data: {
        guildId,
        ...data,
      },
    });

    // Notify all members
    const members = await prisma.guildMember.findMany({
      where: { guildId },
      select: { studentId: true },
    });

    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.studentId,
          type: 'EVENT_STARTED',
          title: 'New Guild Event!',
          message: `${data.title} - Help your guild reach ${data.targetValue}!`,
        },
      });
    }

    return event;
  }

  /**
   * Reset weekly XP (cron job - runs every Monday)
   */
  async resetWeeklyXp() {
    await prisma.guildMember.updateMany({
      where: {},
      data: {
        weeklyXp: 0,
      },
    });

    console.log('Reset weekly guild XP');
  }

  /**
   * Get guild details
   */
  async getGuild(guildId: string) {
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        members: {
          orderBy: { contributionXp: 'desc' },
          take: 10,
          include: {
            student: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        events: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    return guild;
  }

  /**
   * Get top guilds leaderboard
   */
  async getTopGuilds(limit: number = 20) {
    const guilds = await prisma.guild.findMany({
      orderBy: [
        { level: 'desc' },
        { totalXp: 'desc' },
      ],
      take: limit,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return guilds.map((guild, index) => ({
      rank: index + 1,
      ...guild,
      memberCount: guild._count.members,
    }));
  }

  /**
   * Get guild chat history
   */
  async getGuildMessages(guildId: string, limit: number = 50, before?: Date) {
    const where: any = { guildId, isDeleted: false };

    if (before) {
      where.createdAt = { lt: before };
    }

    const messages = await prisma.guildMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get user info for all senders
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: senderIds } },
      select: {
        userId: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    return messages.reverse().map((message) => {
      const profile = profileMap.get(message.senderId);
      return {
        id: message.id,
        guildId: message.guildId,
        senderId: message.senderId,
        senderName: profile?.displayName || 'Unknown',
        senderAvatar: profile?.avatarUrl,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
      };
    });
  }

  /**
   * Delete guild message (soft delete)
   */
  async deleteGuildMessage(messageId: string, requesterId: string) {
    const message = await prisma.guildMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Check if requester is the sender or a guild leader/officer
    const member = await prisma.guildMember.findFirst({
      where: {
        guildId: message.guildId,
        student: { userId: requesterId },
      },
    });

    const isSender = message.senderId === requesterId;
    const isModeratorOrLeader = member && ['LEADER', 'OFFICER'].includes(member.role);

    if (!isSender && !isModeratorOrLeader) {
      throw new Error('Not authorized to delete this message');
    }

    await prisma.guildMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return true;
  }
}

export default new GuildService();