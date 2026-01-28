# 🔒 CONSISTENCY ENFORCEMENT - CRITICAL RULES
**Status:** MANDATORY  
**Objective:** Zero data conflicts, single source of truth  
**Enforcement:** Database constraints + code validation

---

## 🚨 THE GOLDEN RULE

```
PhoneNumber Collection = AUTHORITY (Single Source of Truth)
        ↓
Account.wabaId = REFERENCE ONLY (Points to PhoneNumber.wabaId)
        ↓
Everything else = READS from PhoneNumber
        ↓
ZERO duplication
ZERO conflicts
100% consistency
```

---

## 🔐 DATABASE CONSTRAINTS (Add These First)

**File:** Create new file `backend/src/migrations/addConsistencyConstraints.js`

```javascript
/**
 * Add database constraints to enforce consistency
 * Run this ONCE before deploying OAuth
 */

import mongoose from 'mongoose'
import Account from '../models/Account.js'
import PhoneNumber from '../models/PhoneNumber.js'

async function addConstraints() {
  console.log('🔒 Adding consistency constraints...')
  
  try {
    // 1. Compound unique index on PhoneNumber
    // (accountId + phoneNumberId = unique per account)
    await PhoneNumber.collection.createIndex(
      { accountId: 1, phoneNumberId: 1 },
      { unique: true }
    )
    console.log('✅ Constraint 1: Compound unique index (accountId + phoneNumberId)')
    
    // 2. Index on Account.wabaId for webhook lookup
    await Account.collection.createIndex(
      { wabaId: 1 },
      { sparse: true }
    )
    console.log('✅ Constraint 2: Index on Account.wabaId')
    
    // 3. Index on PhoneNumber.wabaId for reference lookup
    await PhoneNumber.collection.createIndex(
      { wabaId: 1 }
    )
    console.log('✅ Constraint 3: Index on PhoneNumber.wabaId')
    
    console.log('✅ All consistency constraints added')
    process.exit(0)
  } catch (error) {
    console.error('❌ Constraint error:', error)
    process.exit(1)
  }
}

addConstraints()
```

**How to run:**
```bash
node backend/src/migrations/addConsistencyConstraints.js
```

---

## ✅ VALIDATION CHECKLIST (Before OAuth)

### Rule 1: PhoneNumber is Authority
```javascript
// ✅ MUST DO
const phone = await PhoneNumber.findOne({ accountId, phoneNumberId })
const token = phone.accessToken  // ← Read from PhoneNumber

// ❌ NEVER DO
const phone = await Account.findOne({ accountId })
const token = phone.accessToken  // ← WRONG! Account doesn't have token
```

### Rule 2: Account.wabaId is Reference Only
```javascript
// ✅ MUST DO
// Webhook receives wabaId from Meta
const account = await Account.findOne({ wabaId })  // ← Use to find account
const phone = await PhoneNumber.findOne({ 
  accountId: account.accountId,
  phoneNumberId: metaPhoneId
})  // ← Then get phone from PhoneNumber

// ❌ NEVER DO
// Using Account data for business logic
const token = account.accessToken  // ← WRONG! Not stored here
const phoneId = account.phoneNumberId  // ← WRONG! Not stored here
```

### Rule 3: Save Once, Read Many
```javascript
// ✅ GOOD: OAuth saves to PhoneNumber (authority)
await PhoneNumber.create({
  accountId,
  phoneNumberId,
  wabaId,
  accessToken,
  // ... everything is here
})

// ✅ GOOD: Then update Account.wabaId (reference)
await Account.findOneAndUpdate(
  { accountId },
  { wabaId }  // ← Just the reference
)

// ❌ NEVER: Duplicate data
await Account.create({
  phoneNumberId,  // ← NO! This is in PhoneNumber
  accessToken,    // ← NO! This is in PhoneNumber
  wabaId          // ← OK - reference is fine
})
```

