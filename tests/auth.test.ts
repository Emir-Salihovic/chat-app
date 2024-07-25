import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/userModel';
import createSendToken from '../src/utils/signToken';

// Mock the user model
jest.mock('../src/models/userModel');

// Mock the createSendToken function
jest.mock('../src/utils/signToken', () => jest.fn());

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
describe('Auth Controller - Signup', () => {
  it('should register a new user and send a token', async () => {
    // Arrange
    const mockUser = {
      _id: '123456789',
      username: 'testuser',
      password: 'hashedpassword'
    };

    // Mock User.create to return the mockUser
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    // Mock createSendToken to return a fake token
    (createSendToken as jest.Mock).mockImplementation(
      (user, statusCode, req, res) => {
        res.status(201).json({ token: 'fake-token', data: { user: mockUser } });
      }
    );

    // Act
    const response = await request(app)
      .post('/api/v1/users/signup')
      .send({ username: 'testuser', password: 'password' });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('data');
    expect(User.create).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password'
    });
  });
});

/**
 * @description If username or password is missing.
 */
describe('Auth Controller - Signup', () => {
  it('should return 400 if username or password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/users/signup')
      .send({ username: 'testuser' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'failed');
    expect(response.body.error).toHaveProperty('statusCode', 400);
    expect(response.body.error).toHaveProperty('status', 'failed');
    expect(response.body).toHaveProperty(
      'message',
      'Please provide username and password.'
    );
  }, 10000);
});
