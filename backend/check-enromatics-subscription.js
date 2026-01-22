import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const accountSchema = new mongoose.Schema({
  name: String,
  email: String,
  type: String,
  accountId: String
});

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: String,
  accountId: mongoose.Schema.Types.ObjectId,
  status: String,
  planId: mongoose.Schema.Types.ObjectId
});

const Account = mongoose.model('Account', accountSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    console.log('📱 Enromatics Account:');
    console.log('  ID (_id):', enromatics?._id);
    console.log('  accountId:', enromatics?.accountId);
    console.log('  Type:', enromatics?.type);
    console.log('  Name:', enromatics?.name);
    
    if (enromatics) {
      const sub = await Subscription.findOne({ accountId: enromatics._id });
      console.log('\n✅ Subscription Check:');
      console.log('  Found:', !!sub);
      if (sub) {
        console.log('  Status:', sub.status);
        console.log('  Subscription ID:', sub.subscriptionId);
      } else {
        console.log('  ❌ No subscription found!');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
