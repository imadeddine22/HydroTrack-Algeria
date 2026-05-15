const mongoose = require('mongoose');

const wilayaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, unique: true }, // e.g., '16' for Alger
});

module.exports = mongoose.model('Wilaya', wilayaSchema);
