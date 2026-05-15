const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  name_ar:   { type: String, trim: true },
  name_en:   { type: String, trim: true },
  communeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commune', required: true },
});

module.exports = mongoose.model('Zone', zoneSchema);
