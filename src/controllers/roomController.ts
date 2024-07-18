import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Room from '../models/roomModel';
import { CustomRequest } from './authController';

export const createRoom = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const newRoom = await Room.create({
      name: req.body.name,
      creator: req?.user?._id
    });

    res.status(201).json({
      message: 'success',
      room: newRoom
    });
  }
);

export const getUserRooms = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const rooms = await Room.find({ creator: req?.user?._id });

    res.status(200).json({
      message: 'success',
      userRooms: rooms
    });
  }
);
