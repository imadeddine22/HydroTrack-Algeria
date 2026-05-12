const express        = require('express');
const router         = express.Router();
const Infrastructure = require('../models/Infrastructure');

// ─── Populate helper ────────────────────────────────────────────────────────
const deepPopulate = {
  path: 'zoneId',
  select: 'name communeId',
  populate: {
    path: 'communeId',
    select: 'name wilayaId',
    populate: { path: 'wilayaId', select: 'name' },
  },
};

// ─── GET /api/infrastructures ───────────────────────────────────────────────
// Query params: zoneId, type (forage|tank|dam), status (active|inactive)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.zoneId)  filter.zoneId  = req.query.zoneId;
    if (req.query.type)    filter.type    = req.query.type;
    if (req.query.status)  filter.status  = req.query.status;

    const items = await Infrastructure.find(filter)
      .populate(deepPopulate)
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/infrastructures/stats ─────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const stats = await Infrastructure.aggregate([
      {
        $facet: {
          basic: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
              }
            }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          avgFill: [
            {
              $group: {
                _id: null,
                avg: { $avg: { $cond: [{ $eq: ['$type', 'dam'] }, '$fillPercentage', null] } }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const basic = result.basic[0] || { total: 0, active: 0, inactive: 0 };
    const formattedByType = { forage: 0, tank: 0, dam: 0 };
    result.byType.forEach(t => { if (t._id) formattedByType[t._id] = t.count; });
    const avgFill = Math.round(result.avgFill[0]?.avg || 0);

    res.json({
      total: basic.total,
      active: basic.active,
      inactive: basic.inactive,
      byType: formattedByType,
      avgFill
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch infrastructure stats' });
  }
});

// ─── GET /api/infrastructures/:id ───────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await Infrastructure.findById(req.params.id).populate(deepPopulate);
    if (!item) return res.status(404).json({ error: 'Infrastructure not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch infrastructure' });
  }
});

// ─── POST /api/infrastructures ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, type, subType, status, zoneId, depth, capacity, fillPercentage } = req.body;
    
    const item = await Infrastructure.create({
      name, type, subType, status, zoneId, depth, capacity, fillPercentage
    });
    
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /api/infrastructures/:id ────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'type', 'subType', 'status', 'zoneId', 'depth', 'capacity', 'fillPercentage'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const item = await Infrastructure.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    
    if (!item) return res.status(404).json({ error: 'Infrastructure not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /api/infrastructures/:id ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Infrastructure.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
