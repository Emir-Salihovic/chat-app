import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { CustomRequest } from './authController';
import RoomMessage from '../models/messageModel';
import RoomMember from '../models/roomMemberModel';
import AppError from '../utils/appError';

export const createRoomMessage = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const newMessage = await RoomMessage.create({
      userId: req?.user?._id,
      roomId: req.params.id,
      message: req.body.message
    });

    if (!newMessage) {
      return next(
        new AppError('There was a problem with sending a message!', 400)
      );
    }

    res.status(201).json({
      message: 'success',
      newMessage
    });
  }
);

export const getRoomMessages = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    let roomMessages: any = [];

    /**
     * Check if the user should see the messages.
     */
    const roomMember = await RoomMember.findOne({
      roomId: req.params.id,
      userId: req?.user?._id
    });

    if (roomMember) {
      roomMessages = await RoomMessage.find({
        roomId: req.params.id
      }).populate('userId');
    }

    res.status(200).json({
      roomMessages
    });
  }
);
