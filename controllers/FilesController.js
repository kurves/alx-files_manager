const redisClient = require('../utils/redis');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const fs = require('fs');
const mime = require('mime-types'); // To handle file mime-types
const { ObjectId } = require('mongodb');
const path = require('path');

// Get folder path from env or default to /tmp/files_manager
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function getAuthenticatedUser(req) {
    const token = req.headers['x-token'];
    if (!token) return null;

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return null;

    const user = await dbClient.db.collection('users').findOne({ _id: dbClient.objectId(userId) });
    return user;
}

class FilesController {
  // Method to handle file upload
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== 0 ? ObjectId(parentId) : 0,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    } else {
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      const localPath = `${FOLDER_PATH}/${uuidv4()}`;
      const decodedData = Buffer.from(data, 'base64');

      fs.writeFileSync(localPath, decodedData);

      fileData.localPath = localPath;

      const result = await dbClient.db.collection('files').insertOne(fileData);

      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }
    if (fileDocument.type === 'image') {
        await fileQueue.add({
            userId: user._id,
            fileId: fileDocument._id
        });
    }

    return res.status(201).json(fileDocument);
    }
    static async getShow(req, res) {
    try {
      const token = req.headers['x-token']; // Extract token from headers
      const user = await dbClient.getUserFromToken(token); // Get user based on token
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' }); // 401 if user is not found
      }

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId), // Match file ID
        userId: ObjectId(user._id) // Match user ID
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' }); // 404 if file doesn't exist
      }

      return res.status(200).json(file); // Return the file document
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token']; // Extract token from headers
      const user = await dbClient.getUserFromToken(token); // Get user based on token

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' }); // 401 if user is not found
      }

      const parentId = req.query.parentId || '0'; // Default to root folder (parentId = 0)
      const page = parseInt(req.query.page, 10) || 0; // Default to the first page
      const pageSize = 20;
      const skip = page * pageSize;

      const files = await dbClient.db.collection('files').aggregate([
        { $match: { parentId, userId: ObjectId(user._id) } },
        { $skip: skip },
        { $limit: pageSize }
      ]).toArray();

      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  static async putPublish(req, res) {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({
            _id: dbClient.objectId(fileId),
            userId: user._id
        });

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        await dbClient.db.collection('files').updateOne(
            { _id: dbClient.objectId(fileId) },
            { $set: { isPublic: true } }
        );

        const updatedFile = await dbClient.db.collection('files').findOne({ _id: dbClient.objectId(fileId) });
        return res.status(200).json(updatedFile);
    }

    static async putUnpublish(req, res) {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({
            _id: dbClient.objectId(fileId),
            userId: user._id
        });

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        await dbClient.db.collection('files').updateOne(
            { _id: dbClient.objectId(fileId) },
            { $set: { isPublic: false } }
        );

        const updatedFile = await dbClient.db.collection('files').findOne({ _id: dbClient.objectId(fileId) });
        return res.status(200).json(updatedFile);
    }
    static async getFile(req, res) {
        const fileId = req.params.id;
        const user = await getAuthenticatedUser(req);

        const file = await dbClient.db.collection('files').findOne({ _id: dbClient.objectId(fileId) });
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (file.type === 'folder') {
            return res.status(400).json({ error: "A folder doesn't have content" });
        }

        if (!file.isPublic) {
            if (!user || file.userId.toString() !== user._id.toString()) {
                return res.status(404).json({ error: 'Not found' });
            }
        }

        const filePath = path.join(__dirname, '..', 'uploads', file.name); // Assume files are stored in an 'uploads' folder
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Not found' });
        }

        const mimeType = mime.lookup(file.name);
        if (!mimeType) {
            return res.status(400).json({ error: 'Invalid file type' });
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Could not read file' });
            }

            res.setHeader('Content-Type', mimeType);
            return res.status(200).send(data);
        });
    }

}

module.exports = FilesController;

