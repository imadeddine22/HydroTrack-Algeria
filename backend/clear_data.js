const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hydrotrack';

async function clearData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB at', MONGODB_URI);

    // List of collections to clear
    const collections = [
      'infrastructures',
      'wilayainfrastructures',
      'readings',
      'alerts',
      'messages'
    ];

    for (const colName of collections) {
      const collection = mongoose.connection.collection(colName);
      const res = await collection.deleteMany({});
      console.log(`- Cleared ${res.deletedCount} items from "${colName}"`);
    }

    console.log('\n✅  All dynamic data cleared. Administrative data (Wilayas/Communes/Zones) preserved.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error clearing data:', err.message);
    process.exit(1);
  }
}

clearData();
