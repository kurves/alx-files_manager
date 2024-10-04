import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.db.collection('users').countDocuments();
      const filesCount = await dbClient.db.collection('files').countDocuments();
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Unable to fetch stats' });
    }
  }
}

export default AppController;
