import mongoose from 'mongoose';
import Account from './src/models/Account.js';

mongoose.connect('mongodb://localhost:27017/pixelswhatsapp').then(async () => {
  const result = await Account.deleteOne({ email: 'info@enromatics.com' });
  console.log('Deleted Account entries:', result.deletedCount);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
