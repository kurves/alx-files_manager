const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('GET /status should return 200', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  test('GET /stats should return 200', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('userCount');
  });

  test('POST /users should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('GET /connect should return 200 for valid credentials', async () => {
    const res = await request(app)
      .get('/connect')
      .auth('test@example.com', 'password'); // Mock basic auth
    expect(res.statusCode).toBe(200);
  });

  test('GET /disconnect should return 204', async () => {
    const res = await request(app).get('/disconnect');
    expect(res.statusCode).toBe(204);
  });

  test('GET /users/me should return the current user', async () => {
    const res = await request(app).get('/users/me').auth('token', { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  test('POST /files should upload a file', async () => {
    const res = await request(app)
      .post('/files')
      .send({ name: 'testfile', type: 'image', data: 'someData' });
    expect(res.statusCode).toBe(201);
  });

  test('GET /files/:id should return file data', async () => {
    const res = await request(app).get('/files/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'testfile');
  });

  test('GET /files with pagination', async () => {
    const res = await request(app).get('/files?page=1&limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('files');
  });

  test('PUT /files/:id/publish should publish a file', async () => {
    const res = await request(app).put('/files/1/publish');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('published', true);
  });

  test('PUT /files/:id/unpublish should unpublish a file', async () => {
    const res = await request(app).put('/files/1/unpublish');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('published', false);
  });

  test('GET /files/:id/data should return file data', async () => {
    const res = await request(app).get('/files/1/data');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

