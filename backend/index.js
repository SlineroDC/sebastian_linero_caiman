import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Export the router to be used in the main server file (index.js)
export default router;

// Import route modules
import clientRoutes from './routes/clientRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// --- Middleware Setup ---

// Configure CORS (Cross-Origin Resource Sharing)
const corsOptions = {
origin: process.env.CORS_ORIGIN,
};
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Routes ---

// Mount the routers on their respective base paths
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);

// --- Server Initialization ---

// Define the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming connections
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});