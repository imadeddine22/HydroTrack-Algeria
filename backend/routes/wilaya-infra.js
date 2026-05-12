const express              = require('express');
const router               = express.Router();
const WilayaInfrastructure = require('../models/WilayaInfrastructure');
const Wilaya               = require('../models/Wilaya');

// ─── Helper: verify wilaya exists ────────────────────────────────────────────
async function checkWilaya(wilayaId, res) {
  const w = await Wilaya.findById(wilayaId);
  if (!w) {
    res.status(404).json({ error: 'Wilaya not found' });
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra
//  Query params: wilayaId, type (forage|chateau_eau|barrage), status
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.wilayaId) filter.wilayaId = req.query.wilayaId;
    if (req.query.type)     filter.type     = req.query.type;
    if (req.query.status)   filter.status   = req.query.status;

    const items = await WilayaInfrastructure.find(filter)
      .populate('wilayaId', 'name')
      .sort({ type: 1, name: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/stats
//  Global statistics: totals by type, by status, avg fill rates
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const stats = await WilayaInfrastructure.aggregate([
      {
        $facet: {
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          averages: [
            {
              $group: {
                _id: null,
                avgFillBarrage: { 
                  $avg: { $cond: [{ $eq: ['$type', 'barrage'] }, '$tauxRemplissage', null] } 
                },
                avgFillChateau: { 
                  $avg: { $cond: [{ $eq: ['$type', 'chateau_eau'] }, '$niveauActuel', null] } 
                },
                total: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const formattedByType = { forage: 0, chateau_eau: 0, barrage: 0 };
    result.byType.forEach(t => { if (t._id) formattedByType[t._id] = t.count; });

    const formattedByStatus = { active: 0, inactive: 0, en_construction: 0, en_maintenance: 0 };
    result.byStatus.forEach(s => { if (s._id) formattedByStatus[s._id] = s.count; });

    const avgs = result.averages[0] || { avgFillBarrage: 0, avgFillChateau: 0, total: 0 };

    res.json({
      total: avgs.total,
      byType: formattedByType,
      byStatus: formattedByStatus,
      avgFillBarrage: Math.round(avgs.avgFillBarrage || 0),
      avgFillChateau: Math.round(avgs.avgFillChateau || 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/by-wilaya/:wilayaId
//  All infrastructure for a specific wilaya, grouped by type
// ─────────────────────────────────────────────────────────────────────────────
router.get('/by-wilaya/:wilayaId', async (req, res) => {
  try {
    if (!(await checkWilaya(req.params.wilayaId, res))) return;

    const items = await WilayaInfrastructure.find({ wilayaId: req.params.wilayaId })
      .populate('wilayaId', 'name')
      .sort({ type: 1, name: 1 });

    // Group by type
    const grouped = {
      forages:      items.filter(i => i.type === 'forage'),
      chateaux_eau: items.filter(i => i.type === 'chateau_eau'),
      barrages:     items.filter(i => i.type === 'barrage'),
    };

    res.json({
      wilayaId: req.params.wilayaId,
      total: items.length,
      grouped,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/by-wilaya/:wilayaId/forages
// ─────────────────────────────────────────────────────────────────────────────
router.get('/by-wilaya/:wilayaId/forages', async (req, res) => {
  try {
    if (!(await checkWilaya(req.params.wilayaId, res))) return;

    const filter = { wilayaId: req.params.wilayaId, type: 'forage' };
    if (req.query.status) filter.status = req.query.status;

    const items = await WilayaInfrastructure.find(filter)
      .populate('wilayaId', 'name')
      .sort({ name: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/by-wilaya/:wilayaId/chateaux-eau
// ─────────────────────────────────────────────────────────────────────────────
router.get('/by-wilaya/:wilayaId/chateaux-eau', async (req, res) => {
  try {
    if (!(await checkWilaya(req.params.wilayaId, res))) return;

    const filter = { wilayaId: req.params.wilayaId, type: 'chateau_eau' };
    if (req.query.status) filter.status = req.query.status;

    const items = await WilayaInfrastructure.find(filter)
      .populate('wilayaId', 'name')
      .sort({ name: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/by-wilaya/:wilayaId/barrages
// ─────────────────────────────────────────────────────────────────────────────
router.get('/by-wilaya/:wilayaId/barrages', async (req, res) => {
  try {
    if (!(await checkWilaya(req.params.wilayaId, res))) return;

    const filter = { wilayaId: req.params.wilayaId, type: 'barrage' };
    if (req.query.status) filter.status = req.query.status;

    const items = await WilayaInfrastructure.find(filter)
      .populate('wilayaId', 'name')
      .sort({ name: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/wilaya-infra/:id  — single item
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await WilayaInfrastructure.findById(req.params.id)
      .populate('wilayaId', 'name');
    if (!item) return res.status(404).json({ error: 'Infrastructure not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/wilaya-infra
//  Body: { wilayaId, name, type, status?, depth?, capacite?, ... }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { 
      wilayaId, name, type, status, 
      commune, coord_lat, coord_lng,
      tauxRemplissage, niveauActuel, capacite, debit, profondeur
    } = req.body;

    if (!wilayaId) return res.status(400).json({ error: 'wilayaId is required' });
    if (!(await checkWilaya(wilayaId, res))) return;

    const item = await WilayaInfrastructure.create({
      wilayaId, name, type, status,
      commune, coord_lat, coord_lng,
      tauxRemplissage, niveauActuel, capacite, debit, profondeur
    });
    
    const populated = await item.populate('wilayaId', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/wilaya-infra/:id  — update infrastructure
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'type', 'status', 'commune', 
      'coord_lat', 'coord_lng', 'tauxRemplissage', 
      'niveauActuel', 'capacite', 'debit', 'profondeur'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const item = await WilayaInfrastructure.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('wilayaId', 'name');

    if (!item) return res.status(404).json({ error: 'Infrastructure not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/wilaya-infra/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const item = await WilayaInfrastructure.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Infrastructure not found' });
    res.json({ success: true, deleted: item._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/wilaya-infra/by-wilaya/:wilayaId  — delete ALL for a wilaya
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/by-wilaya/:wilayaId', async (req, res) => {
  try {
    const result = await WilayaInfrastructure.deleteMany({ wilayaId: req.params.wilayaId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
