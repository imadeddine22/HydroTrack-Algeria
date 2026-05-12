const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    infrastructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Infrastructure',
      required: true,
    },

    type: {
      type: String,
      enum: ['low_level', 'high_pressure', 'temperature', 'maintenance', 'flow_anomaly', 'offline'],
      required: true,
    },

    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },

    message:  { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Performance Indexes
alertSchema.index({ infrastructureId: 1, resolved: 1 });
alertSchema.index({ resolved: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
