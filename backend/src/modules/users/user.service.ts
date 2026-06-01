import prisma from "../../config/db";

export const getUserProfile =
  async (
    userId: string
  ) => {
    return await prisma.user.findUnique({
      where: {
        id: userId
      },

      include: {
        attributes: true,
        arcs: true
      }
    });
  };