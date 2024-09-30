const dbClient = require('../utils/db');

describe('DB Client', () => {
  beforeAll(async () => {
    await dbClient.connect();
  });

  test('should connect to the database', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  test('should return the number of users', async () => {
    const count = await dbClient.nbUsers();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

