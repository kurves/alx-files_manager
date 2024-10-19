import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Initially set the database reference to null
    this.db = null;

    this.connectToDatabase(database);
  }

  async connectToDatabase(database) {
    try {
      await this.client.connect();
      this.db = this.client.db(database);
      console.log("MongoDB connected successfully");
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}`);
    }
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      if (!this.db) return 0; // Ensure db is connected before querying
      const usersCollection = this.db.collection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error(`Error fetching number of users: ${err.message}`);
      return 0; // Return 0 if there's an error
    }
  }

  async nbFiles() {
    try {
      if (!this.db) return 0; // Ensure db is connected before querying
      const filesCollection = this.db.collection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error(`Error fetching number of files: ${err.message}`);
      return 0; // Return 0 if there's an error
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
