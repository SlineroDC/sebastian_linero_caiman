// Import Express to create a router
import express from 'express';
// Import controller functions for handling report generation logic
import {
getTotalPaidByClient,
getPendingInvoices,
getTransactionsByPlatform
} from '../controllers/reportController.js';

// Create a new router instance
const router = express.Router();

// --- Define Routes for the /api/reports endpoint ---

// Route for the "Total Paid by Client" report
router.get('/total-paid-by-client', getTotalPaidByClient);

// Route for the "Pending Invoices" report
router.get('/pending-invoices', getPendingInvoices);

// Route for the "Transactions by Platform" report
router.get('/transactions-by-platform', getTransactionsByPlatform);

// Export the router to be used in the main server file (index.js)
export default router;



```
/pd_nombre_apellido_clan
│
├── /backend
│ ├── /config
│ │ └── db.js
│ ├── /controllers
│ │ ├── clientController.js
│ │ ├── invoiceController.js
│ │ └── reportController.js
│ ├── /routes
│ │ ├── clientRoutes.js
│ │ ├── invoiceRoutes.js
│ │ └── reportRoutes.js
│ ├── /scripts
│ │ ├── load-data.js
│ │ └── datos.csv
│ ├── /uploads
│ ├── index.js
│ ├── database.sql
│ ├── package.json
│ └── .env
│
├── /frontend
│ ├── /src
│ │ ├── /components
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ ├── tailwind.config.js
│ └── vite.config.js
│
├── modelo_relacional.png
├── ExpertSoft_Postman_Collection.json
└── README.md
```