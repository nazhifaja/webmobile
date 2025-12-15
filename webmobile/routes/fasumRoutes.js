const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all fasum
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('fasum')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET fasum by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('fasum')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new fasum
router.post('/', async (req, res) => {
    try {
        const { nama, lokasi, longitude, latitude } = req.body;
        const { data, error } = await supabase
            .from('fasum')
            .insert([{ nama, lokasi, longitude, latitude }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update fasum
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, lokasi, longitude, latitude } = req.body;
        const { data, error } = await supabase
            .from('fasum')
            .update({ nama, lokasi, longitude, latitude })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE fasum
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('fasum')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Fasum berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
