// Mock jwt.sign
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn(() => 'fake-token') // Mock the sign function to return a fake token
}));

jest.mock('../src/utils/signToken', () => {
  const actualModule = jest.requireActual('../src/utils/signToken');
  return {
    ...actualModule,
    createSendToken: jest.fn((user, statusCode, req, res) => {
      res.status(statusCode).json({ token: 'fake-token', data: { user } });
    })
  };
});

// Mock the protect middleware
jest.mock('../src/controllers/authController', () => {
  const actualModule = jest.requireActual('../src/controllers/authController');
  return {
    ...actualModule,
    protect: jest.fn((req, res, next) => {
      req.user = { _id: 'userId123', username: 'mockUser' };
      next();
    })
  };
});

// Mock the error handler
jest.mock('../src/controllers/errorController', () => {
  return jest.fn((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      error: {
        statusCode: err.statusCode || 500,
        status: err.status || 'error',
        isOperational: err.isOperational || false
      },
      message: err.message || 'Internal Server Error'
    });
  });
});
