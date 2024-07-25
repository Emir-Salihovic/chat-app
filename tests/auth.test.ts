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
  beforeEach(() => {
    // Reset mock implementation before each test
    (createSendToken as jest.Mock).mockImplementation(
      (user, statusCode, req, res) => {
        res.status(statusCode).json({ token: 'fake-token', data: { user } });
      }
    );
  });

  it('should register a new user and send a token', async () => {
    // Arrange
    const mockUser = {
      _id: '123456789',
      username: 'testuser',
      password: 'hashedpassword'
    };

    // Mock User.create to return the mockUser
    (User.create as jest.Mock).mockResolvedValue(mockUser);

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
  });
});

describe('Auth Controller - Login', () => {
  it('should log in a user and return a token', async () => {
    // Arrange
    const mockUser = {
      _id: '123456789',
      username: 'testuser',
      password: 'hashedpassword',
      correctPassword: jest.fn().mockResolvedValue(true)
    };

    // Mock UserModel.find to return an object with the select method
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    // Mock createSendToken to return a fake token
    (createSendToken as jest.Mock).mockImplementation(
      (user, statusCode, req, res) => {
        res.status(statusCode).json({ token: 'fake-token', data: { user } });
      }
    );

    // Act
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'testuser', password: 'password' });

    // Assert
    expect(response.status).toBe(200); // Expect 200 status
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('data');
    expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    expect(mockUser.correctPassword).toHaveBeenCalledWith(
      'password',
      'hashedpassword'
    );
  });

  it('should return 400 if username or password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'testuser' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Please provide username and password.');
  });

  it('should return 400 if username is incorrect', async () => {
    // Mock RoomMember.find to return an object with the select method
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'wronguser', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Incorrect username or password!');
  });

  it('should return 400 if password is incorrect', async () => {
    const mockUser = {
      _id: '123456789',
      username: 'testuser',
      password: 'hashedpassword',
      correctPassword: jest.fn().mockResolvedValue(false) // Incorrect password
    };

    // Mock RoomMember.find to return an object with the select method
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Incorrect username or password!');
  });
});

describe('Auth Controller - Logout', () => {
  it('should clear the JWT cookie and return a success message', async () => {
    // Act
    const response = await request(app)
      .post('/api/v1/users/logout') // Example endpoint
      .send();

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');

    // Assert that the cookie is set correctly
    expect(response.header['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('jwt=loggedout')])
    );
  });
});
