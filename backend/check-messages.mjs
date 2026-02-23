import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function checkMessages() {
  try {
    console.log('\n📊 ========== CHECKING SAVED MESSAGES ==========\n')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    console.log('📁 Collections in database:')
    collections.forEach(c => console.log(`   - ${c.name}`))
    console.log('')

    // Check messages
    const messagesCollection = db.collection('messages')
    const messageCount = await messagesCollection.countDocuments()
    console.log(`📬 Messages collection: ${messageCount} total messages`)
    
    if (messageCount > 0) {
      const latestMessages = await messagesCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
      
      console.log('\n📨 Latest 5 messages:')
      latestMessages.forEach((msg, i) => {
        console.log(`\n  [${i+1}] ${msg.type || 'unknown'} message`)
        console.log(`      From: ${msg.from}`)
        console.log(`      Phone ID: ${msg.phoneNumberId}`)
        console.log(`      Account ID: ${msg.accountId}`)
        console.log(`      Time: ${msg.timestamp}`)
        if (msg.type === 'text') {
          console.log(`      Content: ${msg.content?.text?.body || msg.content}`)
        }
      })
    } else {
      console.log('❌ No messages found in database')
      console.log('\nPossible reasons:')
      console.log('1. No one has sent a message to your WhatsApp number yet')
      console.log('2. Messages are being received but not saved to DB')
      console.log('3. Webhook is not configured correctly')
    }

    // Check conversations
    console.log('\n')
    const convCollection = db.collection('conversations')
    const convCount = await convCollection.countDocuments()
    console.log(`💬 Conversations collection: ${convCount} total conversations`)
    
    if (convCount > 0) {
      const latestConvs = await convCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray()
      
      console.log('\n📲 Latest conversations:')
      latestConvs.forEach((conv, i) => {
        console.log(`\n  [${i+1}] ${conv.userPhone}`)
        console.log(`      Messages: ${conv.messageCount || 0}`)
        console.log(`      Status: ${conv.status}`)
      })
    }

    console.log('')
    await mongoose.connection.close()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkMessages()
