const mongoose = require('mongoose');
const User = require('./models/User'); // سنفترض أن اسم الموديل User
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing in .env');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('🌱 Connected to MongoDB...');

  const email = 'jamaleddinehedro@gmail.com';
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('⚠️ User already exists, updating password...');
    existingUser.password = hashedPassword;
    await existingUser.save();
  } else {
    await User.create({
      name: 'Admin DZ',
      email: email,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Admin user created successfully!');
  }

  await mongoose.disconnect();
}

createAdmin().catch(console.error);
