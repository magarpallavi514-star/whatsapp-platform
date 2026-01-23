import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// Define PhoneNumber schema
const phoneNumberSchema = new mongoose.Schema({
  accountId: { type: String, required: true, index: true },
  phoneNumberId: { type: String, required: true },
  wabaId: { type: String, required: true },
  displayPhone: { type: String },
  displayName: { type: String },
  isActive: { type: Boolean, default: false },
  qualityRating: { type: String },
  verifiedName: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  messageCount: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    received: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastTestedAt: { type: Date }
}, { collection: 'phonenumbers' });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

async function deleteAllWaba() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 Finding all WABA records...');
    const records = await PhoneNumber.find({});
    console.log(`Found ${records.length} phone number records:\n`);
    
    records.forEach((phone, i) => {
      console.log(`[${i+1}] Phone: ${phone.displayPhone || phone.phoneNumberId}`);
      console.log(`    Account: ${phone.accountId}`);
      console.log(`    WABA: ${phone.wabaId}`);
      console.log(`    Active: ${phone.isActive}`);
    });

    console.log('\n⚠️  Deleting all WABA records...');
    const result = await PhoneNumber.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} phone number records`);

    console.log('\n✨ All WABA records cleared! Users can now reconnect via Settings UI.\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllWaba();
