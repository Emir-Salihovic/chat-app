import request from 'supertest';
import app from '../src/app';

describe('Test Express routes', () => {
  it('should return 200 OK from /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
