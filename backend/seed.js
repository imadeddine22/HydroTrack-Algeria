const mongoose = require('mongoose');
const Wilaya = require('./models/Wilaya');
const Commune = require('./models/Commune');
const Zone = require('./models/Zone');
const Infrastructure = require('./models/Infrastructure');

/* ── All 58 Algerian Wilayas with their main communes ──────────────── */
const ALGERIA_DATA = [
  { name: '01 - Adrar', communes: ['Adrar', 'Reggane', 'Timimoun', 'Aoulef', 'Bordj Badji Mokhtar', 'Tsabit', 'Fenoughil'] },
  { name: '02 - Chlef', communes: ['Chlef', 'Ténès', 'Ech Cheliff', 'Oued Fodda', 'Boukadir', 'Abou El Hassan', 'El Marsa'] },
  { name: '03 - Laghouat', communes: ['Laghouat', 'Aflou', 'Hassi R\'Mel', 'Ksar El Hirane', 'Brida', 'El Ghicha'] },
  { name: '04 - Oum El Bouaghi', communes: ['Oum El Bouaghi', 'Aïn Beïda', 'Aïn Mlila', 'Aïn Fakroun', 'Souk Naamane', 'Meskiana'] },
  { name: '05 - Batna', communes: ['Batna', 'Barika', 'Aïn Touta', 'Merouana', 'Timgad', 'Arris', 'N\'Gaous', 'Tazoult'] },
  { name: '06 - Béjaïa', communes: ['Béjaïa', 'Amizour', 'El Kseur', 'Akbou', 'Tazmalt', 'Tichy', 'Souk El Ténine'] },
  { name: '07 - Biskra', communes: ['Biskra', 'Tolga', 'Sidi Okba', 'El Kantara', 'Ouled Djellal', 'Zeribet El Oued', 'Foughala'] },
  { name: '08 - Béchar', communes: ['Béchar', 'Abadla', 'Beni Abbès', 'Kenadza', 'Lahmar', 'Taghit', 'Igli'] },
  { name: '09 - Blida', communes: ['Blida', 'Boufarik', 'Larbaa', 'Meftah', 'Bougara', 'Chiffa', 'El Affroun', 'Oued El Alleug'] },
  { name: '10 - Bouira', communes: ['Bouira', 'Lakhdaria', 'Sour El Ghozlane', 'El Asnam', 'Kadiria', 'Aïn Bessem', 'M\'Chedallah'] },
  { name: '11 - Tamanrasset', communes: ['Tamanrasset', 'Abalessa', 'In Salah', 'In Guezzam', 'Tinzaouatine', 'Ideles'] },
  { name: '12 - Tébessa', communes: ['Tébessa', 'El Kouif', 'Chrea', 'Morsott', 'El Aouinet', 'Bir El Ater', 'Ouenza'] },
  { name: '13 - Tlemcen', communes: ['Tlemcen', 'Maghnia', 'Ghazaouet', 'Remchi', 'Nedroma', 'Sebdou', 'Hennaya', 'Chetouane'] },
  { name: '14 - Tiaret', communes: ['Tiaret', 'Sougueur', 'Frenda', 'Ksar Chellala', 'Mahdia', 'Rahouia', 'Mechraa Sfa'] },
  { name: '15 - Tizi Ouzou', communes: ['Tizi Ouzou', 'Azazga', 'Boghni', 'Draâ Ben Khedda', 'Larbaa Nath Irathen', 'Ouacif', 'Aïn El Hammam'] },
  { name: '16 - Alger', communes: ['Sidi M\'Hamed', 'El Harrach', 'Bab El Oued', 'Hussein Dey', 'Kouba', 'Hydra', 'Bir Mourad Raïs', 'Bouzaréah', 'Chéraga', 'Dar El Beïda', 'Rouïba'] },
  { name: '17 - Djelfa', communes: ['Djelfa', 'Messaad', 'Aïn Oussera', 'Birine', 'Hassi Bahbah', 'Sidi Ladjel', 'El Idrissia'] },
  { name: '18 - Jijel', communes: ['Jijel', 'Taher', 'El Milia', 'Ziama Mansouriah', 'Chekfa', 'Texenna', 'Sidi Maarouf'] },
  { name: '19 - Sétif', communes: ['Sétif', 'El Eulma', 'Aïn Oulmene', 'Bougaa', 'Bir El Arch', 'Salah Bey', 'Aïn Arnat'] },
  { name: '20 - Saïda', communes: ['Saïda', 'Aïn El Hadjar', 'Sidi Boubekeur', 'El Hassasna', 'Moulay Larbi', 'Doui Thabet'] },
  { name: '21 - Skikda', communes: ['Skikda', 'Azzaba', 'El Harrouch', 'Collo', 'Tamalous', 'Ramdane Djamel', 'Oum Toub'] },
  { name: '22 - Sidi Bel Abbès', communes: ['Sidi Bel Abbès', 'Telagh', 'Tessala', 'Sfisef', 'Mostefa Ben Brahim', 'Bir El Hammam'] },
  { name: '23 - Annaba', communes: ['Annaba', 'El Hadjar', 'Berrahal', 'El Bouni', 'Sidi Amar', 'Seraïdi', 'Chetaïbi'] },
  { name: '24 - Guelma', communes: ['Guelma', 'Héliopolis', 'Oued Zenati', 'Bouchegouf', 'Hammam Debagh', 'Khezaras'] },
  { name: '25 - Constantine', communes: ['Constantine', 'El Khroub', 'Aïn Smara', 'Hamma Bouziane', 'Didouche Mourad', 'Ibn Ziad', 'Zighoud Youcef'] },
  { name: '26 - Médéa', communes: ['Médéa', 'Berrouaghia', 'Ksar El Boukhari', 'Sidi Naamoune', 'Aïn Boucif', 'El Azizia'] },
  { name: '27 - Mostaganem', communes: ['Mostaganem', 'Aïn Tédelès', 'Sidi Ali', 'Mesra', 'Bouguirat', 'Sirat', 'Hassi Mameche'] },
  { name: '28 - M\'Sila', communes: ['M\'Sila', 'Bou Saâda', 'Aïn El Melh', 'Sidi Aïssa', 'Ouled Derradj', 'Magra', 'Berhoum'] },
  { name: '29 - Mascara', communes: ['Mascara', 'Sig', 'Bouhanifia', 'Aïn Fares', 'Mohammadia', 'Tighennif', 'El Bordj'] },
  { name: '30 - Ouargla', communes: ['Ouargla', 'Touggourt', 'Hassi Messaoud', 'Rouissat', 'N\'Goussa', 'Taibet', 'Témacine'] },
  { name: '31 - Oran', communes: ['Oran', 'Bir El Djir', 'Es Senia', 'Aïn Turk', 'Arzew', 'Mers El Kébir', 'Gdyel', 'Hassi Bounif'] },
  { name: '32 - El Bayadh', communes: ['El Bayadh', 'Rogassa', 'Boualem', 'Chellala', 'Aïn El Orak', 'El Bnoud'] },
  { name: '33 - Illizi', communes: ['Illizi', 'Djanet', 'In Amenas', 'Bordj Omar Driss', 'Debdeb'] },
  { name: '34 - Bordj Bou Arréridj', communes: ['Bordj Bou Arréridj', 'Ras El Oued', 'El Hamadia', 'Aïn Taghrout', 'Medjana', 'Bir Kasdali'] },
  { name: '35 - Boumerdès', communes: ['Boumerdès', 'Dellys', 'Boudouaou', 'Khemis El Khechna', 'Thénia', 'Tidjelabine', 'Bou Teldja'] },
  { name: '36 - El Tarf', communes: ['El Tarf', 'Ben M\'Hidi', 'Bouteldja', 'Drean', 'El Aïoun', 'Chbaita Mokhtar'] },
  { name: '37 - Tindouf', communes: ['Tindouf', 'Oum El Assel'] },
  { name: '38 - Tissemsilt', communes: ['Tissemsilt', 'Khemisti', 'Bordj El Emir Abdelkader', 'Lardjem', 'Theniet El Had'] },
  { name: '39 - El Oued', communes: ['El Oued', 'Guemar', 'Débila', 'Robbah', 'Kouinine', 'Oued El Alenda', 'Bayadha'] },
  { name: '40 - Khenchela', communes: ['Khenchela', 'Aïn Touila', 'Bouhmama', 'Chechar', 'El Mahmel', 'Kais'] },
  { name: '41 - Souk Ahras', communes: ['Souk Ahras', 'Sedrata', 'Mechroha', 'Taoura', 'Ouled Driss', 'Bir Bouhouche'] },
  { name: '42 - Tipaza', communes: ['Tipaza', 'Hadjout', 'Koléa', 'Cherchell', 'Aïn Tagourait', 'Bou Ismaïl', 'Fouka'] },
  { name: '43 - Mila', communes: ['Mila', 'Chelghoum Laïd', 'Ferdjioua', 'Aïn Mellouk', 'Tassadane Haddada', 'Oued Endja'] },
  { name: '44 - Aïn Defla', communes: ['Aïn Defla', 'Khemis Miliana', 'Miliana', 'Boumedfaa', 'Aïn Soltane', 'El Attaf'] },
  { name: '45 - Naâma', communes: ['Naâma', 'Méchéria', 'Aïn Sefra', 'Sfissifa', 'Tiout', 'Moghrar', 'Kasdir'] },
  { name: '46 - Aïn Témouchent', communes: ['Aïn Témouchent', 'Beni Saf', 'Hammam Bou Hadjar', 'El Malah', 'Aïn El Arba', 'Sidi Safi'] },
  { name: '47 - Ghardaïa', communes: ['Ghardaïa', 'Metlili', 'El Guerrara', 'Berriane', 'Dhayet Benacer', 'Zelfana'] },
  { name: '48 - Relizane', communes: ['Relizane', 'Mazouna', 'Aïn Tarik', 'Yellel', 'Hmadna', 'Oued Rhiou'] },
  { name: '49 - Timimoun', communes: ['Timimoun', 'Ouled Saïd', 'Charouine', 'Ksar Kaddour', 'Aougrout', 'Talmine'] },
  { name: '50 - Bordj Badji Mokhtar', communes: ['Bordj Badji Mokhtar', 'Timiaouine'] },
  { name: '51 - Ouled Djellal', communes: ['Ouled Djellal', 'Doucen', 'Sidi Khaled', 'Ras El Miaad', 'El Ghrous'] },
  { name: '52 - Béni Abbès', communes: ['Béni Abbès', 'Igli', 'Ksabi', 'Tabelbala', 'Tamtert'] },
  { name: '53 - In Salah', communes: ['In Salah', 'Foggaret Ezzaouia', 'In Ghar', 'Aoulef'] },
  { name: '54 - In Guezzam', communes: ['In Guezzam', 'Tinzaouatine'] },
  { name: '55 - Touggourt', communes: ['Touggourt', 'Témacine', 'Blidet Amor', 'Nezla', 'Megarine'] },
  { name: '56 - Djanet', communes: ['Djanet', 'Bordj El Haouasse', 'Illizi'] },
  { name: '57 - El M\'Ghair', communes: ['El M\'Ghair', 'Djamaa', 'Sidi Khaled', 'Still', 'Tendla', 'Oued El Alenda'] },
  { name: '58 - El Meniaa', communes: ['El Meniaa', 'Hassi Gara', 'Berezga', 'Zeghamra'] },
];

