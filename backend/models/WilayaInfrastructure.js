const mongoose = require('mongoose');

const wilayaInfrastructureSchema = new mongoose.Schema(
  {
    wilayaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wilaya',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['forage', 'chateau_eau', 'barrage'],
      required: true,
    },

    sousType: {
      type: String,
      enum: ['deep', 'shallow', 'elevated', 'ground', null],
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'en_construction', 'en_maintenance'],
      default: 'active',
    },

    // Forage fields
    depth:           { type: Number, default: null },          // profondeur en mètres
    debitJournalier: { type: Number, default: null },          // m³/jour

    // Château d'eau fields
    capacite:        { type: Number, default: null },          // capacité en m³
    hauteur:         { type: Number, default: null },          // hauteur en mètres
    niveauActuel:    { type: Number, min: 0, max: 100, default: null }, // % remplissage

    // Barrage fields
    volumeTotal:     { type: Number, default: null },          // volume total en Mm³
    volumeActuel:    { type: Number, default: null },          // volume actuel en Mm³
    tauxRemplissage: { type: Number, min: 0, max: 100, default: null }, // % remplissage

    // Shared optional fields
    commune:         { type: String, trim: true, default: null },
    commune_ar:      { type: String, trim: true, default: null },
    commune_en:      { type: String, trim: true, default: null },

    localisation:    { type: String, trim: true, default: null },
    localisation_ar: { type: String, trim: true, default: null },
    localisation_en: { type: String, trim: true, default: null },

    anneeConstruction: { type: Number, default: null },

    notes:           { type: String, trim: true, default: null },
    notes_ar:        { type: String, trim: true, default: null },
    notes_en:        { type: String, trim: true, default: null },

    // Multilingual name (fr = main `name` field)
    name_ar:         { type: String, trim: true, default: null },
    name_en:         { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

// Index for fast lookups by wilaya + type
wilayaInfrastructureSchema.index({ wilayaId: 1, type: 1 });
wilayaInfrastructureSchema.index({ type: 1, status: 1 });
wilayaInfrastructureSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WilayaInfrastructure', wilayaInfrastructureSchema);
