import express from 'express';
import { rateLimit } from 'express-rate-limit';

import * as roomController from '../controllers/roomController';
import * as authController from '../controllers/authController';
import * as messageController from '../controllers/messageController';

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  limit: 10, // each IP can make up to 10 requests per `windowsMs` (2 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
  message: 'You are only allowed to send 10 messages in 2 minutes!'
});

const router = express.Router();

router
  .route('/')
  .get(roomController.getAllRooms)
  .post(authController.protect, roomController.createRoom);

router.get(
  '/joined',
  authController.protect,
  roomController.getRoomsJoinedByUser
);

router
  .route('/online/:id')
  .get(authController.protect, roomController.getOnlineRoomMembers);

router
  .route('/count/:id')
  .get(authController.protect, roomController.getRoomMembersCount);

router
  .route('/messages/:id')
  .get(authController.protect, messageController.getRoomMessages)
  .post(limiter, authController.protect, messageController.createRoomMessage);

router.route('/:id').get(authController.protect, roomController.getSingleRoom);

export default router;
