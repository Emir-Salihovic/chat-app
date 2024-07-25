import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import RoomMember from '../src/models/roomMemberModel';
import RoomMessage from '../src/models/messageModel';

// Mock models
jest.mock('../src/models/roomModel');
jest.mock('../src/models/roomMemberModel');
jest.mock('../src/models/messageModel');

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
 * Create room message
 */
describe('Room Controller - Create Room Message', () => {
  it('should create a new message and return it', async () => {
    // Arrange
    const mockNewMessage = {
      _id: '66a188e66763f3365de67dbd',
      userId: 'userId123',
      roomId: '669a8c3c628d2f27c77eb14a',
      message: 'Hello World',
      createdAt: '2024-07-25T00:00:00.000Z'
    };

    // Mock RoomMessage.create to return the mockNewMessage
    (RoomMessage.create as jest.Mock).mockResolvedValue(mockNewMessage);

    const roomId = '669a8c3c628d2f27c77eb14a';
    const message = 'Hello World';

    // Act
    const response = await request(app)
      .post(`/api/v1/rooms/messages/${roomId}`)
      .send({ message });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'success');
    expect(response.body).toHaveProperty('newMessage');
    expect(response.body.newMessage).toEqual(mockNewMessage);
    expect(RoomMessage.create).toHaveBeenCalledWith({
      userId: 'userId123',
      roomId,
      message
    });
  });

  it('should return a 400 error if the message could not be created', async () => {
    // Arrange
    // Mock RoomMessage.create to return null to simulate a failure
    (RoomMessage.create as jest.Mock).mockResolvedValue(null);

    const roomId = '669a8c3c628d2f27c77eb14a'; // Example room ID
    const message = 'Hello World'; // Example message

    // Act
    const response = await request(app)
      .post(`/api/v1/rooms/messages/${roomId}`)
      .send({ message });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('statusCode', 400);
    expect(response.body.error).toHaveProperty('status', 'failed');
    expect(response.body.message).toBe(
      'There was a problem with sending a message!'
    );
    expect(RoomMessage.create).toHaveBeenCalledWith({
      userId: 'userId123',
      roomId,
      message
    });
  });
});

/**
 * Get room messages
 */
describe('Room Controller - Get Room Messages', () => {
  it('should return room messages with populated user details if the user is a member', async () => {
    // Arrange
    const mockRoomMessages = [
      {
        _id: '66a188e66763f3365de67dbd',
        userId: {
          _id: '6698f8bf35f0398d66655337',
          username: 'testuser',
          avatar: 'https://mighty.tools/mockmind-api/content/human/44.jpg'
        },
        roomId: '669a8c3c628d2f27c77eb14a',
        message: 'picke',
        createdAt: '2024-07-24T23:06:14.218Z'
      }
    ];

    // Mock RoomMember.findOne to return a room member
    (RoomMember.findOne as jest.Mock).mockResolvedValue({
      _id: 'memberId',
      roomId: '669a8c3c628d2f27c77eb14a',
      userId: 'userId123'
    });

    // Mock RoomMessage.find to return mock room messages
    (RoomMessage.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRoomMessages)
    });

    const roomId = '669a8c3c628d2f27c77eb14a';

    // Act
    const response = await request(app).get(`/api/v1/rooms/messages/${roomId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('roomMessages');
    expect(response.body.roomMessages).toEqual(mockRoomMessages);
    expect(RoomMember.findOne).toHaveBeenCalledWith({
      roomId,
      userId: 'userId123'
    });
    expect(RoomMessage.find).toHaveBeenCalledWith({ roomId });
    expect(RoomMessage.find().populate).toHaveBeenCalledWith('userId');
  });

  it('should return an empty array if the user is not a member', async () => {
    // Arrange
    // Mock RoomMember.findOne to return null (user is not a member)
    (RoomMember.findOne as jest.Mock).mockResolvedValue(null);

    const roomId = '669a8c3c628d2f27c77eb14a';

    // Act
    const response = await request(app).get(`/api/v1/rooms/messages/${roomId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('roomMessages');
    expect(response.body.roomMessages).toEqual([]);
    expect(RoomMember.findOne).toHaveBeenCalledWith({
      roomId,
      userId: 'userId123'
    });
    expect(RoomMessage.find).not.toHaveBeenCalled();
  });
});
