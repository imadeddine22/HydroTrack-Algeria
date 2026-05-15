const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');

// GET /api/zones
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.communeId) filter.communeId = req.query.communeId;
    const zones = await Zone.find(filter).populate('communeId');
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones/:id
router.get('/:id', async (req, res) => {
  try {
    const z = await Zone.findById(req.params.id).populate('communeId');
    if (!z) return res.status(404).json({ error: 'Not found' });
    res.json(z);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones
router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, communeId } = req.body;
    const z = await Zone.create({ name, name_ar, name_en, communeId });
    res.status(201).json(z);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/zones/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, communeId } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (name_ar !== undefined) updates.name_ar = name_ar;
    if (name_en !== undefined) updates.name_en = name_en;
    if (communeId !== undefined) updates.communeId = communeId;

    const z = await Zone.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!z) return res.status(404).json({ error: 'Not found' });
    res.json(z);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/zones/:id
router.delete('/:id', async (req, res) => {
  try {
    const z = await Zone.findByIdAndDelete(req.params.id);
    if (!z) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
