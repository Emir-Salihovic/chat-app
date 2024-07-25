import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import createSendToken from '../utils/signToken';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/appError';

export interface CustomRequest extends Request {
  user?: IUser;
}

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body?.username || !req.body?.password) {
      return next(new AppError('Please provide username and password.', 400));
    }

    const newUser = await User.create({
      username: req.body?.username,
      password: req.body?.password
    });

    if (!newUser) {
      return next(
        new AppError('There was a problem with creating your account!', 400)
      );
    }

    createSendToken(newUser, 201, req, res);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    // 1) Check if username and password exist
    if (!username || !password) {
      return next(new AppError('Please provide username and password.', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect username or password!', 400));
    }

    // 3) If everything ok, send token to client
    createSendToken(user!, 200, req, res);
  }
);

export const logout = (_: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

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
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
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
      return next(
        new AppError(
          'The user belonging to this token does no longer exist!',
          404
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);
