import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkDemoOrgs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).limit(20);
    console.log(`📊 Found ${users.length} users/organizations:\n`);
    
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name} (${user.email})`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Account ID: ${user.accountId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDemoOrgs();