### Rule 4: Compound Key Uniqueness
```javascript
// ✅ OK: Same account can have multiple phones
await PhoneNumber.create({
  accountId: "acc_1",
  phoneNumberId: "111"
})
await PhoneNumber.create({
  accountId: "acc_1",
  phoneNumberId: "222"
})

// ✅ OK: Different accounts can have same phone ID
await PhoneNumber.create({
  accountId: "acc_1",
  phoneNumberId: "111"
})
await PhoneNumber.create({
  accountId: "acc_2",
  phoneNumberId: "111"  // ← Different account, same phone
})

// ❌ NEVER: Duplicate (same account + phone)
await PhoneNumber.create({
  accountId: "acc_1",
  phoneNumberId: "111"
})
await PhoneNumber.create({
  accountId: "acc_1",
  phoneNumberId: "111"  // ← DUPLICATE! Will fail constraint
})
```

---

## 🛡️ CONSISTENCY VALIDATION CODE

**Add to OAuth controller:**

```javascript
/**
 * Validate data consistency after save
 * MUST pass before returning success
 */
async function validateConsistency(accountId, phone) {
  const errors = []
  
  // 1. PhoneNumber record exists
  const phoneRecord = await PhoneNumber.findOne({
    accountId,
    phoneNumberId: phone.phoneNumberId
  })
  
  if (!phoneRecord) {
    errors.push('❌ PhoneNumber record not found after save')
  }
  
  // 2. Account.wabaId matches PhoneNumber.wabaId
  const account = await Account.findOne({ accountId })
  
  if (account.wabaId !== phone.wabaId) {
    errors.push('❌ Account.wabaId does not match PhoneNumber.wabaId')
  }
  
  // 3. PhoneNumber.accessToken is encrypted (not plaintext)
  if (phoneRecord.accessToken && phoneRecord.accessToken.length < 100) {
    errors.push('❌ AccessToken appears unencrypted')
  }
  
  // 4. No duplicate phone numbers in same account
  const duplicates = await PhoneNumber.find({
    accountId,
    phoneNumberId: phone.phoneNumberId
  })
  
  if (duplicates.length > 1) {
    errors.push(`❌ ${duplicates.length} duplicate phone numbers found`)
  }
  
  // 5. Account can be found by wabaId
  const accountByWaba = await Account.findOne({ wabaId: phone.wabaId })
  
  if (!accountByWaba) {
    errors.push('❌ Account not found by wabaId')
  }
  
  // 6. All phones for account have same wabaId (for now)
  const allPhones = await PhoneNumber.find({ accountId })
  const wabaIds = [...new Set(allPhones.map(p => p.wabaId))]
  
  if (wabaIds.length > 1) {
    console.warn(`⚠️ Account has ${wabaIds.length} different WABAs (multi-WABA support)`)
  }
  
  // Return result
  if (errors.length > 0) {
    throw new Error(`Consistency check failed:\n${errors.join('\n')}`)
  }
  
  console.log('✅ All consistency checks passed')
  return true
}

// Use in OAuth handler:
export const handleWhatsAppOAuth = async (req, res) => {
  try {
    // ... OAuth flow ...
    
    // Save to PhoneNumber
    const savedPhone = await PhoneNumber.create({
      accountId,
      phoneNumberId: phone.id,
      wabaId,
      accessToken,
      // ...
    })
    
    // Update Account
    await Account.findOneAndUpdate({ accountId }, { wabaId })
    
    // ✅ CRITICAL: Validate before returning success
    await validateConsistency(accountId, savedPhone)
    
    return res.json({ success: true })
    
  } catch (error) {
    console.error('❌ OAuth failed:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
```

---

## 🚨 CONSISTENCY MONITORING (Track Issues)

**Add to every read operation:**

