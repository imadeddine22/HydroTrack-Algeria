const express = require('express');
const router  = express.Router();
const Commune = require('../models/Commune');

// GET /api/communes?wilayaId=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.wilayaId) filter.wilayaId = req.query.wilayaId;
    const communes = await Commune.find(filter).populate('wilayaId', 'name').sort({ name: 1 });
    res.json(communes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/communes/:id
router.get('/:id', async (req, res) => {
  try {
    const c = await Commune.findById(req.params.id).populate('wilayaId', 'name');
    if (!c) return res.status(404).json({ error: 'Commune not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/communes
router.post('/', async (req, res) => {
  try {
    const { name, wilayaId } = req.body;
    const c = await Commune.create({ name, wilayaId });
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/communes/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, wilayaId } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (wilayaId !== undefined) updates.wilayaId = wilayaId;

    const c = await Commune.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!c) return res.status(404).json({ error: 'Commune not found' });
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/communes/:id
router.delete('/:id', async (req, res) => {
  try {
    await Commune.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
