import express from 'express';
import * as roomController from '../controllers/roomController';
import * as authController from '../controllers/authController';
import * as messageController from '../controllers/messageController';

const router = express.Router();

router
  .route('/')
  // .get(authController.protect, roomController.getAllRooms)
  .get(roomController.getAllRooms)
  .post(authController.protect, roomController.createRoom);

router.get(
  '/joined',
  authController.protect,
  roomController.getRoomsJoinedByUser
);

router
  .route('/leave/:id')
  .post(authController.protect, roomController.leaveRoom);

router
  .route('/online/:id')
  .get(authController.protect, roomController.getOnlineRoomMembers);

router
  .route('/count/:id')
  .get(authController.protect, roomController.getRoomMembersCount);

router
  .route('/messages/:id')
  .get(authController.protect, messageController.getRoomMessages)
  .post(authController.protect, messageController.createRoomMessage);

router.route('/:id').get(authController.protect, roomController.getSingleRoom);

export default router;
