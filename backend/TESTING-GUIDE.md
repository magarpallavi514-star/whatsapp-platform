# 🧪 MANUAL TESTING GUIDE - PHASE 2B

## 📋 Prerequisites

1. **Terminal 1**: Keep server running
2. **Terminal 2**: Run tests from here

---

## 🚀 STEP 1: START SERVER (Terminal 1)

```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform/backend
npm run dev
```

**Wait for:**
```
✅ MongoDB Connected Successfully!
🚀 Server is running on port 5050
```

---

## 🧪 STEP 2: RUN TESTS (Terminal 2)

Open a **new terminal window** and run:

```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform/backend
./quick-test.sh
```

**OR run tests individually:**

### Test 1: Health Check ✅
```bash
curl http://localhost:5050/health
```

**Expected:**
```json
{
  "status": "OK",
  "message": "Server is healthy",
  "uptime": 123.45
}
```

---

### Test 2: Existing API Key Works (Hashed) ✅
```bash
curl -X GET "http://localhost:5050/api/stats" \
  -H "Authorization: Bearer wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29"
```

**Expected:**
```json
{
  "success": true,
  "stats": { ... }
}
```

**This proves hashing works!** The same key works, but now it's stored as a hash.

---

### Test 3: Create Enromatics Account ✅
```bash
curl -X POST "http://localhost:5050/api/admin/accounts" \
  -H "Authorization: Bearer wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "enromatics",
    "name": "Enromatics",
    "email": "tech@enromatics.com",
    "type": "client",
    "plan": "professional"
  }'
```

**Expected:**
```json
{
  "success": true,
  "account": {
    "accountId": "enromatics",
    "name": "Enromatics",
    "apiKeyPrefix": "wpk_live_abc"
  },
  "apiKey": "wpk_live_<64_random_chars>",
  "warning": "⚠️ Store this key securely. It will not be shown again."
}
```

**💾 SAVE THE apiKey!** You'll need it for next tests.

---

### Test 4: List All Accounts ✅
```bash
curl -X GET "http://localhost:5050/api/admin/accounts" \
  -H "Authorization: Bearer wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0"
```

**Expected:**
```json
{
  "success": true,
  "accounts": [
    {
      "accountId": "pixels_internal",
      "name": "Pixels Agency",
      "apiKeyPrefix": "wpk_live_6f6"
    },
    {
      "accountId": "enromatics",
      "name": "Enromatics",
      "apiKeyPrefix": "wpk_live_abc"
    }
  ],
  "pagination": { "total": 2, "hasMore": false }
}
```

---

### Test 5: Get Specific Account ✅
```bash
curl -X GET "http://localhost:5050/api/admin/accounts/enromatics" \
  -H "Authorization: Bearer wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0"
```

**Expected:**
```json
{
  "success": true,
  "account": {
    "accountId": "enromatics",
    "name": "Enromatics",
    "email": "tech@enromatics.com",
    "type": "client",
    "plan": "professional",
    "status": "active",
    "apiKeyPrefix": "wpk_live_abc"
  },
  "phoneNumbers": []
}
```

---

### Test 6: Enromatics Uses Their API Key ✅
```bash
# Replace <ENROMATICS_KEY> with the key from Test 3
curl -X GET "http://localhost:5050/api/stats" \
  -H "Authorization: Bearer <ENROMATICS_KEY>"
```

**Expected:**
```json
{
  "success": true,
  "stats": { ... }
}
```

**This proves tenant isolation!** Enromatics can only see their data.

---

### Test 7: Regenerate API Key ✅
```bash
curl -X POST "http://localhost:5050/api/admin/accounts/enromatics/api-key/regenerate" \
  -H "Authorization: Bearer wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0"
```

**Expected:**
```json
{
  "success": true,
  "apiKey": "wpk_live_<NEW_64_chars>",
  "warning": "⚠️ Old API key is now invalid."
}
```

**Now test old key is invalid:**
```bash
# Use the OLD key from Test 3
curl -X GET "http://localhost:5050/api/stats" \
  -H "Authorization: Bearer <OLD_ENROMATICS_KEY>"
```

**Expected:**
```json
{
  "success": false,
  "message": "Invalid or expired API key"
}
```

**And test new key works:**
```bash
# Use the NEW key from regenerate
curl -X GET "http://localhost:5050/api/stats" \
  -H "Authorization: Bearer <NEW_ENROMATICS_KEY>"
```

**Expected:**
```json
{
  "success": true,
  "stats": { ... }
}
```

---

### Test 8: Self-Service - Get Own Account ✅
```bash
curl -X GET "http://localhost:5050/api/account/me" \
  -H "Authorization: Bearer wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29"
```

**Expected:**
```json
{
  "success": true,
  "account": {
    "accountId": "pixels_internal",
    "name": "Pixels Agency",
    "apiKeyPrefix": "wpk_live_6f6"
  },
  "phoneNumbers": [ ... ]
}
```

---

### Test 9: Security - Admin Endpoint Without Auth ❌
```bash
curl -X POST "http://localhost:5050/api/admin/accounts" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"hacker","name":"Hacker"}'
```

**Expected:**
```json
{
  "success": false,
  "message": "Admin authentication required. Provide: Authorization: Bearer wpk_admin_..."
}
```

**Status Code:** 401 Unauthorized

---

### Test 10: Security - Invalid API Key ❌
```bash
curl -X GET "http://localhost:5050/api/stats" \
  -H "Authorization: Bearer wpk_live_FAKE_KEY_123"
```

**Expected:**
```json
{
  "success": false,
  "message": "Invalid or expired API key"
}
```

**Status Code:** 401 Unauthorized

---

## ✅ SUCCESS CRITERIA

All tests should:
- ✅ Return expected JSON responses
- ✅ Show proper authentication (401 when missing/invalid)
- ✅ Demonstrate tenant isolation
- ✅ Prove key rotation works
- ✅ Validate hashed keys work

---

## 🎯 WHAT WE'RE TESTING

1. **Hashed API Keys** - pixels_internal key still works
2. **Admin Account Creation** - Create accounts via API
3. **List/Get Accounts** - View all account details
4. **Tenant Isolation** - Each account only sees own data
5. **API Key Lifecycle** - Generate, rotate, validate
6. **Self-Service APIs** - Account owners manage themselves
7. **Security** - Endpoints properly protected

---

## 📊 EXPECTED RESULTS

After all tests:

- ✅ 2 accounts exist (pixels_internal + enromatics)
- ✅ Both have working API keys
- ✅ Keys are hashed in database (secure)
- ✅ Tenant data is isolated
- ✅ Admin can manage all accounts
- ✅ Accounts can rotate own keys
- ✅ Old keys immediately invalid after rotation

---

## 🚀 NEXT STEP AFTER TESTING

Once all tests pass, we're ready for:

**PHASE 3: FRONTEND DASHBOARD** 🎨

Reply **"ALL TESTS PASSED"** and I'll start building the UI! 👊
