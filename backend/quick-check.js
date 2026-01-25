import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('keywordrules');
    const bots = await collection.find({ accountId: 'eno_2600003' }).toArray();
    console.log('🤖 Chatbots for Enromatics (eno_2600003):', bots.length);
    if (bots.length > 0) {
      bots.forEach(bot => console.log(`   ✅ ${bot.name} (Keywords: ${bot.keywords.join(', ')})`));
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
