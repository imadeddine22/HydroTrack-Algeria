const mongoose = require('mongoose');

const wilayaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  name_ar: { type: String, trim: true },
  name_en: { type: String, trim: true },
  code: { type: String, trim: true, unique: true }, // e.g., '16' for Alger
});

module.exports = mongoose.model('Wilaya', wilayaSchema);
