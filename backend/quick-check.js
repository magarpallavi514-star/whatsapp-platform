import db from './src/config/database.js'
import Account from './src/models/Account.js'
import PhoneNumber from './src/models/PhoneNumber.js'

async function check() {
  try {
    const enromatics = await Account.findOne({ email: { $regex: 'enromatics', $options: 'i' } })
    if (enromatics) {
      console.log('✅ Enromatics Account found:', enromatics.email, enromatics._id)
      const phones = await PhoneNumber.find({ accountId: enromatics._id })
      console.log('Phones:', phones.length, 'records')
      phones.forEach(p => console.log(`  - ${p.phoneNumberId}: ${p.displayPhoneNumber} (active: ${p.isActive})`))
    } else {
      console.log('❌ Enromatics not found')
    }
    process.exit(0)
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

setTimeout(() => {
  console.log('⏱️ Timeout')
  process.exit(1)
}, 5000)

check()
