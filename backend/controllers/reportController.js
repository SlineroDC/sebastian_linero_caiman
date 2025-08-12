// Import the database connection pool
import { pool } from '../config/db.js';

/**

Report 1: Get the total amount paid by each client.

Uses the pre-built view for simplicity and performance.

@route GET /api/reports/total-paid-by-client
*/
export const getTotalPaidByClient = async (req, res) => {
try {
// Query the view that summarizes client invoice data
const [reportData] = await pool.query("SELECT * FROM view_client_invoice_summary ORDER BY total_paid DESC");

 res.json({
     success: true,
     message: 'Total paid by client report generated successfully',
     data: reportData
 });
} catch (error) {
console.error('Error generating total paid by client report:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Report 2: Get all pending or partially paid invoices.

Includes client information for easy follow-up.

@route GET /api/reports/pending-invoices
*/
export const getPendingInvoices = async (req, res) => {
try {
// Query to get invoices that are not fully paid, joining with clients table
const query = `SELECT  i.id as invoice_id, i.invoice_number, i.total_amount, i.paid_amount, (i.total_amount - i.paid_amount) as pending_amount, i.status, i.due_date, c.name as client_name, c.email as client_email FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.status IN ('pending', 'partially_paid', 'overdue') ORDER BY i.due_date ASC;`
const [reportData] = await pool.query(query);

 res.json({
     success: true,
     message: 'Pending invoices report generated successfully',
     data: reportData
 });
} catch (error) {
console.error('Error generating pending invoices report:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};

/**

Report 3: Get all transactions filtered by a specific payment platform.

Uses the pre-built view for simplicity and performance.

@route GET /api/reports/transactions-by-platform
*/
export const getTransactionsByPlatform = async (req, res) => {
try {
// Get the platform name from the query string (e.g., /?platform=Nequi)
const { platform } = req.query;

 // Basic validation
 if (!platform) {
     return res.status(400).json({ success: false, message: 'Platform query parameter is required.' });
 }

 // Query the detailed transaction view, filtering by platform name
 const query = "SELECT * FROM view_transaction_details WHERE platform_name = ? ORDER BY transaction_date DESC";
 const [reportData] = await pool.query(query, [platform]);

 res.json({
     success: true,
     message: `Transactions for platform '${platform}' report generated successfully`,
     data: reportData
 });
} catch (error) {
console.error('Error generating transactions by platform report:', error);
res.status(500).json({ success: false, message: 'Server Error' });
}
};