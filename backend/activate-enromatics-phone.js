import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const phoneSchema = new mongoose.Schema({}, { collection: 'phonenumbers', strict: false })
const PhoneNumber = mongoose.model('PhoneNumber', phoneSchema)

async function activate() {
  const conn = await mongoose.connect(process.env.MONGODB_URI)
  
  // Find Enromatics phone
  const phone = await PhoneNumber.findOne({ phoneNumberId: '1003427786179738' })
  
  if (!phone) {
    console.log('❌ Phone not found')
    process.exit(1)
  }
  
  console.log('📱 Found phone:')
  console.log('   - Number:', phone.displayPhone)
  console.log('   - Active:', phone.isActive)
  console.log('   - Account:', phone.accountId)
  
  if (!phone.isActive) {
    console.log('\n🔄 Activating phone...')
    await PhoneNumber.updateOne(
      { phoneNumberId: '1003427786179738' },
      { $set: { isActive: true } }
    )
    console.log('✅ Phone activated!')
  } else {
    console.log('\n✅ Phone already active')
  }
  
  process.exit(0)
}

activate().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})

setTimeout(() => process.exit(1), 5000)
