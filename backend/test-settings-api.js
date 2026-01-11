import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const accountSchema = new mongoose.Schema({}, { strict: false });
const phoneSchema = new mongoose.Schema({}, { strict: false });

const Account = mongoose.model('Account', accountSchema);
const Phone = mongoose.model('PhoneNumber', phoneSchema);

async function testSettingsApi() {
  try {
    console.log('\n🧪 TESTING SETTINGS API ENDPOINT\n');
    console.log('═'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);

    // Get superadmin account
    const superAdmin = await Account.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (!superAdmin) {
      console.log('❌ Superadmin account not found');
      process.exit(1);
    }

    console.log('✅ Superadmin Account Found:');
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.name}\n`);

    // Generate a test JWT token like the frontend would have
    const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-platform-jwt-secret-2026';
    const testToken = jwt.sign(
      {
        email: superAdmin.email,
        name: superAdmin.name,
        accountId: superAdmin._id.toString(),
        role: 'superadmin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated Test JWT Token:');
    console.log(`   Token: ${testToken.substring(0, 50)}...`);
    console.log(`   Valid: Yes\n`);

    // Simulate the API call the frontend makes
    console.log('📱 Simulating Settings API Call:');
    console.log(`   Endpoint: GET /api/settings/phone-numbers`);
    console.log(`   Auth: Bearer ${testToken.substring(0, 30)}...`);
    console.log(`   Account ID: ${superAdmin._id}\n`);

    // Query the database like the controller would
    const phoneNumbers = await Phone.find({ accountId: superAdmin._id.toString() })
      .select('-accessToken')
      .sort({ isActive: -1, createdAt: -1 })
      .lean();

    console.log('📊 API RESPONSE:\n');
    console.log(JSON.stringify(
      {
        success: true,
        phoneNumbers: phoneNumbers
      },
      null,
      2
    ));

    console.log('\n═'.repeat(70));
    console.log('\n📋 RESULT ANALYSIS:\n');

    if (phoneNumbers.length === 0) {
      console.log('❌ ISSUE: No phone numbers found for superadmin!');
      console.log('   Checking all phones in database...\n');
      const allPhones = await Phone.find({});
      console.log(`   Total phones in DB: ${allPhones.length}`);
      allPhones.forEach(p => {
        console.log(`   - ${p.phoneNumberId} → Account: ${p.accountId}`);
      });
    } else {
      console.log('✅ ISSUE RESOLVED: Phone numbers ARE being returned!');
      console.log(`   Count: ${phoneNumbers.length}`);
      console.log(`   Display Name: ${phoneNumbers[0].displayName}`);
      console.log(`   Phone: ${phoneNumbers[0].phone}`);
      console.log(`   Active: ${phoneNumbers[0].isActive}\n`);
      console.log('   The frontend SHOULD display these in the settings page.');
      console.log('   If it\'s not showing, the issue is with:');
      console.log('   1. Frontend not sending the JWT token');
      console.log('   2. Frontend not rendering the response');
      console.log('   3. Browser caching');
    }

    console.log('\n═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testSettingsApi();
