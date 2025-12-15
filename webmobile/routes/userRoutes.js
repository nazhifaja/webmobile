const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all users
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new user
router.post('/', async (req, res) => {
    try {
        const { nama, password } = req.body;
        const { data, error } = await supabase
            .from('user')
            .insert([{ nama, password }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, password } = req.body;
        const { data, error } = await supabase
            .from('user')
            .update({ nama, password })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('user')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
