// Import Express to create a router
import express from 'express';
// Import controller functions for handling client-related logic
import {
getAllClients,
getClientById,
createClient,
updateClient,
deleteClient
} from '../controllers/clientController.js';

// Create a new router instance
const router = express.Router();

// --- Define Routes for the /api/clients endpoint ---

// Route to get all clients and create a new client
router.route('/')
.get(getAllClients)
.post(createClient);

// Route to get, update, and delete a single client by their ID
router.route('/:id')
.get(getClientById)
.put(updateClient)
.delete(deleteClient);

// Export the router to be used in the main server file (index.js)
export default router;