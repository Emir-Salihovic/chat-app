import { NextFunction, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { CustomRequest } from './authController';
import User from '../models/userModel';
import AppError from '../utils/appError';

export const whoAmI = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req?.user?._id);

    if (!user) {
      return next(
        new AppError('There was a problem fetching your profile data.', 400)
      );
    }

    res.status(200).json({
      message: 'success',
      user
    });
  }
);
