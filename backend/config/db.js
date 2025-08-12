// Import the mysql2 library with promise support
import { createPool } from 'mysql2/promise';
// Import dotenv to load environment variables
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Create a connection pool for better performance and resource management.
// The pool manages multiple connections, reusing them to avoid the overhead of creating a new connection for every query.
export const pool = createPool({
host: process.env.DB_HOST || 'localhost',
port: process.env.DB_PORT || 3306,
user: process.env.DB_USER || 'root',
password: process.env.DB_PASSWORD,
database: process.env.DB_DATABASE,
waitForConnections: true, // Wait for a connection to be available if all are in use
connectionLimit: 10, // Maximum number of connections in the pool
queueLimit: 0 // No limit on the number of queued connection requests
});

// Function to test the database connection on startup.
const testConnection = async () => {
try {
const connection = await pool.getConnection();
console.log('Database connected successfully!');
console.log(` Connected to database: ${process.env.DB_DATABASE}`);
connection.release(); // Release the connection back to the pool
} catch (error) {
console.error('❌ Database connection failed:', error.message);
process.exit(1); // Exit the process if the database connection fails
}
};

// Initialize the connection test when the module is loaded.
testConnection();

// Optional: Graceful shutdown to close the pool when the app is terminated.
process.on('SIGINT', async () => {
console.log('\n🛑 Shutting down gracefully...');
await pool.end();
console.log('💤 Database pool closed.');
process.exit(0);
});