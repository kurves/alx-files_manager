import express from 'express';
import router from './routes/index'; // Import the router

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Load all routes
app.use(router); // Use the imported router

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
