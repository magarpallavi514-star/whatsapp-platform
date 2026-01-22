import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const accountSchema = new mongoose.Schema({}, { collection: 'accounts', strict: false })
const subscriptionSchema = new mongoose.Schema({}, { collection: 'subscriptions', strict: false })

const Account = mongoose.model('Account', accountSchema)
const Subscription = mongoose.model('Subscription', subscriptionSchema)

async function findUsers() {
  const conn = await mongoose.connect(process.env.MONGODB_URI)
  
  console.log('\n📊 === REGISTERED USERS ===\n')
  
  // Get all accounts
  const accounts = await Account.find({}).lean()
  console.log(`📝 Total Accounts: ${accounts.length}\n`)
  
  // Check each account
  let activeWithSubscription = 0
  let registeredNoSubscription = 0
  
  for (const acc of accounts) {
    const sub = await Subscription.findOne({ accountId: acc._id }).lean()
    
    const status = sub?.status === 'active' ? '✅ ACTIVE' : '❌ NO SUBSCRIPTION'
    const plan = acc.plan || 'free'
    const email = acc.email
    
    console.log(`👤 ${acc.name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Plan Selected: ${plan}`)
    console.log(`   Subscription: ${status}`)
    
    if (sub?.status === 'active') {
      console.log(`   Subscription Plan: ${sub.planId}`)
      console.log(`   Started: ${new Date(sub.startDate).toLocaleDateString()}`)
      activeWithSubscription++
    } else {
      registeredNoSubscription++
    }
    
    console.log('')
  }
  
  console.log('='.repeat(60))
  console.log('\n📊 SUMMARY:')
  console.log(`✅ Active Users (with subscription): ${activeWithSubscription}`)
  console.log(`❌ Registered but NO subscription: ${registeredNoSubscription}`)
  console.log(`�� Total: ${accounts.length}\n`)
  
  process.exit(0)
}

setTimeout(() => {
  console.log('Timeout')
  process.exit(1)
}, 8000)

findUsers().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})
