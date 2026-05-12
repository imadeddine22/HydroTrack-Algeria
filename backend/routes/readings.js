const express        = require('express');
const router         = express.Router();
const Reading        = require('../models/Reading');
const Infrastructure = require('../models/Infrastructure');

// GET /api/readings?infrastructureId=&limit=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.infrastructureId) filter.infrastructureId = req.query.infrastructureId;
    const limit = parseInt(req.query.limit) || 50;
    const readings = await Reading.find(filter)
      .populate('infrastructureId', 'name type')
      .sort({ recordedAt: -1 })
      .limit(limit);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/latest – latest reading per infrastructure
router.get('/latest', async (req, res) => {
  try {
    const latest = await Reading.aggregate([
      { $sort: { recordedAt: -1 } },
      { $group: { _id: '$infrastructureId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = await Reading.aggregate([
      {
        $facet: {
          infraStats: [
            {
              $lookup: {
                from: 'infrastructures',
                pipeline: [
                  {
                    $group: {
                      _id: null,
                      total: { $sum: 1 },
                      active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
                    }
                  }
                ],
                as: 'infra'
              }
            }
          ],
          readingAvgs: [
            { $sort: { recordedAt: -1 } },
            { $limit: 200 },
            {
              $group: {
                _id: null,
                avgLevel: { $avg: '$waterLevel' },
                avgTemp: { $avg: '$temperature' },
                avgPressure: { $avg: '$pressure' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const infra = result.infraStats[0]?.infra[0] || { total: 0, active: 0 };
    const avgs = result.readingAvgs[0] || { avgLevel: 0, avgTemp: 0, avgPressure: 0 };

    res.json({
      totalInfra: infra.total,
      activeInfra: infra.active,
      inactiveInfra: infra.total - infra.active,
      avgWaterLevel: Math.round(avgs.avgLevel || 0),
      avgTemperature: +(avgs.avgTemp || 0).toFixed(1),
      avgPressure: +(avgs.avgPressure || 0).toFixed(1),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// POST /api/readings
router.post('/', async (req, res) => {
  try {
    const { 
      infrastructureId, waterLevel, temperature, 
      pressure, batteryLevel, signalStrength, recordedAt 
    } = req.body;

    const reading = await Reading.create({
      infrastructureId, waterLevel, temperature, 
      pressure, batteryLevel, signalStrength, recordedAt: recordedAt || new Date()
    });
    
    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/readings/:id
router.delete('/:id', async (req, res) => {
  try {
    await Reading.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