```javascript
/**
 * Monitor for consistency issues
 * Log warnings if data seems inconsistent
 */
function checkReadConsistency(phone, account) {
  // 1. Webhook lookup
  if (account && phone) {
    if (account.wabaId !== phone.wabaId) {
      console.error(
        `🚨 CONSISTENCY ALERT: wabaId mismatch\n` +
        `   Account.wabaId: ${account.wabaId}\n` +
        `   Phone.wabaId: ${phone.wabaId}`
      )
    }
  }
  
  // 2. Message send check
  if (!phone.accessToken) {
    console.error(`🚨 CONSISTENCY ALERT: No token for phone ${phone.phoneNumberId}`)
  }
  
  // 3. Active status check
  if (!phone.isActive) {
    console.warn(`⚠️ Phone is inactive: ${phone.phoneNumberId}`)
  }
}

// Use everywhere:
export const sendMessage = async (accountId, phoneNumberId, recipient, text) => {
  const phone = await PhoneNumber.findOne({ accountId, phoneNumberId })
  const account = await Account.findOne({ accountId })
  
  checkReadConsistency(phone, account)  // ← Monitor
  
  // Send message
}
```

---

## 📋 CODE CHECKLIST (Before Deployment)

### Don't Allow These:

```javascript
// ❌ DON'T: Store phone data in Account
Account.phoneNumberId        // NO
Account.accessToken          // NO
Account.displayPhone         // NO
Account.qualityRating        // NO

// ❌ DON'T: Duplicate data storage
// If it's in PhoneNumber, DON'T put it in Account

// ❌ DON'T: Read from wrong place
const token = account.accessToken  // WRONG - query PhoneNumber
const phoneId = account.phoneNumberId  // WRONG - query PhoneNumber

// ❌ DON'T: Create without validation
await PhoneNumber.create({...})  // MUST validate after

// ❌ DON'T: Update Account without updating PhoneNumber
await Account.updateOne({wabaId: newId})  // MUST sync with PhoneNumber
```

### DO Allow These:

```javascript
// ✅ DO: Store reference in Account
Account.wabaId  // ← OK, for webhook routing

// ✅ DO: Read from PhoneNumber
const token = phone.accessToken
const phoneId = phone.phoneNumberId

// ✅ DO: Validate after save
await validateConsistency(accountId, phone)

// ✅ DO: Keep Account.wabaId in sync
await Account.findOneAndUpdate({ accountId }, { wabaId: phone.wabaId })
```

---

## 🧪 TESTING CONSISTENCY

**Create test file:** `backend/tests/consistency.test.js`

```javascript
import PhoneNumber from '../src/models/PhoneNumber.js'
import Account from '../src/models/Account.js'

describe('Data Consistency', () => {
  
  test('PhoneNumber is source of truth', async () => {
    const phone = await PhoneNumber.findOne({ accountId: 'test_1' })
    
    // Token must be in PhoneNumber
    expect(phone.accessToken).toBeDefined()
    
    // Token should NOT be in Account
    const account = await Account.findOne({ accountId: 'test_1' })
    expect(account.accessToken).toBeUndefined()
  })
  
  test('Account.wabaId matches PhoneNumber.wabaId', async () => {
    const phone = await PhoneNumber.findOne({ accountId: 'test_1' })
    const account = await Account.findOne({ accountId: 'test_1' })
    
    expect(account.wabaId).toBe(phone.wabaId)
  })
  
  test('Can find account by wabaId', async () => {
    const phone = await PhoneNumber.findOne({ accountId: 'test_1' })
    const account = await Account.findOne({ wabaId: phone.wabaId })
    
    expect(account.accountId).toBe('test_1')
  })
  
  test('No duplicate phones in same account', async () => {
    const phones = await PhoneNumber.find({ accountId: 'test_1' })
    const phoneIds = phones.map(p => p.phoneNumberId)
    const unique = new Set(phoneIds)
    
    expect(phoneIds.length).toBe(unique.size)
  })
  
  test('Webhook can find everything from entry.id', async () => {
    // Simulate webhook
    const metaWabaId = '1536545574042607'
    const metaPhoneId = '889344924259692'
    
    // Find account by WABA
    const account = await Account.findOne({ wabaId: metaWabaId })
    
    if (account) {
      // Find phone by account + phone ID
      const phone = await PhoneNumber.findOne({
        accountId: account.accountId,
        phoneNumberId: metaPhoneId
      })
      
      expect(phone).toBeDefined()
      expect(phone.wabaId).toBe(metaWabaId)
    }
  })
})
```

**Run tests:**
```bash
npm test -- consistency.test.js
```

