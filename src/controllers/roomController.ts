import { Response, Request, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Room from '../models/roomModel';
import { CustomRequest } from './authController';
import RoomMember from '../models/roomMemberModel';
import AppError from '../utils/appError';

export const createRoom = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const newRoom = await Room.create({
      name: req.body.name,
      creator: req?.user?._id
    });

    if (!newRoom) {
      return next(new AppError('There was a problem creating the room!', 400));
    }

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

export const getAllRooms = asyncHandler(async (req: Request, res: Response) => {
  const rooms = await Room.find();

  res.status(200).json({
    message: 'success',
    rooms
  });
});

export const getRoomsJoinedByUser = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const roomsJoined = await RoomMember.find({
      userId: req?.user?._id
    });

    res.status(200).json({
      message: 'success',
      roomsJoined
    });
  }
);

export const getSingleRoom = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(new AppError('Room does not exist!', 404));
    }

    /*
    Check if the user trying to access the room
    has joined the room.
    */
    const roomMember = await RoomMember.findOne({
      roomId: room._id,
      userId: req?.user?._id
    });

    res.status(200).json({
      message: 'success',
      room,
      hasJoinedRoom: !!roomMember
    });
  }
);

export const getOnlineRoomMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const onlineMembers = await RoomMember.find({
      roomId: req.params.id,
      online: true
    }).select('-_id -roomId -online');

    res.status(200).json({
      message: 'success',
      onlineMembers
    });
  }
);

export const getRoomMembersCount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    /**
     * When joining room on socket event we made sure
     * that the document cannot be created if it already
     * exists, so this query checks for unique members.
     */
    const roomMembersCount = await RoomMember.find({
      roomId: req.params.id
    }).countDocuments();

    if (!roomMembersCount) {
      return next(
        new AppError('There was a problem getting the room members count!', 400)
      );
    }

    res.status(200).json({
      message: 'success',
      roomMembersCount
    });
  }
);
