import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { CustomRequest } from './authController';
import User from '../models/userModel';

export const whoAmI = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const user = await User.findById(req?.user?._id);

    if (!user) {
      return res.status(404).json({
        error: 'There was a problem fetching your profile data.'
      });
    }

    res.status(200).json({
      message: 'success',
      user
    });
  }
);
