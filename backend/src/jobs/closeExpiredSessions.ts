import cron from "node-cron";
import { getReflectiveDayStart, processSession } from "../modules/session/session.service";
import prisma from "../config/db";

export function startSessionCron() {
  // runs at 5:00 AM every day
  cron.schedule("0 5 * * *", async () => {
    const boundary = getReflectiveDayStart();

    const expiredSessions = await prisma.session.findMany({
      where: {
        closedAt: null,
        processed: false,
        date: { lt: boundary }
      }
    });

    for (const session of expiredSessions) {
      await processSession(session.id);
    }
  });
}
