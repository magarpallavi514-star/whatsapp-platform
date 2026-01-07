import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const schema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', schema, 'phonenumbers');

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check for DELETED or INACTIVE phone numbers
    const all = await PhoneNumber.find({ accountId: 'mpiyush2727@gmail.com' });
    console.log(`\n📱 ALL records for mpiyush2727@gmail.com (including deleted/inactive):\n`);
    
    if (all.length === 0) {
      console.log('❌ ZERO records found - completely gone!');
      console.log('\nChecking if account appears in ANY collection...');
      
      const inAll = await PhoneNumber.find({ accountId: 'mpiyush2727@gmail.com' });
      console.log(`PhoneNumber collection: ${inAll.length} records`);
    } else {
      all.forEach(p => {
        console.log(`📞 ${p.phoneNumberId}`);
        console.log(`   Display: ${p.displayPhone}`);
        console.log(`   Active: ${p.isActive}`);
        console.log(`   Updated: ${p.updatedAt}`);
        console.log(`   Deleted At: ${p.deletedAt || 'N/A'}`);
      });
    }
    
    // Check if any webhooks are still pointing to old phone
    console.log('\n\n🔍 Checking all phone numbers to see if ANY exist...');
    const allPhones = await PhoneNumber.find({}).limit(3);
    console.log(`Sample phone records in DB: ${allPhones.length}`);
    allPhones.forEach(p => {
      console.log(`  - ${p.accountId}: ${p.displayPhone} (active: ${p.isActive})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};
main();
