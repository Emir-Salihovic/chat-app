import { Request, Response } from 'express';
import User from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import createSendToken from '../utils/signToken';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const newUser = await User.create({
    username: req.body?.username,
    password: req.body?.password
  });

  createSendToken(newUser, 201, req, res);
});
