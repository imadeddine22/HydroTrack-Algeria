const mongoose = require('mongoose');
const Wilaya = require('./models/Wilaya');
const Commune = require('./models/Commune');
const Zone = require('./models/Zone');
const Infrastructure = require('./models/Infrastructure');

/* ── All 58 Algerian Wilayas with their communes (Arabic) ──────────── */
const ALGERIA_DATA = require('./algeria_communes');

async function seed(db_uri) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(db_uri);
  }
  console.log('🌱  Connected to MongoDB — seeding...');

  const WilayaInfrastructure = require('./models/WilayaInfrastructure');
  
  // ── Wipe existing geo data (keeps WilayaInfrastructure intact) ───────────
  await Promise.all([
    Wilaya.deleteMany(),
    Commune.deleteMany(),
    Zone.deleteMany(),
    Infrastructure.deleteMany(),
  ]);

  // ── Insert all 58 Wilayas ────────────────────────────────────
  const wilayaDocs = await Wilaya.insertMany(
    ALGERIA_DATA.map(w => ({ name: w.name }))
  );

  // ── Insert Communes for each Wilaya ──────────────────────────
  const communeInserts = [];
  for (let i = 0; i < ALGERIA_DATA.length; i++) {
    for (const cName of ALGERIA_DATA[i].communes) {
      communeInserts.push({ name: cName, wilayaId: wilayaDocs[i]._id });
    }
  }
  const communeDocs = await Commune.insertMany(communeInserts);

  // ── Sample Zones (for detailed monitoring) ───────────────────
  const algerCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '16 - الجزائر' && w._id.equals(c.wilayaId))
  );
  const oranCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '31 - Oran' && w._id.equals(c.wilayaId))
  );
  const conCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '25 - Constantine' && w._id.equals(c.wilayaId))
  );

  const kouba = algerCommunes.find(c => c.name === 'القبة');
  const hydraComm = algerCommunes.find(c => c.name === 'حيدرة' || c.name === 'Hydra' || c.name === 'بئر مراد رايس');
  const birElDjir = oranCommunes.find(c => c.name === 'Bir El Djir');
  const elKhroub = conCommunes.find(c => c.name === 'El Khroub');

  if (!kouba || !hydraComm || !birElDjir || !elKhroub) {
    console.log('⚠️  Some sample communes not found, skipping detailed infrastructure seed.');
    console.log(`✅  Wilayas: 58 | Communes: ${communeDocs.length} | Wilaya Infras: 6`);
    await mongoose.disconnect();
    return;
  }

  const zonesDocs = await Zone.insertMany([
    { name: 'Zone Nord Kouba', communeId: kouba._id },
    { name: 'Zone Sud Kouba', communeId: kouba._id },
    { name: 'Hydra Plateau', communeId: hydraComm._id },
    { name: 'Oran Est', communeId: birElDjir._id },
    { name: 'Oran Ouest', communeId: birElDjir._id },
    { name: 'Khroub Centre', communeId: elKhroub._id },
    { name: 'Khroub Nord', communeId: elKhroub._id },
  ]);

  const [zK1, zK2, zH1, zB1, zB2, zC1, zC2] = zonesDocs;

  // ── Sample Infrastructures ───────────────────────────────────
  await Infrastructure.insertMany([
    { name: 'Forage Profond Kouba 1', type: 'forage', subType: 'deep', status: 'active', zoneId: zK1._id, depth: 350 },
    { name: 'Forage Profond Kouba 2', type: 'forage', subType: 'deep', status: 'active', zoneId: zK1._id, depth: 420 },
    { name: 'Forage Superficiel Hydra', type: 'forage', subType: 'shallow', status: 'inactive', zoneId: zH1._id, depth: 48 },
    { name: 'Forage Oran Est 1', type: 'forage', subType: 'deep', status: 'active', zoneId: zB1._id, depth: 310 },
    { name: 'Forage Oran Ouest', type: 'forage', subType: 'shallow', status: 'inactive', zoneId: zB2._id, depth: 60 },
    { name: 'Forage Khroub A', type: 'forage', subType: 'deep', status: 'active', zoneId: zC1._id, depth: 400 },
    { name: 'Château Élevé Kouba', type: 'tank', subType: 'elevated', status: 'active', zoneId: zK2._id, capacity: 5000 },
    { name: 'Réservoir Sol Hydra', type: 'tank', subType: 'ground', status: 'active', zoneId: zH1._id, capacity: 12000 },
    { name: 'Château Oran Est', type: 'tank', subType: 'elevated', status: 'inactive', zoneId: zB1._id, capacity: 8000 },
    { name: 'Réservoir Khroub Centre', type: 'tank', subType: 'ground', status: 'active', zoneId: zC1._id, capacity: 20000 },
    { name: 'Barrage Ouest Oran Detail', type: 'dam', status: 'active', zoneId: zB2._id, capacity: 150_000_000, fillPercentage: 75 },
    { name: 'Barrage Beni Haroun Detail', type: 'dam', status: 'active', zoneId: zC2._id, capacity: 960_000_000, fillPercentage: 68 },
  ]);

  console.log('✅  Database seeded successfully!');
  console.log(`   Wilayas: 58 | Communes: ${communeDocs.length} | Wilaya Infras: 6 | Detailed Infras: 12`);
}

module.exports = seed;

// ── Standalone run ─────────────────────────────────────────────
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hydrotrack';
  seed(MONGODB_URI).then(() => mongoose.disconnect());
}
