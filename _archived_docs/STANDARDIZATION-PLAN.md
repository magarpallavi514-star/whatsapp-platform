# 🔧 STANDARDIZATION PLAN: Single Source of Truth for accountId

## Current Mixed State ❌

```
Account Model:
  ├─ Account._id = ObjectId (MongoDB primary key)
  └─ Account.accountId = String (user-facing like "pixels_internal")

Database Models:
  ├─ PhoneNumber.accountId = Mixed (supports both)
  ├─ Conversation.accountId = Mixed (supports both)
  ├─ Message.accountId = Mixed (NOW - but was String)
  ├─ Subscription.accountId = ObjectId ✅
  ├─ Payment.accountId = ObjectId ✅
  ├─ Invoice.accountId = ObjectId ✅
  ├─ Template.accountId = ObjectId ✅
  └─ Broadcast.accountId = ObjectId ✅

Controllers/Services:
  ├─ jwtAuth: Sets req.accountId = String
  ├─ jwtAuth: Sets req.account._id = ObjectId ✅
  ├─ messageController: Uses req.account._id (now ObjectId) ✅
  ├─ phoneNumberHelper: Uses req.account._id (now ObjectId) ✅
  ├─ whatsappService: Uses accountId parameter (mixed format)
  ├─ webhookController: Uses phoneConfig.accountId (Mixed)
  └─ settingsController: Looks up account._id then queries
```

---

## Decision: Use ObjectId as Single Source of Truth

**Why ObjectId?**
1. ✅ MongoDB native format (no conversion needed)
2. ✅ Unique across entire system
3. ✅ Already used in Subscription, Payment, Invoice (5/8 models)
4. ✅ Direct reference to Account._id
5. ✅ No ambiguity (24-char hex string is always ObjectId)

**String accountId Usage:**
- ❌ Do NOT use for database queries
- ✅ Use ONLY for:
  - User-facing display (dashboard shows "pixels_internal")
  - JWT tokens (compact payload)
  - External APIs
  - Logging/debugging

---

## Standardization Steps

### Step 1: Update All Models to Store ObjectId

**Files to Update:**
1. [x] Message.js - Change accountId from Mixed → ObjectId
2. [x] PhoneNumber.js - Change accountId from Mixed → ObjectId  
3. [x] Conversation.js - Change accountId from Mixed → ObjectId

**Format:**
```javascript
accountId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Account',
  required: true,
  index: true
}
```

### Step 2: Update All Controllers to Use ObjectId

**Files to Update:**
1. messageController.js - Pass req.account._id (already done ✅)
2. phoneNumberHelper.js - Use req.account._id (already done ✅)
3. conversationController.js - Use req.account._id for queries
4. settingsController.js - Use req.account._id for queries
5. broadcastController.js - Use req.account._id for queries
6. webhookController.js - Convert STRING→ObjectId after lookup

### Step 3: Update All Services to Accept ObjectId

**Files to Update:**
1. whatsappService.js - Always expect ObjectId for accountId parameter
2. broadcastExecutionService.js - Always expect ObjectId for accountId

### Step 4: Database Migration (if needed)

For existing data with STRING accountId in PhoneNumber/Conversation/Message:
- Add migration script to convert STRING → ObjectId
- Or add .pre('find') hooks to handle both formats

---

## Mapping Table: What Each Component Should Use

| Component | What to Use | Example |
|-----------|------------|---------|
| **JWT Token** | Account.accountId (STRING) | `{ accountId: "pixels_internal", ... }` |
| **req.accountId** | Account.accountId (STRING) from JWT | `"pixels_internal"` |
| **req.account._id** | Account._id (ObjectId) | `ObjectId("695a15a5...")` |
| **Database Queries** | Account._id (ObjectId) | `{ accountId: ObjectId(...) }` |
| **DB Storage** | ObjectId | `accountId: ObjectId(...)` |
| **User Display** | Account.accountId (STRING) | Show "pixels_internal" in UI |
| **Logging** | Both (helpful for debugging) | `"Account: pixels_internal (695a15a5...)"` |

---

## Files That Need Changes