async function seed(db_uri) {
  await mongoose.connect(db_uri);
  console.log('🌱  Connected to MongoDB — seeding...');

  // ── Wipe existing ────────────────────────────────────────────
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

  // ── Sample Zones (for Alger & Oran) ─────────────────────────
  // Alger communes
  const algerCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '16 - Alger' && w._id.equals(c.wilayaId))
  );
  const oranCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '31 - Oran' && w._id.equals(c.wilayaId))
  );
  const conCommunes = communeDocs.filter(c =>
    wilayaDocs.find(w => w.name === '25 - Constantine' && w._id.equals(c.wilayaId))
  );

  const kouba = algerCommunes.find(c => c.name === 'Kouba');
  const hydra = algerCommunes.find(c => c.name === 'Hydra');
  const birElDjir = oranCommunes.find(c => c.name === 'Bir El Djir');
  const elKhroub = conCommunes.find(c => c.name === 'El Khroub');

  if (!kouba || !hydra || !birElDjir || !elKhroub) {
    console.log('⚠️  Some sample communes not found, skipping infrastructure seed.');
    console.log(`✅  Wilayas: 58 | Communes: ${communeDocs.length}`);
    await mongoose.disconnect();
    return;
  }

  const zones = await Zone.insertMany([
    { name: 'Zone Nord Kouba', communeId: kouba._id },
    { name: 'Zone Sud Kouba', communeId: kouba._id },
    { name: 'Hydra Plateau', communeId: hydra._id },
    { name: 'Oran Est', communeId: birElDjir._id },
    { name: 'Oran Ouest', communeId: birElDjir._id },
    { name: 'Khroub Centre', communeId: elKhroub._id },
    { name: 'Khroub Nord', communeId: elKhroub._id },
  ]);

  const [zK1, zK2, zH1, zB1, zB2, zC1, zC2] = zones;

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
    { name: 'Barrage Ouest Oran', type: 'dam', status: 'active', zoneId: zB2._id, capacity: 150_000_000, fillPercentage: 75 },
    { name: 'Barrage Beni Haroun', type: 'dam', status: 'active', zoneId: zC2._id, capacity: 960_000_000, fillPercentage: 68 },
  ]);

  console.log('✅  Database seeded successfully!');
  console.log(`   Wilayas: 58 | Communes: ${communeDocs.length} | Zones: ${zones.length} | Infrastructures: 12`);
}

module.exports = seed;

// ── Standalone run ─────────────────────────────────────────────
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hydrotrack';
  seed(MONGODB_URI).then(() => mongoose.disconnect());
}
