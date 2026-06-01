import {
  getUserProfile
} from "./user.service";

export const getProfile =
  async (
    req: any,
    res: any
  ) => {
    try {
      const user =
        await getUserProfile(
          req.params.id
        );

      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };