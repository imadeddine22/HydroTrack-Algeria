const mongoose = require('mongoose');

const communeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  name_ar:   { type: String, trim: true },
  name_en:   { type: String, trim: true },
  wilayaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Wilaya', required: true },
});

module.exports = mongoose.model('Commune', communeSchema);
