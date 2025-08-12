// Import Express to create a router
import express from 'express';
// Import controller functions for handling invoice-related logic
import {
getAllInvoices,
getInvoiceById,
createInvoice,
updateInvoice,
deleteInvoice
} from '../controllers/invoiceController.js';

// Create a new router instance
const router = express.Router();

// --- Define Routes for the /api/invoices endpoint ---

// Route to get all invoices and create a new invoice
router.route('/')
.get(getAllInvoices)
.post(createInvoice);

// Route to get, update, and delete a single invoice by its ID
router.route('/:id')
.get(getInvoiceById)
.put(updateInvoice)
.delete(deleteInvoice);



// Import necessary modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import route modules
import clientRoutes from './routes/clientRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js'; // <-- AÑADE ESTA LÍNEA

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// --- Middleware Setup ---
const corsOptions = {
origin: process.env.CORS_ORIGIN,
};
app.use(cors(corsOptions));
app.use(express.json());

// --- API Routes ---
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes); // <-- AÑADE ESTA LÍNEA

// --- Server Initialization ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(` Server is running on port ${PORT}`);
});