import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema, 'phonenumbers');

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const phones = await PhoneNumber.find({ accountId: 'mpiyush2727@gmail.com' });
    console.log('Phone numbers found:', phones.length);
    phones.forEach(p => {
      console.log(`\n📞 ${p.phoneNumberId}`);
      console.log(`   Display: ${p.displayPhone}`);
      console.log(`   Active: ${p.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();
