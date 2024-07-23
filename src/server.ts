import app from './app';
import { Server } from 'socket.io';

import { createServer } from 'node:http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import RoomMember from './models/roomMemberModel';
import Room from './models/roomModel';
import User from './models/userModel';
import RoomMessage from './models/messageModel';

// SOCKET IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

dotenv.config({ path: '.env' });

const DB = process.env.DB?.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD!
) as string;

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    if (err) {
      console.error('There was a problem connecting to the database.');
    }
  });

const PORT = process.env.PORT || 6000;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('createRoom', () => {
    io.emit('roomAdded', 'New room added...');
  });

  socket.on('deleteRoom', async ({ userId, roomId }) => {
    try {
      await Room.findOneAndDelete({ _id: roomId, creator: userId });
      await RoomMessage.deleteMany({ roomId });
      await RoomMember.deleteMany({ roomId });

      io.emit('roomDeleted', `Room has been deleted by owner...`);
      console.log('Room deleting event triggered...');
    } catch (err) {
      console.log('err', err);
      socket.emit('error', 'Failed to delete room...');
    }
  });

  // Event: Join Room
  socket.on('joinRoom', async ({ userId, roomId }) => {
    if (!roomId || !userId) return;

    try {
      // Find or create the room
      const room = await Room.findById(roomId);
      const user = await User.findById(userId);

      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // First check if a room member already exists
      const roomMember = await RoomMember.findOne({ userId, roomId });

      if (!roomMember) {
        // Add user to room members
        await RoomMember.create({ userId, roomId });
      } else {
        if (!roomMember.online) {
          roomMember.online = true;
          await roomMember.save({ validateBeforeSave: false });

          io.to(roomId).emit(
            'userChangedRoom',
            `user ${userId} changed room: ${roomId}`
          );
        }
      }

      // Join the socket.io room
      socket.join(roomId);

      // Notify room members
      io.to(roomId).emit('message', `${user?.username} has joined the room`);

      console.log(`User ${userId} joined room ${roomId}`);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Event: Message sent in room
  socket.on('messageSent', async ({ userId, roomId, message }) => {
    await RoomMessage.create({
      userId,
      roomId,
      message
    });

    const user = await User.findById(userId);

    if (!user) return;

    const polishedMessage = {
      username: user.username,
      message,
      avatar: '' // add later
    };

    // Notify room members
    io.to(roomId).emit('messageReceived', polishedMessage);
  });

  // Handle room leaving
  /**
     * A room is considered left when?
        1. A user changes the room with intention, params room id changes
        2. A user closes the window, later on this
        3. A user logs out
        4. A user clicks leave room button
        5. Wifi goes off (optional)
     */

  /*
    1) A user changes the room with intention, params room id changes,
    so we change the online presence for that room.
  */
  socket.on('roomChanged', async ({ userId, roomId }) => {
    const roomMember = await RoomMember.findOne({ userId, roomId });

    if (roomMember) {
      // Set the online status to offline
      roomMember.online = false;
      await roomMember.save({ validateBeforeSave: false });

      io.to(roomId).emit(
        'userChangedRoom',
        `user ${userId} changed room: ${roomId}`
      );
      return;
    }
  });

  /**
   * 4) A user clicks leave room button,
   * delete all of the user messages etc...
   */
  socket.on('leftRoom', async ({ userId, roomId }) => {
    try {
      await RoomMember.deleteOne({ userId, roomId });
      await RoomMessage.deleteMany({ userId, roomId });

      io.to(roomId).emit(
        'userLeftRoom',
        `user: ${userId} left room: ${roomId}...`
      );

      console.log(`user: ${userId} left room: ${roomId}...`);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to leave room');
    }
  });

  /**
   * 3. A user logs out
   */
  socket.on('userLogout', async ({ userId, roomId }) => {
    try {
      // 1) Find all the rooms that this member is part of
      const rooms = await RoomMember.find({ userId });

      // 2) Go over each one and set online status to false
      rooms.forEach(async (room) => {
        room.online = false;

        await room.save({ validateBeforeSave: false });
      });

      console.log('user loged out event...');

      io.to(roomId).emit('userLogedOut', `user: ${userId} loged out...`);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to leave room after loging out...');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Handle any cleanup if necessary
  });
});

server.listen(PORT, () => {
  console.log(`App started on port ${PORT}!`);
});
