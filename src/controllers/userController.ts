import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1) Check if username and password exist
  if (!username || !password) {
    res.status(400).json({
      error: 'Please provide username and password.'
    });
    return;
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(401).json({
      error: 'Incorrect username or password'
    });
    return;
  }

  // 3) If everything ok, send token to client
  createSendToken(user as IUser, 200, req, res);
});
