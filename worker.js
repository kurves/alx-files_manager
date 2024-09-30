const Bull = require('bull');
const dbClient = require('./utils/db');
const fs = require('fs');
const path = require('path');
const imageThumbnail = require('image-thumbnail');
const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job, done) => {
    const { fileId, userId } = job.data;

    if (!fileId) return done(new Error('Missing fileId'));
    if (!userId) return done(new Error('Missing userId'));

    const file = await dbClient.db.collection('files').findOne({
        _id: dbClient.objectId(fileId),
        userId: dbClient.objectId(userId)
    });

    if (!file) return done(new Error('File not found'));

    const filePath = path.join(__dirname, 'uploads', file.name); // Adjust the path as per your file storage
    if (!fs.existsSync(filePath)) return done(new Error('File not found locally'));

    const sizes = [500, 250, 100];
    for (const size of sizes) {
        try {
            const options = { width: size };
            const thumbnail = await imageThumbnail(filePath, options);
            const thumbnailPath = `${filePath}_${size}`;
            fs.writeFileSync(thumbnailPath, thumbnail);
        } catch (error) {
            return done(new Error(`Error generating ${size}px thumbnail: ${error.message}`));
        }
    }

    done();
});
userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);


  done();
});
module.exports = { userQueue };