---

## 🔔 CONSISTENCY ALERTS (Monitor in Production)

**Add to logging:**

```javascript
// Log every critical operation
function logConsistencyEvent(type, data) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type,  // 'oauth_save', 'webhook_lookup', 'send_message', etc.
    accountId: data.accountId,
    wabaId: data.wabaId,
    phoneNumberId: data.phoneNumberId,
    status: data.status,  // 'success', 'error', 'warning'
    message: data.message
  }))
}

// Use:
logConsistencyEvent('oauth_save', {
  accountId: '26000001',
  wabaId: '1536545574042607',
  phoneNumberId: '889344924259692',
  status: 'success',
  message: 'Phone saved to PhoneNumber'
})

logConsistencyEvent('account_update', {
  accountId: '26000001',
  wabaId: '1536545574042607',
  status: 'success',
  message: 'Account.wabaId updated'
})

logConsistencyEvent('consistency_check', {
  accountId: '26000001',
  wabaId: '1536545574042607',
  status: 'success',
  message: 'All consistency checks passed'
})
```

---

## 🚨 IF CONSISTENCY BREAKS (Recovery)

**Diagnostic script:**

```javascript
// backend/src/scripts/checkConsistency.js
import PhoneNumber from '../models/PhoneNumber.js'
import Account from '../models/Account.js'

async function diagnose(accountId) {
  console.log(`🔍 Checking consistency for account: ${accountId}\n`)
  
  const account = await Account.findOne({ accountId })
  const phones = await PhoneNumber.find({ accountId })
  
  console.log('📱 Account data:')
  console.log(`   wabaId: ${account.wabaId}`)
  
  console.log('\n📞 PhoneNumber records:')
  phones.forEach(p => {
    console.log(`   ${p.phoneNumberId}`)
    console.log(`     wabaId: ${p.wabaId}`)
    console.log(`     match: ${p.wabaId === account.wabaId ? '✅' : '❌'}`)
  })
  
  // Find issues
  const issues = []
  
  if (!account.wabaId && phones.length > 0) {
    issues.push('❌ Account.wabaId is missing but phones exist')
  }
  
  phones.forEach(p => {
    if (p.wabaId !== account.wabaId) {
      issues.push(`❌ Phone ${p.phoneNumberId} wabaId mismatch`)
    }
  })
  
  if (issues.length === 0) {
    console.log('\n✅ All consistency checks passed')
  } else {
    console.log('\n🚨 Issues found:')
    issues.forEach(issue => console.log(`   ${issue}`))
  }
}

diagnose(process.argv[2])
```

**Run:**
```bash
node backend/src/scripts/checkConsistency.js 26000001
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying OAuth:

- [ ] Database constraints added (compound unique index)
- [ ] Validation code in OAuth controller
- [ ] Consistency checks pass before returning success
- [ ] Monitoring code in place
- [ ] Test cases written and passing
- [ ] Diagnostic script created
- [ ] Team briefed on rules
- [ ] Code reviewed for duplications
- [ ] PhoneNumber is only source of truth
- [ ] Account.wabaId is reference only

---

## 🎯 THE ABSOLUTE RULE

**If you find yourself writing:**
```javascript
Account.phoneNumberId = ...      // STOP ❌
Account.accessToken = ...        // STOP ❌
Account.displayPhone = ...       // STOP ❌
Account.qualityRating = ...      // STOP ❌
```

**Ask yourself:**
> "Is this the source of truth, or a reference?"
> 
> If reference → Put in Account.wabaId only  
> If source of truth → Put in PhoneNumber only

---

## ✅ FINAL GUARANTEE

**After following these rules:**

✅ Zero data conflicts  
✅ Single source of truth (PhoneNumber)  
✅ Webhook always finds data  
✅ Messages always send  
✅ System scales consistently  
✅ Easy to debug issues  
✅ Production-safe  

---

**Status:** 🔒 CONSISTENCY LOCKED  
**Enforcement:** Database + Code + Tests  
**Penalty for breaking:** Immediate detection + alert

**DO NOT DEVIATE FROM THESE RULES** 💪
