require('dotenv').config();
const mongoose = require('mongoose');
const WilayaInfrastructure = require('./models/WilayaInfrastructure');

async function clearWilayaInfra() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected to MongoDB Atlas');

  const result = await WilayaInfrastructure.deleteMany({});
  console.log(`🗑️  Deleted ${result.deletedCount} infrastructure record(s)`);

  await mongoose.disconnect();
  console.log('✅  Done. Database is now clean and ready for real data.');
}

clearWilayaInfra().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
