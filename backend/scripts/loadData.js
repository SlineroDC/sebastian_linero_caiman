import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

// --- Script Setup ---

// Get the current directory path, compatible with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the CSV file
const CSV_FILE_PATH = path.join(__dirname, 'datos.csv');

// Use Maps to store unique entities and avoid duplicates. This helps manage relationships.
const clients = new Map();
const platforms = new Map();
const invoices = new Map(); // Use Map to handle unique invoices easily
const transactions = [];

/**

Main function to read, process, and load data from the CSV file.
*/
const loadCSVData = async () => {

if (!fs.existsSync(CSV_FILE_PATH)) {
console.error(`csv file not found at: ${CSV_FILE_PATH}`);
return };
}

// --- 1. Read and Process CSV File ---
console.log(` Starting data loading process from ${CSV_FILE_PATH}...`);

const stream = fs.createReadStream(CSV_FILE_PATH).pipe(csv());

for await (const row of stream) {
// For each row, extract and store unique clients, platforms, and invoices
const clientEmail = row.client_email?.trim().toLowerCase();
if (clientEmail && !clients.has(clientEmail)) {
clients.set(clientEmail, {
name: row.client_name?.trim(),
email: clientEmail,
phone: row.client_phone?.trim()
});
}

 const platformName = row.platform_name?.trim();
 if (platformName && !platforms.has(platformName)) {
     platforms.set(platformName, { name: platformName });
 }

 const invoiceNumber = row.invoice_number?.trim();
 if (invoiceNumber && !invoices.has(invoiceNumber)) {
     invoices.set(invoiceNumber, {
         client_email: clientEmail,
         invoice_number: invoiceNumber,
         total_amount: parseFloat(row.invoice_total) || 0,
         due_date: row.due_date || new Date().toISOString().split('T')[0],
         issue_date: row.issue_date || new Date().toISOString().split('T')[0]
     });
 }
 
 // Add transaction data to the list
 transactions.push({
     invoice_number: invoiceNumber,
     platform_name: platformName,
     amount: parseFloat(row.transaction_amount) || 0,
     transaction_date: row.transaction_date || new Date().toISOString(),
     transaction_reference: row.transaction_reference || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
 });
}

console.log(` CSV file processed. Found:`);
console.log(`  - ${clients.size} unique clients`);
console.log(`  - ${platforms.size} unique platforms`);
console.log(`  - ${invoices.size} unique invoices`);
console.log(`- ${transactions.length} transactions`);

// --- 2. Insert Data into Database ---

// Get a connection from the pool
const connection = await pool.getConnection();
try {
// Start a transaction to ensure all or no data is inserted
await connection.beginTransaction();
console.log(' Starting database insertion...');

 // Insert clients and get their IDs
 console.log('  - Inserting clients...');
 const clientIds = new Map();
 for (const [email, client] of clients) {
     const [result] = await connection.query(
         'INSERT INTO clients (name, email, phone_number) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
         [client.name, client.email, client.phone]
     );
     // After insert/update, get the actual ID
     const [[{id}]] = await connection.query('SELECT id FROM clients WHERE email = ?', [email]);
     clientIds.set(email, id);
 }

 // Insert platforms and get their IDs
 console.log('  - Inserting payment platforms...');
 const platformIds = new Map();
 for (const [name, platform] of platforms) {
      await connection.query('INSERT INTO payment_platforms (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name', [name]);
      const [[{id}]] = await connection.query('SELECT id FROM payment_platforms WHERE name = ?', [name]);
      platformIds.set(name, id);
 }

 // Insert invoices and get their IDs
 console.log('  - Inserting invoices...');
 const invoiceIds = new Map();
 for (const [number, invoice] of invoices) {
     const clientId = clientIds.get(invoice.client_email);
     if (clientId) {
         await connection.query(
             'INSERT INTO invoices (client_id, invoice_number, total_amount, due_date, issue_date) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_amount=total_amount',
             [clientId, number, invoice.total_amount, invoice.due_date, invoice.issue_date]
         );
         const [[{id}]] = await connection.query('SELECT id FROM invoices WHERE invoice_number = ?', [number]);
         invoiceIds.set(number, id);
     }
 }
 
 // Insert transactions
 console.log('  - Inserting transactions...');
 for (const transaction of transactions) {
     const invoiceId = invoiceIds.get(transaction.invoice_number);
     const platformId = platformIds.get(transaction.platform_name);
     if (invoiceId && platformId && transaction.amount > 0) {
         await connection.query(
             'INSERT INTO transactions (invoice_id, platform_id, transaction_reference, amount, transaction_date) VALUES (?, ?, ?, ?, ?)',
             [invoiceId, platformId, transaction.transaction_reference, transaction.amount, transaction.transaction_date]
         );
     }
 }

 // If all queries were successful, commit the transaction
 await connection.commit();
 console.log('✅ Data loaded successfully into the database!');
} catch (error) {
// If any error occurred, roll back the transaction
await connection.rollback();
console.error('❌ Error during database insertion. Rolling back changes.', error);
} finally {
// Always release the connection back to the pool
connection.release();
// Close the pool to allow the script to exit
await pool.end();
}
;

// Execute the main function
loadCSVData();


