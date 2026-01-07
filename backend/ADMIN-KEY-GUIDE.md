# 🔐 ADMIN KEY MANAGEMENT GUIDE

## Overview

The platform uses **TWO types of API keys**:

1. **Admin Key** - Pixels team uses this to manage the platform
2. **Tenant Keys** - Each customer gets their own API key

---

## 🔑 Generate Admin Key (One-Time Setup)

**Step 1: Generate the admin key**
```bash
cd backend
node generate-admin-key.js
```

**Step 2: Save the output**
You'll get:
```
ADMIN_API_KEY_HASH="c8a3f09c77a80d6ffdeb721f38f29532360597a765bade1a39e7e3f4be1ec675"
wpk_admin_54e732cc81f3ce3ed7be9c05984b932ec798b8566c193efec7cae082efc78949
```

**Step 3: Add hash to .env file**
```bash
# backend/.env
ADMIN_API_KEY_HASH="c8a3f09c77a80d6ffdeb721f38f29532360597a765bade1a39e7e3f4be1ec675"
```

**Step 4: Store the admin key securely**
- Save `wpk_admin_...` in your password manager (1Password, LastPass, etc.)
- **NEVER commit to git**
- Share only with authorized Pixels team members

**Step 5: Deploy to production**
```bash
# Update environment variable on Railway
ADMIN_API_KEY_HASH="c8a3f09c77a80d6ffdeb721f38f29532360597a765bade1a39e7e3f4be1ec675"
```

---

## 👥 Create Customer Account (Using Admin Key)

Once you have the admin key, use it to create customer accounts:

```bash
curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acme_corp",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "type": "client",
    "plan": "pro"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "account": {
    "accountId": "acme_corp",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "type": "client",
    "plan": "pro"
  },
  "apiKey": "wpk_live_abc123...",
  "warning": "⚠️ Store this API key securely. It will not be shown again."
}
```

**Give the tenant key** (`wpk_live_...`) to your customer!

---

## 🔄 Manage Customer Accounts

### List All Accounts
```bash
curl https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY"
```

### Get Specific Account
```bash
curl https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts/acme_corp \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY"
```

### Regenerate Customer's API Key
```bash
curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts/acme_corp/api-key/regenerate \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY"
```

### Update Account
```bash
curl -X PATCH https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts/acme_corp \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"plan": "enterprise", "status": "active"}'
```

### Delete Account
```bash
curl -X DELETE https://whatsapp-platform-production-e48b.up.railway.app/api/admin/accounts/acme_corp \
  -H "Authorization: Bearer wpk_admin_YOUR_ADMIN_KEY"
```

---

## 🎯 How Customers Use Their Keys

Once you create an account and give them their tenant key, they use it like this:

### Send WhatsApp Message
```javascript
fetch('https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wpk_live_THEIR_TENANT_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Hello from our app!'
  })
})
```

### Get Their Stats
```javascript
fetch('https://whatsapp-platform-production-e48b.up.railway.app/api/stats', {
  headers: {
    'Authorization': 'Bearer wpk_live_THEIR_TENANT_KEY'
  }
})
```

---

## 🔒 Security Best Practices

### Admin Key
- ✅ Store in password manager
- ✅ Never commit to git
- ✅ Use environment variables
- ✅ Rotate every 90 days
- ✅ Share only with authorized team
- ❌ Never send via email/slack unencrypted

### Tenant Keys
- ✅ Generate one per customer
- ✅ Give only to the customer who owns it
- ✅ Can regenerate if compromised
- ✅ Customer stores in their .env
- ✅ Monitor usage via `apiKeyLastUsedAt`

---

## 🚨 If Admin Key is Compromised

1. **Immediately generate new admin key:**
   ```bash
   node generate-admin-key.js
   ```

2. **Update .env and Railway:**
   ```bash
   ADMIN_API_KEY_HASH="NEW_HASH_HERE"
   ```

3. **Redeploy application**

4. **Notify team of the breach**

5. **Review account activity logs**

---

## 📊 Key Management Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. SUPERADMIN (You)                                 │
│    Runs: node generate-admin-key.js                 │
│    Gets: wpk_admin_xxx (PLATFORM ADMIN KEY)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. CREATE CUSTOMER ACCOUNT                          │
│    POST /api/admin/accounts                         │
│    Auth: Bearer wpk_admin_xxx                       │
│    Returns: wpk_live_yyy (TENANT KEY)              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. GIVE TO CUSTOMER                                 │
│    Customer gets: wpk_live_yyy                      │
│    Customer uses it to send messages                │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Quick Reference

| Key Type | Format | Who Has It | Purpose |
|----------|--------|------------|---------|
| Admin Key | `wpk_admin_...` | Pixels Team | Manage platform |
| Tenant Key | `wpk_live_...` | Each Customer | Send messages |

**Current Admin Key:** Check `backend/API_KEYS.md` (DO NOT COMMIT)
**Production URL:** `https://whatsapp-platform-production-e48b.up.railway.app`

---

Need help? Contact: tech@pixels.com
