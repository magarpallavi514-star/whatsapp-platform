import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const accountSchema = new mongoose.Schema({}, { collection: 'accounts', strict: false })
const subscriptionSchema = new mongoose.Schema({}, { collection: 'subscriptions', strict: false })
const paymentSchema = new mongoose.Schema({}, { collection: 'payments', strict: false })
const messageSchema = new mongoose.Schema({}, { collection: 'messages', strict: false })
const conversationSchema = new mongoose.Schema({}, { collection: 'conversations', strict: false })
const contactSchema = new mongoose.Schema({}, { collection: 'contacts', strict: false })

const Account = mongoose.model('Account', accountSchema)
const Subscription = mongoose.model('Subscription', subscriptionSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const Message = mongoose.model('Message', messageSchema)
const Conversation = mongoose.model('Conversation', conversationSchema)
const Contact = mongoose.model('Contact', contactSchema)

async function deleteUsers() {
  const conn = await mongoose.connect(process.env.MONGODB_URI)
  
  const emailsToDelete = [
    'piyushmagar4p@gmail.com',
    'pixelsadvertise@gmail.com',
    'newtechfidner20@gmaol.com'
  ]
  
  console.log('\n🗑️  === DELETING USERS ===\n')
  
  for (const email of emailsToDelete) {
    try {
      const account = await Account.findOne({ email })
      
      if (!account) {
        console.log(`⚠️  ${email} - NOT FOUND`)
        continue
      }
      
      console.log(`🗑️  Deleting ${email}...`)
      
      // Delete all related data
      await Subscription.deleteMany({ accountId: account._id })
      await Payment.deleteMany({ accountId: account._id })
      await Message.deleteMany({ accountId: account._id })
      await Conversation.deleteMany({ accountId: account._id })
      await Contact.deleteMany({ accountId: account._id })
      await Account.deleteOne({ _id: account._id })
      
      console.log(`✅ DELETED: ${email}\n`)
    } catch (error) {
      console.error(`❌ Error deleting ${email}:`, error.message)
    }
  }
  
  console.log('='.repeat(60))
  console.log('✅ All specified users deleted\n')
  
  process.exit(0)
}

setTimeout(() => {
  console.log('Timeout')
  process.exit(1)
}, 10000)

deleteUsers().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})
