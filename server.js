import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index';

dotenv.config();

const app = express();

app.use('/', routes);

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
