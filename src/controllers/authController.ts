import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import createSendToken from '../utils/signToken';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: IUser;
}

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

export const protect = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token: string | null = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({
        error: 'You are not logged in! Please log in to get access.'
      });

      return;
    }

    // 2) Verification token
    const decoded = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token as string, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded as JwtPayload);
      });
    });

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      res.status(401).json({
        error: 'The user belonging to this token does no longer exist.'
      });

      return;
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);
