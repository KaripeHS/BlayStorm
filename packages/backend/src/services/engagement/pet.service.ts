import { PrismaClient, ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class PetService {
  /**
   * Get all available pets filtered by level and rarity
   */
  async getAvailablePets(studentLevel?: number, rarity?: ItemRarity) {
    const where: any = {
      OR: [
        { isLimitedEdition: false },
        {
          AND: [
            { isLimitedEdition: true },
            { availableUntil: { gte: new Date() } },
          ],
        },
      ],
    };

    if (studentLevel) {
      where.unlockLevel = { lte: studentLevel };
    }

    if (rarity) {
      where.rarity = rarity;
    }

    const pets = await prisma.pet.findMany({
      where,
      orderBy: [{ rarity: 'asc' }, { unlockLevel: 'asc' }],
    });

    return pets;
  }

  /**
   * Get pets owned by a student
   */
  async getStudentPets(studentId: string) {
    const pets = await prisma.studentPet.findMany({
      where: { studentId },
      include: {
        pet: true,
      },
      orderBy: [{ isActive: 'desc' }, { level: 'desc' }],
    });

    return pets;
  }

  /**
   * Get active pet for a student
   */
  async getActivePet(studentId: string) {
    const activePet = await prisma.studentPet.findFirst({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        pet: true,
      },
    });

    return activePet;
  }

  /**
   * Purchase a pet with coins or gems
   */
  async purchasePet(studentId: string, petId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        coins: true,
        gems: true,
        currentLevel: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    // Check if already owned
    const existing = await prisma.studentPet.findUnique({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
    });

    if (existing) {
      throw new Error('Pet already owned');
    }

    // Check level requirement
    if (student.currentLevel < pet.unlockLevel) {
      throw new Error(
        `Level ${pet.unlockLevel} required (current: ${student.currentLevel})`
      );
    }

    // Check if pet is available
    if (pet.isLimitedEdition && pet.availableUntil) {
      if (new Date() > pet.availableUntil) {
        throw new Error('Pet is no longer available');
      }
    }

    // Validate currency
    if (pet.coinCost && student.coins < pet.coinCost) {
      throw new Error(
        `Not enough coins (need ${pet.coinCost}, have ${student.coins})`
      );
    }

    if (pet.gemCost && student.gems < pet.gemCost) {
      throw new Error(
        `Not enough gems (need ${pet.gemCost}, have ${student.gems})`
      );
    }

    // Execute purchase
    const result = await prisma.$transaction(async (tx) => {
      // Deduct currency
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: pet.coinCost ? { decrement: pet.coinCost } : undefined,
          gems: pet.gemCost ? { decrement: pet.gemCost } : undefined,
        },
      });

      // Add pet to collection
      const studentPet = await tx.studentPet.create({
        data: {
          studentId,
          petId,
          happiness: 100,
        },
        include: {
          pet: true,
        },
      });

      return studentPet;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'New Pet Unlocked!',
        message: `You've unlocked ${pet.name}!`,
        imageUrl: pet.imageUrl,
      },
    });

    return result;
  }

  /**
   * Set active pet for a student
   */
  async setActivePet(studentId: string, petId: string) {
    // Check if student owns this pet
    const studentPet = await prisma.studentPet.findUnique({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
    });

    if (!studentPet) {
      throw new Error('Pet not owned');
    }

    // Deactivate all other pets
    await prisma.studentPet.updateMany({
      where: {
        studentId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Activate the selected pet
    await prisma.studentPet.update({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
      data: {
        isActive: true,
      },
    });

    // Update student profile
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        selectedPetId: petId,
      },
    });

    return { success: true };
  }

  /**
   * Feed a pet to increase happiness
   */
  async feedPet(studentId: string, petId: string) {
    const studentPet = await prisma.studentPet.findUnique({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
    });

    if (!studentPet) {
      throw new Error('Pet not owned');
    }

    // Feeding costs 10 coins
    const FEED_COST = 10;
    const HAPPINESS_GAIN = 10;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { coins: true },
    });

    if (!student || student.coins < FEED_COST) {
      throw new Error('Not enough coins to feed pet');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: { decrement: FEED_COST },
        },
      });

      // Increase happiness (max 100)
      const updatedPet = await tx.studentPet.update({
        where: {
          studentId_petId: {
            studentId,
            petId,
          },
        },
        data: {
          happiness: Math.min(studentPet.happiness + HAPPINESS_GAIN, 100),
          lastFedAt: new Date(),
        },
        include: {
          pet: true,
        },
      });

      return updatedPet;
    });

    return result;
  }

  /**
   * Play with a pet to increase happiness
   */
  async playWithPet(studentId: string, petId: string) {
    const studentPet = await prisma.studentPet.findUnique({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
    });

    if (!studentPet) {
      throw new Error('Pet not owned');
    }

    // Playing increases happiness by 5 (can only play once per hour)
    const HAPPINESS_GAIN = 5;
    const COOLDOWN_MINUTES = 60;

    if (studentPet.lastPlayedAt) {
      const timeSinceLastPlay =
        Date.now() - studentPet.lastPlayedAt.getTime();
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastPlay < cooldownMs) {
        const minutesRemaining = Math.ceil(
          (cooldownMs - timeSinceLastPlay) / (60 * 1000)
        );
        throw new Error(
          `Pet needs rest. Try again in ${minutesRemaining} minutes.`
        );
      }
    }

    const updatedPet = await prisma.studentPet.update({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
      data: {
        happiness: Math.min(studentPet.happiness + HAPPINESS_GAIN, 100),
        lastPlayedAt: new Date(),
      },
      include: {
        pet: true,
      },
    });

    return updatedPet;
  }

  /**
   * Award XP to active pet after solving problems
   */
  async awardPetXp(studentId: string, xp: number) {
    const activePet = await prisma.studentPet.findFirst({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        pet: true,
      },
    });

    if (!activePet) {
      return null; // No active pet
    }

    const XP_PER_LEVEL = 100;
    const newXp = activePet.xp + xp;
    const levelsGained = Math.floor(newXp / XP_PER_LEVEL);

    const updatedPet = await prisma.studentPet.update({
      where: { id: activePet.id },
      data: {
        xp: newXp % XP_PER_LEVEL,
        level: { increment: levelsGained },
      },
      include: {
        pet: true,
      },
    });

    if (levelsGained > 0) {
      // Create notification
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'SYSTEM',
          title: 'Pet Leveled Up!',
          message: `${activePet.pet.name} reached level ${updatedPet.level}!`,
          imageUrl: activePet.pet.imageUrl,
        },
      });
    }

    return updatedPet;
  }

  /**
   * Calculate total bonuses from active pet
   */
  async getPetBonuses(studentId: string) {
    const activePet = await this.getActivePet(studentId);

    if (!activePet) {
      return {
        coinBonus: 0,
        xpBonus: 0,
        hintDiscount: 0,
      };
    }

    // Bonuses scale with pet level and happiness
    const happinessMultiplier = activePet.happiness / 100;
    const levelMultiplier = 1 + activePet.level * 0.05; // 5% per level

    return {
      coinBonus:
        activePet.pet.coinBonus * happinessMultiplier * levelMultiplier,
      xpBonus: activePet.pet.xpBonus * happinessMultiplier * levelMultiplier,
      hintDiscount:
        activePet.pet.hintDiscount * happinessMultiplier * levelMultiplier,
    };
  }

  /**
   * Decay pet happiness over time (cron job)
   */
  async decayPetHappiness() {
    const DECAY_AMOUNT = 5;
    const HOURS_SINCE_LAST_INTERACTION = 24;

    const cutoffDate = new Date(
      Date.now() - HOURS_SINCE_LAST_INTERACTION * 60 * 60 * 1000
    );

    await prisma.studentPet.updateMany({
      where: {
        OR: [
          { lastFedAt: { lt: cutoffDate } },
          { lastPlayedAt: { lt: cutoffDate } },
          {
            AND: [
              { lastFedAt: null },
              { lastPlayedAt: null },
              { unlockedAt: { lt: cutoffDate } },
            ],
          },
        ],
        happiness: { gt: 0 },
      },
      data: {
        happiness: { decrement: DECAY_AMOUNT },
      },
    });
  }

  /**
   * Award pet as reward
   */
  async awardPet(studentId: string, petId: string) {
    const existing = await prisma.studentPet.findUnique({
      where: {
        studentId_petId: {
          studentId,
          petId,
        },
      },
    });

    if (existing) {
      return existing; // Already owned
    }

    const studentPet = await prisma.studentPet.create({
      data: {
        studentId,
        petId,
        happiness: 100,
      },
      include: {
        pet: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'New Pet Unlocked!',
        message: `You've received ${studentPet.pet.name} as a reward!`,
        imageUrl: studentPet.pet.imageUrl,
      },
    });

    return studentPet;
  }
}

export default new PetService();