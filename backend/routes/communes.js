const express = require('express');
const router = express.Router();
const Commune = require('../models/Commune');

// GET /api/communes
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.wilayaId) filter.wilayaId = req.query.wilayaId;
    const communes = await Commune.find(filter).populate('wilayaId');
    res.json(communes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/communes/:id
router.get('/:id', async (req, res) => {
  try {
    const c = await Commune.findById(req.params.id).populate('wilayaId');
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/communes (Supports bulk via array or comma-separated names)
router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, names, wilayaId } = req.body;

    // Support bulk via 'names' array
    if (Array.isArray(names)) {
      const created = [];
      for (const n of names) {
        const c = await Commune.create({ name: n, wilayaId });
        created.push(c);
      }
      return res.status(201).json(created);
    }

    const c = await Commune.create({ name, name_ar, name_en, wilayaId });
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/communes/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, wilayaId } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (name_ar !== undefined) updates.name_ar = name_ar;
    if (name_en !== undefined) updates.name_en = name_en;
    if (wilayaId !== undefined) updates.wilayaId = wilayaId;

    const c = await Commune.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/communes/:id
router.delete('/:id', async (req, res) => {
  try {
    const c = await Commune.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
