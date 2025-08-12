// Import the database connection pool
import { pool } from '../config/db.js';

/**

Get all invoices, joining with client data for context.

@route GET /api/invoices
*/
export const getAllInvoices = async (req, res) => {
try {
// SQL query to select all invoices and include the client's name
const query = `SELECT  i.*,  c.name as client_name  FROM invoices i JOIN clients c ON i.client_id = c.id ORDER BY i.issue_date DESC`;
const [invoices] = await pool.query(query);

 // Send a successful response with the invoice data
 res.json({
     success: true,
     data: invoices
 });
} catch (error) {
// Log the error and send a server error response
console.error('Error retrieving invoices:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Get a single invoice by its ID.

@route GET /api/invoices/:id
*/
export const getInvoiceById = async (req, res) => {
try {
const { id } = req.params;
// Query to find a single invoice by its ID, also fetching client name
const query = `SELECT  i.*,  c.name as client_name  FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.id = ?`;
const [invoices] = await pool.query(query, [id]);

 // If invoice is not found, return a 404 error
 if (invoices.length === 0) {
     return res.status(404).json({ success: false, message: 'Invoice not found' });
 }

 // Send the found invoice data
 res.json({ success: true, data: invoices[0] });
} catch (error) {
console.error('Error retrieving invoice:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Create a new invoice.

@route POST /api/invoices
*/
export const createInvoice = async (req, res) => {
try {
const { client_id, invoice_number, total_amount, due_date, issue_date, description } = req.body;

 // --- Basic Validation ---
 if (!client_id || !invoice_number || !total_amount || !due_date || !issue_date) {
     return res.status(400).json({ success: false, message: 'Client ID, invoice number, total amount, due date, and issue date are required.' });
 }

 // --- Database Insertion ---
 const [result] = await pool.query(
     "INSERT INTO invoices (client_id, invoice_number, total_amount, due_date, issue_date, description) VALUES (?, ?, ?, ?, ?, ?)",
     [client_id, invoice_number, total_amount, due_date, issue_date, description]
 );

 // Send a success response with the ID of the newly created invoice
 res.status(201).json({
     success: true,
     message: 'Invoice created successfully',
     data: { id: result.insertId, ...req.body }
 });
} catch (error) {
// Handle potential duplicate entry for the unique invoice_number
if (error.code === 'ER_DUP_ENTRY') {
return res.status(409).json({ success: false, message: 'An invoice with this number already exists.' });
}
console.error('Error creating invoice:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Update an existing invoice.

Note: paid_amount and status are typically updated by triggers when transactions are made, not directly here.

@route PUT /api/invoices/:id
*/
export const updateInvoice = async (req, res) => {
try {
const { id } = req.params;
const { total_amount, due_date, issue_date, description, status } = req.body; // Allow status override if needed

 // --- Database Update ---
 const [result] = await pool.query(
     "UPDATE invoices SET total_amount = ?, due_date = ?, issue_date = ?, description = ?, status = ? WHERE id = ?",
     [total_amount, due_date, issue_date, description, status, id]
 );

 // If no rows were affected, the invoice was not found
 if (result.affectedRows === 0) {
     return res.status(404).json({ success: false, message: 'Invoice not found' });
 }

 // Send a success response
 res.json({ success: true, message: 'Invoice updated successfully' });
} catch (error) {
console.error('Error updating invoice:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Delete an invoice.

@route DELETE /api/invoices/:id
*/
export const deleteInvoice = async (req, res) => {
try {
const { id } = req.params;
// --- Database Deletion ---
const [result] = await pool.query("DELETE FROM invoices WHERE id = ?", [id]);

 // If no rows were affected, the invoice was not found
 if (result.affectedRows === 0) {
     return res.status(404).json({ success: false, message: 'Invoice not found' });
 }
 
 // Send a success response
 res.json({ success: true, message: 'Invoice deleted successfully' });
} catch (error) {
console.error('Error deleting invoice:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};