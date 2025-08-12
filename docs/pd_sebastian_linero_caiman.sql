-- create the db for proyect
create database pd_sebastian_linero_caiman;

-- Use the database
USE pd_sebastian_linero_caiman;

-- TABLE: payment_platforms
-- Description: Save platform the platforms (Nequi, Daviplata, etc.)
-- is an independent entity to comply with 3FN

CREATE TABLE payment_platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Platform name (Nequi, Daviplata, etc.)',
    description VARCHAR(255) DEFAULT NULL COMMENT 'Optional platform description',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active/inactive status of the platform',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ---------------------------------------------------------------------

-- TABLE: clients
-- Description: Stores customer information

CREATE TABLE customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_number varchar(100) NOT NULL UNIQUE COMMENT 'Identification of customer',
    name VARCHAR(255) NOT NULL COMMENT 'Full name of customer',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Customer email',
    phone_number VARCHAR(20) UNIQUE COMMENT 'number phone customer',
    address TEXT DEFAULT NULL COMMENT 'adress of customer ',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active/inactive status of the customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
	-- Indexes to optimize queries
	INDEX idx_customer_id (id_number),
    INDEX idx_customer_email (email),
    INDEX idx_customer_phone (phone_number),
    INDEX idx_customer_name (name)
);
-- ----------------------------------------------------------------

-- TABLE: invoices
-- Description: Stores invoices issued to clients
-- Relates to clients using customer_id

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL COMMENT 'ID del cliente al que pertenece la factura',
    invoice_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de factura único',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Monto total de la factura',
    paid_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Monto pagado hasta ahora',
    status ENUM('pending', 'paid', 'partially_paid', 'overdue', 'cancelled') 
        NOT NULL DEFAULT 'pending' COMMENT 'Estado de la factura',
    due_date DATE NOT NULL COMMENT 'Fecha de vencimiento',
    issue_date DATE NOT NULL COMMENT 'Fecha de emisión',
    description TEXT DEFAULT NULL COMMENT 'Invoice description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (customer_id) REFERENCES customer(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Restrictions
    CONSTRAINT chk_amounts CHECK (total_amount > 0 AND paid_amount >= 0 AND paid_amount <= total_amount),
    
    -- Índices
    INDEX idx_invoice_customer (customer_id),
    INDEX idx_invoice_status (status),
    INDEX idx_invoice_due_date (due_date),
    INDEX idx_invoice_number (invoice_number)
);

-- TABLE: transactions
-- Description: Stores the payment transactions made
-- It is related to invoices, ayment_platforms and client

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL COMMENT 'ID de la factura que se está pagando',
    platform_id INT NOT NULL COMMENT 'ID de la plataforma de pago utilizada',
    transaction_reference VARCHAR(100) NOT NULL UNIQUE COMMENT 'Referencia única de la transacción',
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Monto de la transacción',
    transaction_fee DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Comisión de la transacción',
    net_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount - transaction_fee) STORED 
        COMMENT 'Monto neto después de comisión',
    status ENUM('pending', 'completed', 'failed', 'cancelled') 
        NOT NULL DEFAULT 'completed' COMMENT 'Estado de la transacción',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la transacción',
    notes TEXT DEFAULT NULL COMMENT 'Notas adicionales sobre la transacción',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES payment_platforms(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    --  Restrictions
    CONSTRAINT chk_transaction_amount CHECK (amount > 0),
    CONSTRAINT chk_transaction_fee CHECK (transaction_fee >= 0 AND transaction_fee <= amount),
    
    -- Índices
    INDEX idx_transaction_invoice (invoice_id),
    INDEX idx_transaction_platform (platform_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_status (status),
    INDEX idx_transaction_reference (transaction_reference)
);

-- ---------------------------------------------------------------

--  TRIGGERS to automate updates

-- Trigger to update the amount paid in invoices when a transaction is inserted

DELIMITER //
CREATE TRIGGER trg_update_invoice_paid_amount_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE total_paid DECIMAL(10, 2);
    
    -- Calculate the total paid for the invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM transactions 
    WHERE invoice_id = NEW.invoice_id AND status = 'completed';
    
    -- Update the invoice
    UPDATE invoices 
    SET paid_amount = total_paid,
        status = CASE 
            WHEN total_paid >= total_amount THEN 'paid'
            WHEN total_paid > 0 THEN 'partially_paid'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
END//

-- Trigger to update the amount paid in invoices when a transaction is updated
CREATE TRIGGER trg_update_invoice_paid_amount_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    DECLARE total_paid DECIMAL(10, 2);
    
    -- Calculate the total paid for the invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM transactions 
    WHERE invoice_id = NEW.invoice_id AND status = 'completed';
    
    --  Update the invoice
    UPDATE invoices 
    SET paid_amount = total_paid,
        status = CASE 
            WHEN total_paid >= total_amount THEN 'paid'
            WHEN total_paid > 0 THEN 'partially_paid'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
END//

DELIMITER ;

-- ------------------------------------------------------------
-- SEEDING

-- Insert initial payment platforms

INSERT INTO payment_platforms (name, description) VALUES
('Nequi', 'Plataforma de pagos móviles de Bancolombia'),
('Daviplata', 'Plataforma de pagos móviles de Davivienda'),
('PSE', 'Pagos Seguros en Línea');


-- -------------------------------
-- USEFUL VIEWS

-- View for summary of invoices by client
CREATE VIEW view_client_invoice_summary AS
SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email,
    COUNT(i.id) as total_invoices,
    SUM(i.total_amount) as total_invoiced,
    SUM(i.paid_amount) as total_paid,
    SUM(i.total_amount - i.paid_amount) as total_pending,
    AVG(i.total_amount) as avg_invoice_amount
FROM clients c
LEFT JOIN invoices i ON c.id = i.client_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.email;

-- View for transactions with details
CREATE VIEW view_transaction_details AS
SELECT 
    t.id as transaction_id,
    t.transaction_reference,
    t.amount,
    t.transaction_fee,
    t.net_amount,
    t.status as transaction_status,
    t.transaction_date,
    i.invoice_number,
    i.total_amount as invoice_total,
    i.status as invoice_status,
    c.name as client_name,
    c.email as client_email,
    p.name as platform_name
FROM transactions t
JOIN invoices i ON t.invoice_id = i.id
JOIN clients c ON i.client_id = c.id
JOIN payment_platforms p ON t.platform_id = p.id;

-- final comments

-- This script creates a standardized database up to 3FN with:
-- 1. Clear separation of entities (customers, invoices, transactions, platforms)
-- 2. Appropriate relationships with foreign keys
-- 3. Integrity restrictions
-- 4. Indexes to optimize queries
-- 5. Triggers for Automation
-- 6. Views for common queries
-- 7. Initial data for the platforms

-- To run this script:
-- 1. Open your MySQL client (MySQL Workbench, phpMyAdmin, etc.)
-- 2. Run the entire script
-- 3. Verify that all tables were created correctly

SELECT 'Database pd_sebastian_linero_caiman created successfully!' as status;