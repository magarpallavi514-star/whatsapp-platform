import Account from './src/models/Account.js'
import Payment from './src/models/Payment.js'
import db from './src/config/database.js'

console.log('\n📊 === REGISTERED USERS & PLANS ===\n')

const accounts = await Account.find({}).lean()
console.log(`✅ Total Registered Users: ${accounts.length}\n`)

for (const acc of accounts) {
  console.log(`👤 ${acc.name} (${acc.email})`)
  console.log(`   Account ID: ${acc.accountId || acc._id}`)
  console.log(`   Plan: ${acc.plan}`)
  console.log(`   Status: ${acc.status}`)
  
  const payments = await Payment.find({ accountId: acc._id }).lean()
  if (payments.length > 0) {
    console.log(`   💳 Payments: ${payments.length}`)
    payments.forEach(p => {
      console.log(`      - ₹${p.amount} (${p.paymentGateway}) - ${p.status}`)
    })
  }
  
  console.log('')
}

process.exit(0)
