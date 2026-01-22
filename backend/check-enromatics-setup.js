import mongoose from 'mongoose'
import Account from './src/models/Account.js'
import PhoneNumber from './src/models/PhoneNumber.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform'

async function check() {
  try {
    await mongoose.connect(MONGODB_URI)
    
    // Find Enromatics account
    const enromatics = await Account.findOne({ email: /enromatics/i })
    console.log('\n�� Enromatics Account:')
    console.log(JSON.stringify(enromatics, null, 2))
    
    // Find all phone numbers for this account
    if (enromatics) {
      const phones = await PhoneNumber.find({ accountId: enromatics._id }).select('-accessToken')
      console.log('\n📞 Phone Numbers for Enromatics:')
      console.log(JSON.stringify(phones, null, 2))
    }
    
    // Also check for account 2600003
    const account2600003 = await Account.findOne({ accountId: '2600003' })
    if (account2600003) {
      console.log('\n📱 Account 2600003:')
      console.log(JSON.stringify(account2600003, null, 2))
      
      const phones2600003 = await PhoneNumber.find({ accountId: account2600003._id }).select('-accessToken')
      console.log('\n📞 Phone Numbers for Account 2600003:')
      console.log(JSON.stringify(phones2600003, null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

check()
