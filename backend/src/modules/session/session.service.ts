import prisma from "../../config/db";
import { checkArcGeneration } from "../arcs/arcs.service";
import { evolveSessionAttributes } from "../attributes/attributes.service";
import { generateSessionMemory } from "../memory/memory.service";

export function getReflectiveDayStart(): Date {
  const now = new Date();
  const boundary = new Date(now);
  boundary.setHours(5, 0, 0, 0);
  if (now < boundary) {
    boundary.setDate(boundary.getDate() - 1);
  }
  return boundary;
}

export async function getOrCreateSession(userId: string) {
  const todayBoundary = getReflectiveDayStart();

  const staleSessions = await prisma.session.findMany({
    where: {
      userId,
      closedAt: null,
      processed: false,
      date: { lt: todayBoundary }
    }
  });

  for (const stale of staleSessions) {
    await processSession(stale.id);
  }

  return prisma.session.upsert({
    where: { userId_date: { userId, date: todayBoundary } },
    create: { userId, date: todayBoundary },
    update: {}
  });
}

export async function processSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { entries: true }
  });

  if (!session || session.processed) return;

  await prisma.session.update({
    where: { id: sessionId },
    data: { closedAt: new Date(), processed: true }
  });

  if (session.entries.length === 0) return;

  await generateSessionMemory(session);
  await evolveSessionAttributes(session);
  await checkArcGeneration(session.userId);
}
