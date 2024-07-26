import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  path?: string;
  value?: string;
  errmsg?: string;
  errors?: { [key: string]: { message: string } };
  code?: number;
  isOperational: boolean;
}

const handleCastErrorDB = (err: CustomError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: CustomError) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: CustomError) => {
  const errors = Object.values(err.errors ?? {}).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: CustomError, req: Request, res: Response) => {
  return res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err: CustomError, req: Request, res: Response) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  // console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};

export default (
  err: CustomError,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
