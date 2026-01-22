import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not set')
  process.exit(1)
}

const start = async () => {
  const conn = await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  
  const accountCol = conn.connection.collection('accounts')
  const phoneCol = conn.connection.collection('phonenumbers')
  
  // Find by phone number
  const phoneRecord = await phoneCol.findOne({ 
    $or: [
      { displayPhoneNumber: '8087131777' },
      { displayPhoneNumber: '+918087131777' },
      { phoneNumberId: '8087131777' }
    ]
  })
  
  console.log('Phone Record Found:')
  console.log(JSON.stringify(phoneRecord, null, 2))
  
  if (phoneRecord?.accountId) {
    const account = await accountCol.findOne({ _id: new mongoose.Types.ObjectId(phoneRecord.accountId) })
    console.log('\nAccount:')
    console.log(JSON.stringify(account, null, 2))
  }
  
  process.exit(0)
}

setTimeout(() => {
  console.log('Timeout')
  process.exit(1)
}, 8000)

start().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})
