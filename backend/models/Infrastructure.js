const mongoose = require('mongoose');

const infrastructureSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },

    type:            {
      type: String,
      enum: ['forage', 'tank', 'dam'],
      required: true,
    },

    subType:         {
      type: String,
      enum: ['deep', 'shallow', 'elevated', 'ground', null],
      default: null,
    },

    status:          {
      type: String,
      enum: ['active', 'inactive'],
      required: true,
      default: 'active',
    },

    zoneId:          {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },

    // Wells only
    depth:           { type: Number, default: null },

    // Tanks & Dams
    capacity:        { type: Number, default: null },

    // Dams only
    fillPercentage:  { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Infrastructure', infrastructureSchema);
