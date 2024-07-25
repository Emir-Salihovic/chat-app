import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/userModel';

// Mock User model
jest.mock('../src/models/userModel');

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Close the database connection after all tests
  await mongoose.connection.close();
});

/**
 * Who Am I
 */
describe('Auth Controller - Who Am I', () => {
  it('should return user profile data if the user is found', async () => {
    // Arrange
    const mockUser = {
      _id: 'userId123',
      username: 'testuser',
      avatar: 'avatar'
    };

    // Mock User.findById to return the mockUser
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const response = await request(app).get('/api/v1/users/me');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'success');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith('userId123');
  });

  it('should return a 400 error if the user is not found', async () => {
    // Arrange
    // Mock User.findById to return null to simulate a user not being found
    (User.findById as jest.Mock).mockResolvedValue(null);

    // Act
    const response = await request(app).get('/api/v1/users/me'); // Example endpoint

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('statusCode', 404);
    expect(response.body.error).toHaveProperty('status', 'failed');
    expect(response.body.message).toBe(
      'There was a problem fetching your profile data.'
    );
    expect(User.findById).toHaveBeenCalledWith('userId123');
  });
});
