import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import RoomModel from '../models/roomModel';

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const newRoom = await RoomModel.create({
    name: req.body.name
  });

  res.status(201).json({
    message: 'success',
    room: newRoom
  });
});
