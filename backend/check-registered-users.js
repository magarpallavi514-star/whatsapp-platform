import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const accountSchema = new mongoose.Schema({}, { collection: 'accounts', strict: false })
const paymentSchema = new mongoose.Schema({}, { collection: 'payments', strict: false })
const subscriptionSchema = new mongoose.Schema({}, { collection: 'subscriptions', strict: false })

const Account = mongoose.model('Account', accountSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const Subscription = mongoose.model('Subscription', subscriptionSchema)

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    
    console.log('\n📊 === REGISTERED USERS & PLANS ===\n')
    
    // Get all accounts
    const accounts = await Account.find({}).lean()
    console.log(`✅ Total Registered Users: ${accounts.length}\n`)
    
    // Check each account
    for (const account of accounts) {
      console.log(`👤 ${account.name} (${account.email})`)
      console.log(`   Account ID: ${account.accountId || account._id}`)
      console.log(`   Plan: ${account.plan}`)
      console.log(`   Status: ${account.status}`)
      console.log(`   Created: ${account.createdAt?.toISOString().split('T')[0]}`)
      
      // Check payments
      const payments = await Payment.find({ accountId: account._id }).lean()
      if (payments.length > 0) {
        console.log(`   💳 Payments: ${payments.length}`)
        payments.forEach(p => {
          console.log(`      - ₹${p.amount} (${p.paymentGateway}) - ${p.status}`)
        })
      }
      
      // Check subscriptions
      const subs = await Subscription.findOne({ accountId: account._id }).lean()
      if (subs) {
        console.log(`   🎯 Subscription: ${subs.planId} (${subs.status})`)
      }
      
      console.log('')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

setTimeout(() => {
  console.log('Timeout - DB connection issue')
  process.exit(1)
}, 6000)

checkUsers()
