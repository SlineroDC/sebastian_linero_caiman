// backend/scripts/load-data.js

import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import mysql from 'mysql2/promise';

// Get the current directory path, compatible with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**

A generic function to load data from a specified CSV file into a database table.

It assumes CSV headers match the database table columns.

@param {object} connection - The database connection object.

@param {string} filePath - The full path to the CSV file.

@param {string} tableName - The name of the database table to insert data into.
*/
const loadCsvToTable = (connection, filePath, tableName) => {
return new Promise((resolve, reject) => {
const dataToInsert = [];
fs.createReadStream(filePath)
.pipe(csv())
.on('data', (row) => {
dataToInsert.push(row);
})
.on('end', async () => {
if (dataToInsert.length === 0) {
console.log(`No data found in ${path.basename(filePath)}`, skipping);
return resolve();
}

 try {
   // Get columns from the first row of data (which are the correct headers)
   const columns = Object.keys(dataToInsert[0]).join(', ');
   // Get an array of arrays of values
   const values = dataToInsert.map(obj => Object.values(obj));
   
   const sql = `INSERT INTO ${tableName} (${columns}) VALUES ?`;
   
   // Execute the bulk insert query
   await connection.query(sql, [values]);
   console.log(`✅ Data from ${path.basename(filePath)} successfully loaded into '${tableName}'.`);
   resolve();
 } catch (error) {
   reject(error);
 }
})
.on('error', (error) => {
reject(error);
});
});
};

/**

Main function to orchestrate the loading of all CSV files in the correct order.
*/
const loadAllData = async () => {
const connection = await pool.getConnection();
try {
console.log('🚀 Starting data loading process...');
// Start a transaction to ensure all or no data is inserted
await connection.beginTransaction();

// Define the correct order of file loading
const filesToLoad = [
  { tableName: 'payment_platforms', fileName: 'platforms.csv' },
  { tableName: 'clients', fileName: 'clients.csv' },
  { tableName: 'invoices', fileName: 'invoices.csv' },
  { tableName: 'transactions', fileName: 'transactions.csv' },
];

// Sequentially load each file
for (const file of filesToLoad) {
  const filePath = path.join(__dirname, 'data', file.fileName);
  if (fs.existsSync(filePath)) {
    console.log(`🔄 Loading ${file.fileName} into ${file.tableName}...`);
    await loadCsvToTable(connection, filePath, file.tableName);
  } else {
    // Throw an error if a file is missing to prevent partial loads
    throw new Error(`File not found: ${file.fileName}. Please make sure it exists in the 'scripts/data/' folder.`);
  }
}

// If all files are loaded successfully, commit the transaction
await connection.commit();
console.log('🎉 All data has been successfully loaded into the database!');
} catch (error) {
// If any error occurs, roll back the entire transaction
await connection.rollback();
console.error('❌ An error occurred during the data loading process. All changes have been rolled back.', error);
} finally {
// Always release the connection back to the pool and end it
connection.release();
pool.end();
}
};

// Execute the main function
loadAllData();

