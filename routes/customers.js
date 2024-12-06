const express = require('express');
const router = express.Router();
const db = require('../db');

// Show all customers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Customers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Show a customer by Id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // Validation: if Id isn't a number
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new customer
router.post('/', async (req, res) => {
    const { customer_name, contact_name, phone, email, address } = req.body;

    // Validation
    if (!customer_name || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Customers (customer_name, contact_name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
            [customer_name, contact_name, phone, email, address]
        );
        res.status(201).json({ id: result.insertId, customer_name, contact_name, phone, email, address });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a customer by Id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { customer_name, contact_name, phone, email, address } = req.body;

    // Validation: if Id isn't a number
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
        const [existingCustomer] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
        if (existingCustomer.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const [result] = await db.query(
            `UPDATE Customers
            SET customer_name = ?, contact_name = ?, phone = ?, email = ?, address = ?
            WHERE customer_id = ?`,
            [customer_name, contact_name, phone, email, address, id]
        );

        res.status(200).json({
            message: 'Customer updated successfully',
            customer: { id, customer_name, contact_name, phone, email, address },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change status of customer by Id
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validation: if ID isn't a number
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validation: is_active must be boolean
    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'Invalid is_active value. Must be true or false' });
    }

    try {
        const [existingCustomer] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
        if (existingCustomer.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const [result] = await db.query(
            `UPDATE Customers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?`,
            [is_active, id]
        );

        res.status(200).json({
            message: `Customer status updated successfully to ${is_active ? 'active' : 'inactive'}`,
            customer: { id, is_active },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;