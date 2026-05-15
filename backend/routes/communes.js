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

// POST /api/communes (Supports bulk via array or comma-separated names)
router.post('/', async (req, res) => {
  try {
    const { name, names, wilayaId } = req.body;
    
    // Support bulk via 'names' array
    if (Array.isArray(names)) {
      const docs = names.map(n => ({ name: n.trim(), wilayaId }));
      const created = await Commune.insertMany(docs);
      return res.status(201).json(created);
    }

    // Support bulk via comma-separated 'name' string
    if (name && name.includes(',')) {
      const parts = name.split(',').map(n => n.trim()).filter(n => n);
      const docs = parts.map(n => ({ name: n, wilayaId }));
      const created = await Commune.insertMany(docs);
      return res.status(201).json(created);
    }

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
