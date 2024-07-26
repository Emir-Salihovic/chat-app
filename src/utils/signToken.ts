import { Request, Response } from 'express';
import { IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id as string);

  if (process.env.NODE_ENV === 'development') {
    res.cookie('jwt', token, {
      expires: new Date(
        +Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN! * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });
  } else {
    res.cookie('jwt', token, {
      expires: new Date(
        +Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN! * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: 'none'
    });
  }

  // Remove password from output
  user.password = undefined!;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user
    }
  });
};

export default createSendToken;
