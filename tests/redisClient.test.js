const redisClient = require('../utils/redis');

describe('Redis Client', () => {
  beforeAll(async () => {
    await redisClient.connect();
  });

  test('should connect to Redis', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  test('should set and get a value from Redis', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  test('should delete a key from Redis', async () => {
    await redisClient.del('testKey');
    const value = await redisClient.get('testKey');
    expect(value).toBe(null);
  });
});

