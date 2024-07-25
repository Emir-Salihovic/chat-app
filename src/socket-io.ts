import { Server, Socket } from 'socket.io';
import { COMMON_EVENTS, CommonRoomCredentials, ROOM_EVENTS } from './events';
import Room from './models/roomModel';
import User from './models/userModel';
import RoomMember from './models/roomMemberModel';
import RoomMessage from './models/messageModel';

const handleJoinRoom = (io: Server, socket: Socket) => {
  // Event: Join Room
  socket.on(
    ROOM_EVENTS.JOIN_ROOM,
    async ({ userId, roomId }: CommonRoomCredentials) => {
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
              ROOM_EVENTS.USER_CHANGED_ROOM,
              `user ${userId} changed room: ${roomId}`
            );
          }
        }

        // Join the socket.io room
        socket.join(roomId);

        // Notify room members
        io.to(roomId).emit(
          ROOM_EVENTS.JOINED_MESSAGE,
          `${user?.username} has joined the room`
        );

        console.log(`User ${userId} joined room ${roomId}`);
      } catch (err) {
        console.error(err);
        socket.emit('error', 'Failed to join room');
      }
    }
  );
};

const handleSendMessage = (io: Server, socket: Socket) => {
  // Event: Message sent in room
  socket.on(ROOM_EVENTS.MESSAGE_SENT, async ({ userId, roomId, message }) => {
    const user = await User.findById(userId);

    if (!user) return;

    const polishedMessage = {
      username: user.username,
      message,
      avatar: '' // add later
    };

    // Notify room members
    io.to(roomId).emit(ROOM_EVENTS.MESSAGE_RECEIVED, polishedMessage);
  });
};

const handleCreateRoom = (io: Server, socket: Socket) => {
  socket.on(ROOM_EVENTS.CREATE_ROOM, () => {
    io.emit(ROOM_EVENTS.ROOM_ADDED, 'New room added...');
  });
};

const handleDeleteRoom = (io: Server, socket: Socket) => {
  socket.on(ROOM_EVENTS.DELETE_ROOM, async ({ userId, roomId }) => {
    try {
      await Room.findOneAndDelete({ _id: roomId, creator: userId });
      await RoomMessage.deleteMany({ roomId });
      await RoomMember.deleteMany({ roomId });

      io.emit(ROOM_EVENTS.ROOM_DELETED, `Room has been deleted by owner...`);
      console.log('Room deleting event triggered...');
    } catch (err) {
      console.log('err', err);
      socket.emit('error', 'Failed to delete room...');
    }
  });
};

const handleRoomChanged = (io: Server, socket: Socket) => {
  /*
      1) A user changes the room with intention, params room id changes,
      so we change the online presence for that room.
    */
  socket.on(ROOM_EVENTS.ROOM_CHANGED, async ({ userId, roomId }) => {
    const roomMember = await RoomMember.findOne({ userId, roomId });

    if (roomMember) {
      // Set the online status to offline
      roomMember.online = false;
      await roomMember.save({ validateBeforeSave: false });

      io.to(roomId).emit(
        ROOM_EVENTS.USER_CHANGED_ROOM,
        `user ${userId} changed room: ${roomId}`
      );
      return;
    }
  });
};

const handleRoomLeaving = (io: Server, socket: Socket) => {
  /**
   * 4) A user clicks leave room button,
   * delete all of the user messages etc...
   */
  socket.on(ROOM_EVENTS.LEFT_ROOM, async ({ userId, roomId }) => {
    try {
      await RoomMember.deleteOne({ userId, roomId });
      // await RoomMessage.deleteMany({ userId, roomId });

      io.to(roomId).emit(
        ROOM_EVENTS.USER_LEFT_ROOM,
        `user: ${userId} left room: ${roomId}...`
      );

      console.log(`user: ${userId} left room: ${roomId}...`);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to leave room');
    }
  });
};

const handleUserLogout = (io: Server, socket: Socket) => {
  /**
   * 3. A user logs out
   */
  socket.on(ROOM_EVENTS.USER_LOGOUT, async ({ userId, roomId }) => {
    try {
      // 1) Find all the rooms that this member is part of
      const rooms = await RoomMember.find({ userId });

      // 2) Go over each one and set online status to false
      rooms.forEach(async (room) => {
        room.online = false;

        await room.save({ validateBeforeSave: false });
      });

      console.log('user loged out event...');

      io.to(roomId).emit(
        ROOM_EVENTS.USER_LOGED_OUT,
        `user: ${userId} loged out...`
      );
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Failed to leave room after loging out...');
    }
  });
};

const initializeSocket = (io: Server) => {
  io.on(COMMON_EVENTS.CONNECT, (socket: Socket) => {
    console.log('a user connected');

    handleJoinRoom(io, socket);
    handleSendMessage(io, socket);
    handleCreateRoom(io, socket);
    handleDeleteRoom(io, socket);
    handleRoomChanged(io, socket);
    handleRoomLeaving(io, socket);
    handleUserLogout(io, socket);

    // Handle disconnection
    socket.on(COMMON_EVENTS.DISCONNECT, () => {
      console.log('A user disconnected');
      // Handle any cleanup if necessary
    });
  });
};

export default initializeSocket;
