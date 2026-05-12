const mongoose = require('mongoose');

const wilayaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('Wilaya', wilayaSchema);
