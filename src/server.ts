import app from './app';
import { Server } from 'socket.io';

import { createServer } from 'node:http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import initializeSocket from './socket-io';

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

initializeSocket(io);

server.listen(PORT, () => {
  console.log(`App started on port ${PORT}!`);
});
