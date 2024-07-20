import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { CustomRequest } from './authController';
import RoomMessage from '../models/messageModel';

export const createRoomMessage = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const newMessage = await RoomMessage.create({
      userId: req?.user?._id,
      roomId: req.params.id,
      message: req.body.message
    });

    res.status(201).json({
      message: 'success',
      newMessage
    });
  }
);

export const getRoomMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const roomMessages = await RoomMessage.find({
      roomId: req.params.id
    }).populate('userId');

    res.status(200).json({
      roomMessages
    });
  }
);
