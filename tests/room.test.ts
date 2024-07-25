import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import Room, { IRoom } from '../src/models/roomModel';
import RoomMember, { IRoomMember } from '../src/models/roomMemberModel';

// Mock models
jest.mock('../src/models/roomModel');
jest.mock('../src/models/roomMemberModel');
jest.mock('../src/models/messageModel');

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Close the database connection after all tests
  await mongoose.connection.close();
});

/**
 * @description Happy path.
 */
describe('Room Controller - Create Room', () => {
  it('should create a new room', async () => {
    // Arrange
    const mockRoom = {
      name: 'Music Room',
      _id: '6698f8bf35f0398d66655337',
      creator: '669a5acd5a043e8b3a61e85e'
    };

    // Mock Room.create to return the mockRoom
    (Room.create as jest.Mock).mockResolvedValue(mockRoom);

    // Act
    const response = await request(app)
      .post('/api/v1/rooms')
      .send({ name: 'Music Room' });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('room');
    expect(Room.create).toHaveBeenCalledWith({
      creator: 'userId123',
      name: 'Music Room'
    });
  });
});

/**
 * @description If room is not created.
 */
describe('Room Controller - Create Room', () => {
  it('should return 400 if room creation fails', async () => {
    // Arrange
    // Simulate a failure
    (Room.create as jest.Mock).mockResolvedValue(null);

    // Act
    const response = await request(app)
      .post('/api/v1/rooms')
      .send({ name: 'Music Room' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({
      statusCode: 400,
      status: 'failed',
      isOperational: true
    });
    expect(response.body.message).toBe(
      'There was a problem creating the room!'
    );
  });
});

/**
 * Get all rooms
 */
describe('Room Controller - Get All Rooms', () => {
  it('should return all rooms successfully', async () => {
    // Arrange
    const mockRooms = [
      { _id: '1', name: 'Room 1', creator: 'userId123' },
      { _id: '2', name: 'Room 2', creator: 'userId123' }
    ];

    // Mock Room.find to return the mockRooms
    (Room.find as jest.Mock).mockResolvedValue(mockRooms);

    // Act
    const response = await request(app).get('/api/v1/rooms');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('rooms');
    expect(response.body.rooms).toEqual(mockRooms);
    expect(Room.find).toHaveBeenCalled();
  });

  it('should return an empty array if no rooms are found', async () => {
    // Arrange
    // No rooms found
    const mockRooms: IRoom[] = [];

    // Mock Room.find to return an empty array
    (Room.find as jest.Mock).mockResolvedValue(mockRooms);

    // Act
    const response = await request(app).get('/api/v1/rooms');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('rooms');
    expect(response.body.rooms).toEqual([]);
    expect(Room.find).toHaveBeenCalled();
  });
});

/**
 * Get single room
 */
describe('Room Controller - Get Single Room', () => {
  it('should return 404 if the room does not exist', async () => {
    // Arrange
    const roomId = 'nonexistentRoomId';

    // Mock Room.findById to return null (room not found)
    (Room.findById as jest.Mock).mockResolvedValue(null);

    // Act
    const response = await request(app).get(`/api/v1/rooms/${roomId}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'failed');
    expect(response.body).toHaveProperty('message', 'Room does not exist!');
    expect(Room.findById).toHaveBeenCalledWith(roomId);
  });

  it('should return a single room and whether the user has joined', async () => {
    // Arrange
    const mockRoom = {
      _id: '12345',
      name: 'Study Room',
      creator: 'userId123'
    };

    const mockRoomMember = {
      roomId: '12345',
      userId: 'userId123'
    };

    // Mock Room.findById to return the mockRoom
    (Room.findById as jest.Mock).mockResolvedValue(mockRoom);

    // Mock RoomMember.findOne to indicate the user has joined the room
    (RoomMember.findOne as jest.Mock).mockResolvedValue(mockRoomMember);

    // Act
    const response = await request(app).get('/api/v1/rooms/12345');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('room');
    expect(response.body.room).toEqual(mockRoom);
    expect(response.body).toHaveProperty('hasJoinedRoom', true);
    expect(Room.findById).toHaveBeenCalledWith('12345');
    expect(RoomMember.findOne).toHaveBeenCalledWith({
      roomId: '12345',
      userId: 'userId123'
    });
  });
});

/**
 * Get online room members
 */
describe('Room Controller - Get Online Room Members', () => {
  it('should return an empty array if no room online members are found', async () => {
    // Arrange
    const mockOnlineMembers: IRoomMember[] = [];

    // Mock RoomMember.find to return an object with the select method
    (RoomMember.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockOnlineMembers)
    });

    const roomId = '12345';

    // Act
    const response = await request(app).get(`/api/v1/rooms/online/${roomId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('onlineMembers');
    expect(response.body.onlineMembers).toEqual([]);
    expect(RoomMember.find).toHaveBeenCalled();
  });

  it('should return online members of the room', async () => {
    // Arrange
    const mockOnlineMembers = [{ userId: '6698f8bf35f0398d66655337' }];

    // Mock RoomMember.find to return an object with the select method
    (RoomMember.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockOnlineMembers)
    });

    const roomId = '12345';

    // Act
    const response = await request(app).get(`/api/v1/rooms/online/${roomId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'success');
    expect(response.body).toHaveProperty('onlineMembers');
    expect(response.body.onlineMembers).toEqual(mockOnlineMembers);
    expect(RoomMember.find).toHaveBeenCalledWith({
      roomId: roomId,
      online: true
    });
    expect(RoomMember.find).toHaveBeenCalledTimes(1);
  });
});

/**
 * Get room members count
 */
describe('Room Controller - Get Room Members Count', () => {
  it('should return the count of members in a room', async () => {
    // Arrange
    const mockRoomMembersCount = 10; // Example count of members

    // Mock RoomMember.find().countDocuments to return the mock count
    (RoomMember.find as jest.Mock).mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(mockRoomMembersCount)
    });

    const roomId = '12345';

    // Act
    const response = await request(app).get(`/api/v1/rooms/count/${roomId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'success');
    expect(response.body).toHaveProperty(
      'roomMembersCount',
      mockRoomMembersCount
    );
    expect(RoomMember.find).toHaveBeenCalledWith({ roomId: roomId });
    expect(RoomMember.find).toHaveBeenCalledTimes(1);
    expect(RoomMember.find().countDocuments).toHaveBeenCalledTimes(1);
  });
});
