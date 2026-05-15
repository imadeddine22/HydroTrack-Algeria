const express = require('express');
const router = express.Router();
const Wilaya = require('../models/Wilaya');

// GET /api/wilayas
router.get('/', async (req, res) => {
  try {
    const wilayas = await Wilaya.find();
    res.json(wilayas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wilayas/:id
router.get('/:id', async (req, res) => {
  try {
    const w = await Wilaya.findById(req.params.id);
    if (!w) return res.status(404).json({ error: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wilayas
router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, code } = req.body;
    const w = await Wilaya.create({ name, name_ar, name_en, code });
    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/wilayas/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, code } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (name_ar !== undefined) updates.name_ar = name_ar;
    if (name_en !== undefined) updates.name_en = name_en;
    if (code !== undefined) updates.code = code;

    const w = await Wilaya.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!w) return res.status(404).json({ error: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/wilayas/:id
router.delete('/:id', async (req, res) => {
  try {
    const w = await Wilaya.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
