import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'whatsapp-platform-jwt-key';

async function diagnoseAndFix() {
  try {
    await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // 1. Check all accounts
    console.log('📊 ALL ACCOUNTS IN DATABASE:\n');
    const accounts = await Account.find({}).select('_id accountId name email type plan');
    
    if (accounts.length === 0) {
      console.log('❌ NO ACCOUNTS FOUND! Database is empty.\n');
    } else {
      console.log(`Found ${accounts.length} account(s):\n`);
      accounts.forEach((acc, i) => {
        console.log(`${i+1}. ${acc.name || 'N/A'}`);
        console.log(`   _id: ${acc._id}`);
        console.log(`   accountId: ${acc.accountId || '⚠️  MISSING!'}`);
        console.log(`   email: ${acc.email}`);
        console.log(`   type: ${acc.type}`);
        console.log(`   plan: ${acc.plan}`);
        console.log('');
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // 2. Check if pixels_internal exists
    console.log('🔍 CHECKING REQUIRED ACCOUNTS:\n');
    
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    if (superadmin) {
      console.log('✅ pixels_internal exists');
    } else {
      console.log('❌ pixels_internal MISSING - Creating it...');
      const newSuper = new Account({
        accountId: 'pixels_internal',
        name: 'Pixels Internal',
        email: 'admin@pixels.com',
        type: 'internal',
        plan: 'enterprise',
        status: 'active'
      });
      await newSuper.save();
      console.log('✅ Created pixels_internal');
    }
    
    console.log('');
    
    // 3. Check if Enromatics has accountId
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    if (enromatics) {
      if (enromatics.accountId) {
        console.log('✅ Enromatics has accountId:', enromatics.accountId);
      } else {
        console.log('⚠️  Enromatics missing accountId - Setting it...');
        enromatics.accountId = 'eno_2600003';
        await enromatics.save();
        console.log('✅ Updated Enromatics accountId to: eno_2600003');
      }
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // 4. Generate test tokens
    console.log('🔐 TEST TOKENS FOR API TESTING:\n');
    
    const allAccounts = await Account.find({}).select('accountId name email');
    
    allAccounts.forEach(acc => {
      if (acc.accountId) {
        const token = jwt.sign(
          { accountId: acc.accountId, email: acc.email, name: acc.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        console.log(`📧 ${acc.email}`);
        console.log(`   Account ID: ${acc.accountId}`);
        console.log(`   Name: ${acc.name}`);
        console.log(`   Token: ${token}\n`);
      }
    });
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ DIAGNOSIS COMPLETE\n');
    console.log('📝 TO TEST CHATBOTS API:');
    console.log('   curl http://localhost:5050/api/chatbots \\');
    console.log('     -H "Authorization: Bearer <TOKEN>" \\');
    console.log('     -H "Content-Type: application/json"');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

diagnoseAndFix();
