import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function getToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const account = await Account.findById('6971e3a706837a5539992bee');
    if (!account) {
      console.error('Account not found');
      process.exit(1);
    }
    
    const token = jwt.sign(
      { 
        accountId: account._id, 
        email: account.email,
        role: account.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(token);
    
  } finally {
    await mongoose.connection.close();
  }
}

getToken();
