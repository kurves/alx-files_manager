import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    }).catch((err) => {
      console.error(`Failed to connect to MongoDB: ${err}`);
    });
  }
  isAlive() {
  return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error(`Error getting number of users: ${err}`);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error(`Error getting number of files: ${err}`);
      return 0;
    }
  }
  async getUserById(userId) {
    // Retrieve the user from the database using the userId
    const user = await this.usersCollection.findOne({ _id: ObjectId(userId) });
    return user;
  }

  async findUserByEmail(email) {
    const user = await this.usersCollection.findOne({ email });
    return user;
  }

  async createUser(email, password) {
    const result = await this.usersCollection.insertOne({ email, password });
    return result.insertedId;
  }
}

const dbClient = new DBClient();
export default dbClient;
