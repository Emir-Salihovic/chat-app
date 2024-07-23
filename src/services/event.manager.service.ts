import { Socket } from 'socket.io';
import { Observer } from './observer.service';
import {
  COMMON_EVENTS,
  CommonRoomCredentials,
  ERROR_EVENTS,
  ROOM_EVENTS
} from '../events';
import Room from '../models/roomModel';
import RoomMessage from '../models/messageModel';
import RoomMember from '../models/roomMemberModel';
import User from '../models/userModel';

/**
 * @description Class that handles specific events by implementing the Observer interface.
 */
class EventManager implements Observer {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Called when an event occurs, triggering the appropriate handler.
  public update(event: string, data: any): void {
    console.log(`Event received: Event: ${event}`);

    const polishedData: CommonRoomCredentials = data[0];

    switch (event) {
      case COMMON_EVENTS.DISCONNECT:
        this.handleDisconnect(data);
        break;

      case ROOM_EVENTS.CREATE_ROOM:
        this.handleCreateRoom();
        break;

      case ROOM_EVENTS.DELETE_ROOM:
        this.handleDeleteRoom(polishedData);
        break;

      case ROOM_EVENTS.JOIN_ROOM:
        this.handleJoinRoom(polishedData);
        break;

      case ROOM_EVENTS.MESSAGE_SENT:
        this.handleMessageSent(polishedData);
        break;

      case ROOM_EVENTS.ROOM_CHANGED:
        this.handleRoomChanged(polishedData);
        break;

      case ROOM_EVENTS.LEFT_ROOM:
        this.handleRoomLeaving(polishedData);
        break;

      case ROOM_EVENTS.USER_LOGOUT:
        this.handleUserLogout(polishedData);
        break;

      // Add more cases for different events
      default:
        console.warn(`No handler for event: ${event}`);
        break;
    }
  }

  // Handles the disconnect event.
  private handleDisconnect(data: any): void {
    const { socket } = data;
    console.log(`User disconnected: ${socket.id}`);
    // Disconnect logic here
  }

  private handleCreateRoom(): void {
    this.socket.emit(ROOM_EVENTS.ROOM_ADDED, 'New room added...');
  }

  private async handleDeleteRoom(data: CommonRoomCredentials) {
    const { roomId, userId } = data;

    try {
      await Room.findOneAndDelete({ _id: roomId, creator: userId });
      await RoomMessage.deleteMany({ roomId });
      await RoomMember.deleteMany({ roomId });

      this.socket.emit(
        ROOM_EVENTS.ROOM_DELETED,
        `Room has been deleted by owner...`
      );
      console.log('Room deleting event triggered...');
    } catch (err) {
      console.log('err', err);
      this.socket.emit(ERROR_EVENTS.ERROR, 'Failed to delete room...');
    }
  }

  private async handleJoinRoom(data: CommonRoomCredentials) {
    const { roomId, userId } = data;

    if (!roomId || !userId) return;

    try {
      // Find or create the room
      const room = await Room.findById(roomId);
      const user = await User.findById(userId);

      if (!room) {
        this.socket.emit(ERROR_EVENTS.ERROR, 'Room not found');
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

          this.socket
            .to(roomId)
            .emit(
              ROOM_EVENTS.USER_CHANGED_ROOM,
              `user ${userId} changed room: ${roomId}`
            );
        }
      }

      // Join the socket.io room
      this.socket.join(roomId);

      // Notify room members
      this.socket
        .to(roomId)
        .emit(
          ROOM_EVENTS.JOINED_MESSAGE,
          `${user?.username} has joined the room`
        );

      console.log(`User ${userId} joined room ${roomId}`);
    } catch (err) {
      console.error(err);
      this.socket.emit('error', 'Failed to join room');
    }
  }

  private async handleMessageSent(data: CommonRoomCredentials) {
    console.log('data message sent', data);
    const { message, userId, roomId } = data;

    const user = await User.findById(userId);

    if (!user) return;

    const polishedMessage = {
      username: user.username,
      message,
      avatar: '' // add later
    };

    // Notify room members
    this.socket.to(roomId).emit('messageReceived', polishedMessage);
  }

  /*
    A user changes the room with intention, params room id changes,
    so we change the online presence for that room.
  */
  private async handleRoomChanged(data: CommonRoomCredentials) {
    const { roomId, userId } = data;

    const roomMember = await RoomMember.findOne({ userId, roomId });

    if (roomMember) {
      // Set the online status to offline
      roomMember.online = false;
      await roomMember.save({ validateBeforeSave: false });

      this.socket
        .to(roomId)
        .emit(
          ROOM_EVENTS.USER_CHANGED_ROOM,
          `user ${userId} changed room: ${roomId}`
        );
      return;
    }
  }

  /**
   * A user clicks leave room button,
   * delete all of the user messages etc...
   */
  private async handleRoomLeaving(data: CommonRoomCredentials) {
    const { roomId, userId } = data;

    try {
      await RoomMember.deleteOne({ userId, roomId });
      await RoomMessage.deleteMany({ userId, roomId });

      this.socket
        .to(roomId)
        .emit(
          ROOM_EVENTS.USER_LEFT_ROOM,
          `user: ${userId} left room: ${roomId}...`
        );

      console.log(`user: ${userId} left room: ${roomId}...`);
    } catch (err) {
      console.error(err);
      this.socket.emit('error', 'Failed to leave room');
    }
  }

  /**
   * A user logs out
   */
  private async handleUserLogout(data: CommonRoomCredentials) {
    const { userId, roomId } = data;

    try {
      // 1) Find all the rooms that this member is part of
      const rooms = await RoomMember.find({ userId });

      // 2) Go over each one and set online status to false
      rooms.forEach(async (room) => {
        room.online = false;
        await room.save({ validateBeforeSave: false });
      });

      this.socket
        .to(roomId)
        .emit(ROOM_EVENTS.USER_LOGED_OUT, `user: ${userId} loged out...`);
    } catch (err) {
      console.error(err);
      this.socket.emit('error', 'Failed to leave room after loging out...');
    }
  }
}

export default EventManager;
