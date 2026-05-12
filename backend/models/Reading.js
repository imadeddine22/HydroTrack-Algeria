const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    infrastructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Infrastructure',
      required: true,
    },

    waterLevel: { type: Number, default: null },       // percentage 0-100
    pressure:   { type: Number, default: null },       // bar
    temperature:{ type: Number, default: null },       // °C
    flowRate:   { type: Number, default: null },       // m³/h
    turbidity:  { type: Number, default: null },       // NTU
    ph:         { type: Number, default: null },       // 0-14

    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Performance Indexes
readingSchema.index({ infrastructureId: 1, recordedAt: -1 });
readingSchema.index({ recordedAt: -1 });

module.exports = mongoose.model('Reading', readingSchema);
