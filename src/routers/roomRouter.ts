import express from 'express';
import * as roomController from '../controllers/roomController';
import * as authController from '../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, roomController.getAllRooms)
  .post(authController.protect, roomController.createRoom);

export default router;
