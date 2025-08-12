## Description
A full-stack web application designed to help ExpertSoft's clients organize, manage, and analyze financial information from various Fintech platforms. The system provides a robust backend API, a relational database, and a user-friendly frontend dashboard to perform CRUD operations and generate key financial reports.
Developer Data

## Information coder
- Name: Sebastian Linero De Castro
- Clan: Caiman
- Email: sebastastianlinero15@gmail.com
- Relational Model (ERD)

The database was designed following normalization principles to ensure data integrity and eliminate redundancy. The final structure is represented in the following Entity-Relationship Diagram:
Normalization Explanation
The initial data, provided in a denormalized format similar to an Excel spreadsheet, contained redundant information. The normalization process up to the Third Normal Form (3NF) was applied to structure the data efficiently.
First Normal Form (1NF): Each table cell contains a single value, and each record is unique. This was achieved by structuring the data into rows and columns.
Second Normal Form (2NF): All non-key attributes are fully functional on the primary key. To achieve this, the original flat data was split into separate entities:
clients: To avoid repeating client information (name, email) for every transaction or invoice.
invoices: To store invoice-specific data, linking to a client via client_id.
Third Normal Form (3NF): There are no transitive dependencies (non-key attributes that depend on other non-key attributes). This was ensured by creating:
payment_platforms: This table was created to store platform names (Nequi, Daviplata, etc.) and their descriptions independently, preventing platform details from being transitively dependent on invoices or transactions.
transactions: This table links an invoice with a payment_platform, ensuring that transaction details depend only on the transaction itself.
This normalized structure improves data integrity, reduces storage space, and simplifies data management.

## Technologies Used
### Backend
- Node.js with Express: For building the REST API.
- mysql2: To connect and interact with the MySQL database.
- dotenv: To manage environment variables.
- cors: To enable Cross-Origin Resource Sharing.
- csv-parser: For reading and parsing the CSV file during the bulk load process.
- multer: For handling file uploads.

### Frontend
- HTML : For a fast and modern development environment.
- Tailwind CSS: For utility-first styling.
- Fetch API: For communication with the backend API.
- Database
- MySQL 8.0+: As the relational database management system.

### Tools
- Postman: For API testing and development.
- Git & GitHub: For version control.

## Setup and Execution Instructions
Follow these steps to set up and run the project locally.
Prerequisites
Node.js (v18 or higher)
MySQL Server (v8.0 or higher)
Git
Clone the Repository
git clone [Your Repository URL]
cd pd_sebastian_linero_caiman

Backend Setup

Navigate to the backend folder
cd backend

`` Install dependencies
npm install

Create a .env file in the /backend directory and fill it with your database credentials. You can use the .env.example as a template:

.env
Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=pd_sebastian_linero_caiman

Server Configuration
PORT=3000

Database Setup
Connect to your MySQL server.

Create the database required for the project:
CREATE DATABASE pd_nombre_apellido_clan;

Use the created database and execute the entire database.sql script to create all tables, triggers, and views.

Running the Application
Start the Backend Server:
From the /backend folder
npm start

The API will be running at http://localhost:3000.

Start the Frontend Application:
Open a new terminal and navigate to the frontend folder
cd frontend

Install dependencies
npm install

Run the development server
npm run dev

The frontend will be accessible at http://localhost:5173 (or the port indicated by Vite).
CSV Bulk Load Instructions
To populate the database with the initial data from the provided CSV file, run the following command from the project's root directory after you have successfully set up the database.
node backend/scripts/load-data.js

This script will read the datos.csv file, process the data, and insert it into the corresponding tables (clients, invoices, transactions, payment_platforms).
Advanced Queries & API Endpoints
The API provides several endpoints for managing resources and generating reports. The main endpoints are detailed in the included Postman collection.
Client Management (CRUD)

GET /api/clients: Retrieves a paginated list of all clients.
GET /api/clients/:id: Retrieves a single client by their ID.
POST /api/clients: Creates a new client.
PUT /api/clients/:id: Updates an existing client.
DELETE /api/clients/:id: Deletes a client.
Financial Reports (Advanced Queries)
These endpoints address key business questions:
GET /api/reports/total-paid-by-client

### Requirement: "As a system administrator, I need to know how much each client has paid in total, to keep track of income and verify overall balances."
Description: This endpoint returns a summary for each client, detailing the total amount invoiced, the total amount paid, and the pending balance.
GET /api/reports/pending-invoices
Requirement: "As a financial manager, I need to identify invoices that have not yet been fully paid, along with the client's name and any associated transactions, to manage collections or follow-ups."
Description: This endpoint lists all invoices with a status of 'pending' or 'partially_paid', including details about the client and a summary of payments made.
GET /api/reports/transactions-by-platform
Requirement: "As an analyst, I need to be able to see all transactions made from a specific platform (like Nequi or Daviplata), including which client they belong to and which invoice they are paying."
Description: This endpoint allows filtering transactions by a specific payment platform, providing a detailed view of fund movements for reconciliation purposes.