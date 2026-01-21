import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Counter from './src/models/Counter.js';

dotenv.config();

const migrateAccountIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate\n`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const currentAccountId = user.accountId;
      
      // Check if already in new format (7 digits starting with 20-29)
      if (typeof currentAccountId === 'string' && /^2[0-9]{6}$/.test(currentAccountId)) {
        console.log(`✅ ${user.name} - Already migrated (${currentAccountId})`);
        continue;
      }

      // Generate new account ID
      const counter = await Counter.findByIdAndUpdate(
        'account_id',
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const year = new Date().getFullYear();
      const yearSuffix = year.toString().slice(-2);
      const sequencePadded = String(counter.sequence).padStart(5, '0');
      const newAccountId = `${yearSuffix}${sequencePadded}`;

      // Update user
      user.accountId = newAccountId;
      await user.save();

      console.log(`🔄 ${user.name}`);
      console.log(`   Old ID: ${currentAccountId}`);
      console.log(`   New ID: ${newAccountId}\n`);
    }

    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

migrateAccountIds();
