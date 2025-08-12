// Import the database connection pool
import { pool } from '../config/db.js';

/**

Get all clients with pagination.

@route GET /api/clients
*/
export const getAllClients = async (req, res) => {
try {
// Query to get all active clients
const [clients] = await pool.query("SELECT * FROM clients WHERE is_active = TRUE ORDER BY name ASC");

 // Send a successful response with the client data
 res.json({
     success: true,
     data: clients
 });
} catch (error) {
// Log the error and send a server error response
console.error('Error retrieving clients:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Get a single client by their ID.

@route GET /api/clients/:id
*/
export const getClientById = async (req, res) => {
try {
const { id } = req.params;
// Query to find a single client by ID
const [clients] = await pool.query("SELECT * FROM clients WHERE id = ?", [id]);

 // If client is not found, return a 404 error
 if (clients.length === 0) {
     return res.status(404).json({ success: false, message: 'Client not found' });
 }

 // Send the found client data
 res.json({ success: true, data: clients[0] });
} catch (error) {
console.error('Error retrieving client:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Create a new client.

@route POST /api/clients
*/
export const createClient = async (req, res) => {
try {
const { name, email, phone_number, address } = req.body;

 // --- Basic Validation ---
 if (!name || !email) {
     return res.status(400).json({ success: false, message: 'Name and email are required.' });
 }

 // --- Database Insertion ---
 const [result] = await pool.query(
     "INSERT INTO clients (name, email, phone_number, address) VALUES (?, ?, ?, ?)",
     [name, email, phone_number, address]
 );

 // Send a success response with the ID of the newly created client
 res.status(201).json({
     success: true,
     message: 'Client created successfully',
     data: { id: result.insertId, ...req.body }
 });
} catch (error) {
// Handle potential duplicate entry errors for email or phone
if (error.code === 'ER_DUP_ENTRY') {
return res.status(409).json({ success: false, message: 'A client with this email or phone number already exists.' });
}
console.error('Error creating client:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Update an existing client.

@route PUT /api/clients/:id
*/
export const updateClient = async (req, res) => {
try {
const { id } = req.params;
const { name, email, phone_number, address } = req.body;

 // Basic validation
 if (!name || !email) {
     return res.status(400).json({ success: false, message: 'Name and email are required.' });
 }
 
 // --- Database Update ---
 const [result] = await pool.query(
     "UPDATE clients SET name = ?, email = ?, phone_number = ?, address = ? WHERE id = ?",
     [name, email, phone_number, address, id]
 );

 // If no rows were affected, the client was not found
 if (result.affectedRows === 0) {
     return res.status(404).json({ success: false, message: 'Client not found' });
 }

 // Send a success response
 res.json({ success: true, message: 'Client updated successfully' });
} catch (error) {
// Handle potential duplicate entry errors
if (error.code === 'ER_DUP_ENTRY') {
return res.status(409).json({ success: false, message: 'A client with this email or phone number already exists.' });
}
console.error('Error updating client:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Delete a client.

This can be a soft or hard delete depending on business logic. Here we perform a hard delete.

The DDL uses ON DELETE CASCADE, so deleting a client will also delete their invoices and transactions.

@route DELETE /api/clients/:id
*/
export const deleteClient = async (req, res) => {
try {
const { id } = req.params;
// --- Database Deletion ---
const [result] = await pool.query("DELETE FROM clients WHERE id = ?", [id]);

 // If no rows were affected, the client was not found
 if (result.affectedRows === 0) {
     return res.status(404).json({ success: false, message: 'Client not found' });
 }
 
 // Send a success response
 res.json({ success: true, message: 'Client deleted successfully' });
} catch (error) {
console.error('Error deleting client:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};