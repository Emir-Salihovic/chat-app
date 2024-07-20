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

  // Event: Join Room
  socket.on('joinRoom', async ({ userId, roomId }) => {
    try {
      // Find or create the room
      const room = await Room.findById(roomId);
      const user = await User.findById(userId);

      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Add user to room members
      await RoomMember.create({ userId, roomId });

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

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Handle any cleanup if necessary
  });
});

server.listen(PORT, () => {
  console.log(`App started on port ${PORT}!`);
});
