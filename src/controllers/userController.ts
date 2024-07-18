import { Request, Response } from 'express';
import User from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import createSendToken from '../utils/signToken';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body?.username || !req.body?.password) {
    res.status(400).json({
      error: 'Please provide username and password.'
    });
  }

  const newUser = await User.create({
    username: req.body?.username,
    password: req.body?.password
  });

  createSendToken(newUser, 201, req, res);
});
