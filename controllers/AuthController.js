import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization') || '';
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();

    await redisClient.set(`auth_${token}`, user._id.toString(), 86400); // 24 hours = 86400 seconds

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    
    return res.status(204).send();
  }
}

export default AuthController;

