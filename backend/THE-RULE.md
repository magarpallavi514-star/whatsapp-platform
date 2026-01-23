# 🎯 THE SINGLE RULE - System-Wide ID Standard

## THE LAW (Non-negotiable)

```
├─ MongoDB _id (ObjectId) = INTERNAL PRIMARY KEY - used for ALL database queries
├─ accountId (String) = EXTERNAL IDENTIFIER - display only, never for queries
├─ JWT Token contains = accountId STRING for human reference
├─ req.account._id = ObjectId for database queries
└─ req.accountId = String for logging/display only
```

---

## ONE SIMPLE RULE

**ANYWHERE YOU QUERY DATABASE → USE req.account._id (ObjectId)**
**ANYWHERE YOU LOG/DISPLAY → USE req.account.accountId (String)**

---

## Current System State

| Component | Current | Broken? | Fix |
|-----------|---------|---------|-----|
| JWT Token | Contains ObjectId ❌ | YES | Keep as-is (already fixed by tokens) |
| jwtAuth middleware | Sets req.account._id correctly ✅ | NO | Already correct |
| settingsController addPhoneNumber | Was querying by String ❌ | YES | Use req.account._id ✅ |
| getPhoneNumbers | Uses req.account.id ✅ | NO | Already works |
| PhoneNumber.find({accountId}) | Queries with ObjectId ✅ | NO | Works now |
| accountController | Many findOne({accountId}) ❌ | YES | ALL need fixing |
| chatbotController | Queries with accountId ❌ | YES | Needs fixing |
| statsController | Queries with accountId ❌ | YES | Needs fixing |

---

## Files to Fix (Priority Order)

### CRITICAL (Used in main flow)
1. settingsController.js - Multiple findOne({accountId}) queries
2. accountController.js - Many places
3. phoneNumberHelper.js - If it still has issues

### HIGH (Used frequently)
4. subscriptionController.js - Payment/billing
5. chatbotController.js
6. integrationsController.js

### MEDIUM (Used less frequently)
7. statsController.js
8. templateController.js
9. broadcastController.js

### LOW (Edge cases)
10. organizationsController.js
11. Other controllers

---

## The Pattern (Copy-Paste This)

### BEFORE (❌ BROKEN)
```javascript
export const someFunction = async (req, res) => {
  try {
    // ❌ WRONG - accountId is String, query might use ObjectId
    const accountId = req.accountId;
    const account = await Account.findOne({ accountId });
    // Result: "Account not found"
```

### AFTER (✅ CORRECT)
```javascript
export const someFunction = async (req, res) => {
  try {
    // ✅ RIGHT - Always use _id for queries
    const accountId = req.account._id;
    
    // For display/logging only
    const displayAccountId = req.account.accountId;
    
    // ALL queries use _id
    const account = await Account.findById(accountId);
    const phones = await PhoneNumber.find({ accountId }); // Now uses ObjectId
    
    // Logging can show human-readable version
    console.log(`Processing for ${displayAccountId}`);
```

---

## Systematic Replacement Pattern

Find all `findOne({ accountId` and replace with:

```javascript
// OLD
const account = await Account.findOne({ accountId: req.accountId });

// NEW
const account = await Account.findById(req.account._id);
// OR if need to verify still valid:
const account = await Account.findById(req.account._id);
if (!account) return res.status(401).json({ message: 'Account not found' });
```

---

## Special Cases

### When you DON'T have req.account (webhooks, background jobs)
Pass the _id explicitly:
```javascript
// GOOD
await PhoneNumber.find({ accountId: account._id });

// BAD
await PhoneNumber.find({ accountId: account.accountId });
```

### When displaying to user
```javascript
console.log(`Account: ${req.account.accountId} (${req.account._id})`);
```

### When storing in DB
```javascript
// ALWAYS use ObjectId
const doc = await Model.create({
  accountId: req.account._id,  // ObjectId
  ...other fields
});
```

