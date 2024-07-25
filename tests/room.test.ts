import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import Room from '../src/models/roomModel';

// Mock the room model
jest.mock('../src/models/roomModel');

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
