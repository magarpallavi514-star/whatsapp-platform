import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const phoneNumberSchema = new mongoose.Schema({
  accountId: String,
  phoneNumberId: String,
  wabaId: String,
  displayPhone: String,
  displayName: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'phonenumbers' })

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema)

async function checkPhones() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected')

    console.log('\n📱 Checking phone numbers for account 2600001...\n')
    
    const phones = await PhoneNumber.find({ accountId: '2600001' })
    
    console.log(`Found ${phones.length} phone number(s):\n`)
    
    phones.forEach((phone, i) => {
      console.log(`[${i+1}] ${phone.displayPhone}`)
      console.log(`    ID: ${phone.phoneNumberId}`)
      console.log(`    WABA: ${phone.wabaId}`)
      console.log(`    Active: ${phone.isActive}`)
      console.log(`    Created: ${phone.createdAt}`)
      console.log('')
    })

    if (phones.length === 0) {
      console.log('❌ No phone numbers found for account 2600001')
      console.log('\nAll accounts with phones:')
      const allPhones = await PhoneNumber.find({}).select('accountId displayPhone')
      allPhones.forEach(p => {
        console.log(`  - Account: ${p.accountId}, Phone: ${p.displayPhone}`)
      })
    }

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkPhones()
