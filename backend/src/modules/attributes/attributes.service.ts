import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

export class AttributesService {
  /**
   * Scans a user's attributes and applies stagnation and decay rules.
   * If an attribute has no positive/negative activity for 7+ days:
   * - Status becomes "STAGNANT".
   * - Automatically loses 1 point per day for each day it remains stagnant and unchecked.
   */
  async checkStagnantStatus(userId: string): Promise<void> {
    const now = new Date();
    const activeThresholdMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const decayIntervalMs = 24 * 60 * 60 * 1000; // 1 day

    // Get all attributes of the user
    const attributes = await prisma.attribute.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    for (const attribute of attributes) {
      // Find when the last active change (non-decay) happened
      const lastActiveHistory = await prisma.attributeHistory.findFirst({
        where: {
          attributeId: attribute.id,
          NOT: {
            reason: {
              contains: "Stagnation decay"
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      const lastActiveDate = lastActiveHistory ? lastActiveHistory.createdAt : attribute.createdAt;
      const msSinceLastActive = now.getTime() - lastActiveDate.getTime();

      if (msSinceLastActive > activeThresholdMs) {
        // This attribute is stagnant!
        const isCurrentlyActive = attribute.status === "ACTIVE";

        // Update status to STAGNANT if it was active
        if (isCurrentlyActive) {
          await prisma.attribute.update({
            where: { id: attribute.id },
            data: { status: "STAGNANT" }
          });
        }

        // Apply decay: check when the last decay was recorded
        const lastDecayHistory = await prisma.attributeHistory.findFirst({
          where: {
            attributeId: attribute.id,
            reason: {
              contains: "Stagnation decay"
            }
          },
          orderBy: { createdAt: "desc" }
        });

        // We should start decaying from either:
        // 1. The 7th day after last active history (when stagnation officially begins)
        // 2. The last decay history date, if decay already started
        const decayStartDate = lastDecayHistory 
          ? lastDecayHistory.createdAt 
          : new Date(lastActiveDate.getTime() + activeThresholdMs);

        const msSinceLastDecay = now.getTime() - decayStartDate.getTime();
        const daysToDecay = Math.floor(msSinceLastDecay / decayIntervalMs);

        if (daysToDecay > 0 && attribute.points > 0) {
          // Calculate new point value
          const decayPoints = 1; // 1 point per day
          const totalDecay = daysToDecay * decayPoints;
          const newPoints = Math.max(0, attribute.points - totalDecay);
          const actualDeducted = attribute.points - newPoints;

          if (actualDeducted > 0) {
            // Update points in DB
            await prisma.attribute.update({
              where: { id: attribute.id },
              data: {
                points: newPoints,
                status: "STAGNANT"
              }
            });

            // Write a history record representing the accumulated decay
            await prisma.attributeHistory.create({
              data: {
                attributeId: attribute.id,
                delta: -actualDeducted,
                reason: `Stagnation decay: -${actualDeducted} points over ${daysToDecay} days`
              }
            });
          }
        }
      }
    }
  }

  /**
   * Gets all attributes for a user.
   * Runs the stagnant check first to guarantee freshness.
   */
  async getAttributes(userId: string) {
    // Run the decay check
    await this.checkStagnantStatus(userId);

    const attributes = await prisma.attribute.findMany({
      where: { userId },
      orderBy: { points: "desc" },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    // Identify primary attribute (highest points)
    const primaryAttribute = attributes.length > 0 ? attributes[0] : null;

    return {
      attributes,
      primaryAttribute: primaryAttribute ? { name: primaryAttribute.name, points: primaryAttribute.points } : null
    };
  }

  /**
   * Fetches the detailed activity/delta history for a single attribute.
   */
  async getAttributeHistory(userId: string, attributeId: string) {
    const attribute = await prisma.attribute.findFirst({
      where: { id: attributeId, userId },
      include: {
        history: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!attribute) {
      throw new AppError("Attribute not found.", 404);
    }

    return attribute;
  }
}
