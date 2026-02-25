import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/pixels')
  
  try {
    await client.connect()
    const db = client.db('pixels')
    
    console.log('\n🔍 Checking Enromatics (info@enromatics.com)...\n')
    
    // Get account
    const account = await db.collection('accounts').findOne({ email: 'info@enromatics.com' })
    
    if (!account) {
      console.log('❌ Account not found')
      process.exit(1)
    }
    
    console.log('✅ Account Found:')
    console.log('  Email:', account.email)
    console.log('  Business ID:', account.businessId || '❌ NOT SET')
    console.log('  WABA ID:', account.wabaId || '❌ NOT SET')
    console.log('  MetaSync Status:', account.metaSync?.status || 'no status')
    console.log('  Last Webhook:', account.metaSync?.lastWebhookAt ? new Date(account.metaSync.lastWebhookAt).toISOString() : 'never')
    
    // Get phones
    const phones = await db.collection('phonenumbers').find({ accountId: account._id.toString() }).toArray()
    
    console.log('\n📱 Phone Numbers Connected:', phones.length)
    phones.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.displayPhone} (WABA: ${p.wabaId})`)
    })
    
    console.log('\n' + '='.repeat(50))
    if (!account.wabaId) {
      console.log('❌ STATUS: NOT CONNECTED - No WABA ID')
    } else if (phones.length === 0) {
      console.log('⚠️  STATUS: Partial - WABA set, but no phones')
    } else {
      console.log('✅ STATUS: CONNECTED - Ready!')
    }
    console.log('='.repeat(50) + '\n')
    
    await client.close()
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}).catch(console.error)
