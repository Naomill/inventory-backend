const express = require('express');
const router = express.Router();
const db = require('../db');

// Show all suppliers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Supplier');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Show a supplier by Id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new supplier
router.post('/', async (req, res) => {
    const { supplier_name, contact_name, phone, email, address } = req.body;

    if (!supplier_name || supplier_name.trim() === "" || !phone || phone.trim() === "") {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Supplier (supplier_name, contact_name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
            [supplier_name, contact_name, phone, email, address]
        );
        const [newSupplier] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [result.insertId]);
        res.status(201).json(newSupplier[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a supplier by Id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { supplier_name, contact_name, phone, email, address } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (!supplier_name || supplier_name.trim() === "" || !phone || phone.trim() === "") {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    try {
        const [existingSupplier] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [id]);
        if (existingSupplier.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        await db.query(
            `UPDATE Supplier SET supplier_name = ?, contact_name = ?, phone = ?, email = ?, address = ? WHERE supplier_id = ?`,
            [supplier_name, contact_name, phone, email, address, id]
        );

        const [updatedSupplier] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [id]);
        res.status(200).json({
            message: 'Supplier updated successfully',
            supplier: updatedSupplier[0],
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change status of supplier by Id
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'Invalid is_active value. Must be true or false' });
    }

    try {
        const [existingSupplier] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [id]);
        if (existingSupplier.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        await db.query(
            `UPDATE Supplier SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE supplier_id = ?`,
            [is_active, id]
        );

        const [updatedSupplier] = await db.query('SELECT * FROM Supplier WHERE supplier_id = ?', [id]);
        res.status(200).json({
            message: `Supplier status updated successfully to ${is_active ? 'active' : 'inactive'}`,
            supplier: updatedSupplier[0],
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;