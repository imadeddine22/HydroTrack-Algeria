const express = require('express');
const router  = express.Router();
const Alert   = require('../models/Alert');

// GET /api/alerts?resolved=false&severity=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';
    if (req.query.severity) filter.severity = req.query.severity;
    const alerts = await Alert.find(filter)
      .populate('infrastructureId', 'name type')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await Alert.aggregate([
      { $match: { resolved: false } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = { total: 0, critical: 0, warning: 0, info: 0 };
    summary.forEach(s => {
      if (s._id) {
        formatted[s._id] = s.count;
        formatted.total += s.count;
      }
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts summary' });
  }
});

// POST /api/alerts
router.post('/', async (req, res) => {
  try {
    const { infrastructureId, type, severity, message, details } = req.body;
    
    const alert = await Alert.create({
      infrastructureId, type, severity, message, details,
      resolved: false,
      createdAt: new Date()
    });
    
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/alerts/:id/resolve
router.put('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