### PHASE 1: Models (Type Definitions)
- [ ] PhoneNumber.js - Change Mixed → ObjectId
- [ ] Conversation.js - Change Mixed → ObjectId  
- [ ] Message.js - Already changed to Mixed, now change to ObjectId

### PHASE 2: Controllers (Request Handling)
- [ ] conversationController.js - Use req.account._id for all queries
- [ ] settingsController.js - Use req.account._id for lookups
- [ ] broadcastController.js - Use req.account._id
- [ ] contactController.js - Use req.account._id
- [ ] templateController.js - Use req.account._id

### PHASE 3: Services (Business Logic)
- [ ] whatsappService.js - Document that accountId is always ObjectId
- [ ] broadcastExecutionService.js - Use ObjectId for queries
- [ ] webhookController.js - Convert STRING→ObjectId from phoneConfig

### PHASE 4: Migration
- [ ] Create migration for existing STRING data (if any)
- [ ] Add pre-hooks for backward compatibility

---

## Code Changes Needed

### Example 1: Controller
```javascript
// ❌ OLD
const accountId = req.accountId;  // STRING
const result = await Model.find({ accountId });

// ✅ NEW
const accountId = req.account._id;  // ObjectId
const result = await Model.find({ accountId });
```

### Example 2: Service Method
```javascript
// ❌ OLD - Accept mixed type
async sendMessage(accountId, ...) {
  // accountId could be STRING or ObjectId
  let queryId = accountId;
  if (typeof accountId === 'string' && /^[a-f0-9]{24}$/.test(accountId)) {
    queryId = new ObjectId(accountId);
  }
}

// ✅ NEW - Always ObjectId
async sendMessage(accountId, ...) {
  // accountId is ALWAYS ObjectId
  // No conversion needed
  const config = await PhoneNumber.findOne({ accountId });
}
```

### Example 3: Webhook
```javascript
// ❌ OLD - Mixed from DB
const accountId = phoneConfig.accountId;  // Could be STRING or ObjectId
const conversationId = `${accountId}_${phoneNumberId}_${phone}`;

// ✅ NEW - Normalize to ObjectId
const accountId = phoneConfig.accountId;  // Should be ObjectId
if (typeof accountId === 'string') {
  accountId = new ObjectId(accountId);
}
const conversationId = `${accountId.toString()}_${phoneNumberId}_${phone}`;
```

---

## Testing Checklist

After standardization:

- [ ] Send message from Superadmin → Success
- [ ] Send message from Enromatics → Success
- [ ] Load conversations → Shows all messages
- [ ] Create broadcast → Works
- [ ] Add phone number → Works
- [ ] Get templates → Works
- [ ] Update settings → Works
- [ ] All queries use ObjectId → No STRING issues

---

## Benefits of This Standardization

✅ **Consistency** - One format everywhere
✅ **Performance** - No STRING→ObjectId conversions needed
✅ **Clarity** - No ambiguity about data types
✅ **Maintainability** - Easy to understand code
✅ **Scalability** - No mixed-type confusion as system grows
✅ **Debugging** - Clear what format is expected

---

## Implementation Order

1. **Quick Wins (No Breaking Changes):**
   - Update Model schemas (Message, PhoneNumber, Conversation)
   - Update Controllers to use req.account._id
   - Test thoroughly

2. **Data Migration (If Needed):**
   - Check if existing data has STRING accountId
   - Create migration script to convert
   - Run migration

3. **Final Verification:**
   - Test all workflows
   - Check logs for any issues
   - Confirm no 500 errors

---

## Current Status

✅ Already using ObjectId:
- Subscription.accountId
- Payment.accountId
- Invoice.accountId
- Template.accountId
- Broadcast.accountId
- req.account._id in jwtAuth
- messageController (just fixed)
- phoneNumberHelper (just fixed)

⏳ Still needs update:
- PhoneNumber.accountId (Mixed → ObjectId)
- Conversation.accountId (Mixed → ObjectId)
- Message.accountId (Mixed → ObjectId)
- Other controllers using req.accountId instead of req.account._id
- Services accepting mixed accountId parameter
