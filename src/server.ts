import app from './app';
import SocketManager from './services/socketio.service';
import http from 'http';
import { Server } from 'socket.io';

import { createServer } from 'node:http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import RoomMember from './models/roomMemberModel';
import Room from './models/roomModel';
import User from './models/userModel';
import RoomMessage from './models/messageModel';

// SOCKET IO
const server = http.createServer(app);
const socketManager = new SocketManager(server, { cors: { origin: '*' } });

// Start the SocketManager
socketManager.register();

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

server.listen(PORT, () => {
  console.log(`App started on port ${PORT}!`);
});
