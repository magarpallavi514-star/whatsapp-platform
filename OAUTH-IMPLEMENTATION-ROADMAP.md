# 🚀 META EMBEDDED SIGNUP OAUTH - IMPLEMENTATION ROADMAP
**Status:** READY TO BUILD  
**Timeline:** 4 days  
**Team:** Backend + Frontend  
**Date:** 28 January 2026

---

## 📋 WHAT ALREADY EXISTS (DO NOT TOUCH)

### ✅ Backend Foundation (Keep As-Is)

**File:** [backend/src/models/PhoneNumber.js](backend/src/models/PhoneNumber.js)
```javascript
{
  accountId: String,          // ✅ Multi-tenant
  phoneNumberId: String,      // ✅ Ready for OAuth data
  wabaId: String,            // ✅ Webhook routing
  accessToken: String,       // ✅ Encrypted AES-256
  displayPhone: String,      // ✅ From Meta
  isActive: Boolean,         // ✅ Status tracking
  qualityRating: String,     // ✅ Meta metrics
  verifiedAt: Date           // ✅ Verification timestamp
}
```
**Status:** Perfect for OAuth data. No changes needed.

---

**File:** [backend/src/models/Account.js](backend/src/models/Account.js#L60)
```javascript
wabaId: {
  type: String,
  index: true,
  sparse: true
}
```
**Status:** Ready. Webhook routing uses this.

---

### ✅ API Endpoint (Keep As-Is)

**File:** [backend/src/controllers/settingsController.js](backend/src/controllers/settingsController.js#L76)
```
POST /api/settings/phone-numbers
```

**Current:** Accepts manual form data  
**Future:** Will receive OAuth data from backend

**Status:** Logic is correct. Will be called by OAuth endpoint.

---

### ✅ Webhook Handler (Keep As-Is)

**File:** [backend/src/controllers/webhookController.js](backend/src/controllers/webhookController.js)

```
POST /api/webhooks/whatsapp
GET /api/webhooks/whatsapp (verification)
```

**Current Flow:**
1. Meta sends: `{ entry.id = WABA ID, metadata.phone_number_id = Phone ID }`
2. We find Account by `wabaId`
3. We find PhoneNumber by `phoneNumberId + accountId`
4. We save message

**Status:** Works regardless of how phone number was added. No changes.

---

### ✅ Socket.io Real-Time (Keep As-Is)

**File:** [backend/src/services/socketService.js](backend/src/services/socketService.js)  
**File:** [frontend/app/dashboard/chat/page.tsx](frontend/app/dashboard/chat/page.tsx#L711)

**Status:** Real-time messaging works. Socket room join/leave logic in place. No changes.

---

### ✅ Frontend Settings Page (Keep As-Is Base)

**File:** [frontend/app/dashboard/settings/page.tsx](frontend/app/dashboard/settings/page.tsx)

**Current:** Shows phone numbers, manual add form  
**Future:** Will show OAuth status, Connect button

**Status:** Tab structure ready. Will be modified (not replaced).

---

## 🆕 WHAT TO BUILD (New Code Only)

### 🔵 PHASE 1: FRONTEND (2 days)

---

#### **Step 1A: WhatsApp Connection Status UI**

**Create:** `frontend/app/dashboard/settings/whatsapp-oauth/page.tsx`

**Show:**
```
Status: [ Not Connected | Connecting | Connected ]

If Connected:
  ✅ Business Name: "Your Business LLC"
  ✅ Phone Number: +1 (201) 555-0123
  ✅ Phone ID: 889344924259692
  ✅ Quality Rating: HIGH
  ✅ Last Verified: 2 hours ago
  
  [Reconnect Button] [Disconnect Button]

If Not Connected:
  ❌ WhatsApp not connected
  
  [Connect WhatsApp Button] → Redirects to Meta OAuth
```

**Data Fetch:**
```javascript
GET /api/integrations/whatsapp/status
```

**Reference:** [Current settings page structure](frontend/app/dashboard/settings/page.tsx#L750)

---

#### **Step 1B: Meta OAuth Redirect Button**

**Location:** WhatsApp connection status page

**Code Pattern:**
```typescript
const connectWhatsApp = () => {
  const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/integrations/whatsapp/callback`
  );
  const scope = encodeURIComponent(
    'whatsapp_business_management,whatsapp_business_messaging'
  );
  
  const metaOAuthUrl = 
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`;
  
  window.location.href = metaOAuthUrl;
};
```

**Store:** `META_APP_ID=2094709584392829` (already in .env)

---

#### **Step 1C: OAuth Callback Page**

**Create:** `frontend/app/integrations/whatsapp/callback/page.tsx`

**Responsibilities:**
1. Read `code` from URL params
2. Read `state` (security check)
3. Call backend: `POST /api/integrations/whatsapp/oauth`
4. Show: "Connecting to WhatsApp..."
5. On success: Redirect to `/dashboard/settings/whatsapp-oauth`
6. On error: Show error message

**Code Template:**
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function WhatsAppCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  
  useEffect(() => {
    const exchangeCode = async () => {
      const code = params.get('code')
      const state = params.get('state')
      
      if (!code) {
        router.push('/dashboard/settings/whatsapp-oauth?error=no_code')
        return
      }
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/integrations/whatsapp/oauth`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, state })
          }
        )
        
        if (response.ok) {
          router.push('/dashboard/settings/whatsapp-oauth?success=true')
        } else {
          router.push('/dashboard/settings/whatsapp-oauth?error=exchange_failed')
        }
      } catch (error) {
        router.push('/dashboard/settings/whatsapp-oauth?error=connection_error')
      }
    }
    
    exchangeCode()
  }, [])
  
  return <div>Connecting WhatsApp...</div>
}
```

---

### 🔵 PHASE 2: BACKEND (2 days)

---

#### **Step 2A: OAuth Exchange Endpoint**

**Create:** `backend/src/controllers/oauthController.js`

**Endpoint:**
```
POST /api/integrations/whatsapp/oauth
Headers: Authorization: Bearer {JWT}
Body: { code, state }
```

**Flow:**
```javascript
export const handleWhatsAppOAuth = async (req, res) => {
  try {
    const { code, state } = req.body
    const accountId = req.account.accountId
    
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/integrations/whatsapp/callback`,
        code
      }
    )
    
    const { access_token, user_id } = tokenResponse.data
    
    // 2. Verify token (debug_token)
    const debugResponse = await axios.get(
      `https://graph.facebook.com/v19.0/debug_token`,
      {
        params: {
          input_token: access_token,
          access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
        }
      }
    )
    
    // 3. Get client's businesses
    const businessResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${user_id}/businesses`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    // 4. Get WhatsApp Business Accounts
    const wabaResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${businessId}/whatsapp_business_accounts`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    const wabaId = wabaResponse.data.data[0].id
    
    // 5. Get phone numbers
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    // 6. Save each phone number
    for (const phone of phoneResponse.data.data) {
      const existing = await PhoneNumber.findOne({
        accountId,
        phoneNumberId: phone.id
      })
      
      if (!existing) {
        await PhoneNumber.create({
          accountId,
          phoneNumberId: phone.id,
          wabaId,
          accessToken, // Encrypted automatically
          displayPhone: phone.display_phone_number,
          displayName: phone.verified_name || 'WhatsApp Business',
          isActive: true
        })
      }
    }
    
    // 7. Update Account
    await Account.findOneAndUpdate(
      { accountId },
      { wabaId }
    )
    
    // 8. Subscribe to webhooks
    await subscribeToWebhook(wabaId, access_token)
    
    // 9. Return success
    res.json({
      success: true,
      message: 'WhatsApp connected successfully',
      phoneNumbers: phoneResponse.data.data.length
    })
    
  } catch (error) {
    console.error('OAuth error:', error)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}
```

---

#### **Step 2B: OAuth Status Endpoint**

**Create:** In same `oauthController.js`

**Endpoint:**
```
GET /api/integrations/whatsapp/status
Headers: Authorization: Bearer {JWT}
```

**Response:**
```javascript
{
  success: true,
  connected: true,
  businessName: "Your Business LLC",
  phoneNumbers: [
    {
      id: "889344924259692",
      displayPhone: "+1 (201) 555-0123",
      displayName: "Customer Support",
      isActive: true,
      qualityRating: "HIGH",
      lastVerified: "2024-01-28T10:00:00Z"
    }
  ],
  lastConnected: "2024-01-28T09:00:00Z"
}
```

---

#### **Step 2C: Disconnect Endpoint**

**Create:** In same `oauthController.js`

**Endpoint:**
```
POST /api/integrations/whatsapp/disconnect
Headers: Authorization: Bearer {JWT}
```

**Logic:**
```javascript
export const disconnectWhatsApp = async (req, res) => {
  const accountId = req.account.accountId
  
  // Mark all phones inactive
  await PhoneNumber.updateMany(
    { accountId },
    { isActive: false }
  )
  
  // Clear WABA ID
  await Account.findOneAndUpdate(
    { accountId },
    { wabaId: null }
  )
  
  res.json({ success: true })
}
```

---

#### **Step 2D: Register Routes**

**Create:** `backend/src/routes/oauthRoutes.js`

```javascript
import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  handleWhatsAppOAuth,
  getWhatsAppStatus,
  disconnectWhatsApp
} from '../controllers/oauthController.js'

const router = express.Router()

router.post('/whatsapp/oauth', requireAuth, handleWhatsAppOAuth)
router.get('/whatsapp/status', requireAuth, getWhatsAppStatus)
router.post('/whatsapp/disconnect', requireAuth, disconnectWhatsApp)

export default router
```

**Mount in:** `backend/src/app.js`
```javascript
import oauthRoutes from './routes/oauthRoutes.js'
app.use('/api/integrations', oauthRoutes)
```

---

## 🧹 CLEANUP (What to Remove)

### Remove from Frontend:

- ❌ `/dashboard/settings/whatsapp-setup` (manual form page)
- ❌ Manual credential form UI
- ❌ "Copy from Meta" instructions

### Keep in Frontend:

- ✅ Settings page (main dashboard)
- ✅ All other tabs (profile, API keys, etc.)

---

## 🔍 REFERENCES TO EXISTING CODE

### Backend Patterns to Follow:

**For API calls to Meta:** [whatsappService.js](backend/src/services/whatsappService.js#L804)
```javascript
const response = await axios.get(`${GRAPH_API_URL}/${phoneNumberId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
  timeout: 10000
})
```

**For encryption:** [PhoneNumber.js](backend/src/models/PhoneNumber.js#L24)
```javascript
accessToken: {
  type: String,
  set: function(token) {
    const algorithm = 'aes-256-cbc'
    const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32)
    // ... encryption logic already here
  }
}
```

**For webhook subscription:** [webhookController.js](backend/src/controllers/webhookController.js)
```javascript
// Already knows how to subscribe WABA to webhooks
```

---

### Frontend Patterns to Follow:

**For Auth headers:** [settings/page.tsx](frontend/app/dashboard/settings/page.tsx#L750)
```typescript
const token = authService.getToken()
const response = await fetch(`${API_URL}/settings/phone-numbers`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

**For redirects:** [checkout/page.tsx](frontend/app/checkout/page.tsx)
```typescript
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/payment-success')
```

---

## ✅ EXECUTION CHECKLIST

### Frontend Tasks
- [ ] Create `frontend/app/dashboard/settings/whatsapp-oauth/page.tsx`
- [ ] Add Meta OAuth redirect button
- [ ] Create `frontend/app/integrations/whatsapp/callback/page.tsx`
- [ ] Add `NEXT_PUBLIC_META_APP_ID` to `.env.local`
- [ ] Test OAuth flow locally
- [ ] Add success/error messages
- [ ] Update navigation (remove manual flow)

### Backend Tasks
- [ ] Create `backend/src/controllers/oauthController.js`
- [ ] Create `backend/src/routes/oauthRoutes.js`
- [ ] Add 3 endpoints (oauth, status, disconnect)
- [ ] Test with Meta sandbox
- [ ] Verify webhook subscription logic
- [ ] Test phone number fetch + save
- [ ] Error handling + validation

### Testing Tasks
- [ ] Test with Meta test account
- [ ] Test with real Meta business account
- [ ] Test multiple phone numbers
- [ ] Test reconnect after disconnect
- [ ] Test webhook still works
- [ ] Test real-time chat after OAuth connect

### Deployment Tasks
- [ ] Add `META_APP_ID` + `META_APP_SECRET` to Railway .env
- [ ] Update Vercel `.env`
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify in production

---

## 🚀 AFTER IMPLEMENTATION

**You can:**
1. ✅ Onboard unlimited clients via OAuth (no manual support)
2. ✅ Remove all "copy from Meta" docs
3. ✅ Apply for Meta App Review (professional OAuth flow)
4. ✅ Sell as standalone WhatsApp platform
5. ✅ Bundle with Enromatics as white-label
6. ✅ Scale without Meta confusion

---

## 📞 REFERENCE DOCS

**For team:**
- [Meta Embedded Signup Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/embedded-signup)
- [Current Architecture Analysis](CLIENT-ONBOARDING-ARCHITECTURE-ANALYSIS.md)
- [Stable Version Info](VERSION-STABLE-1.2.0.md)

---

## 💪 FINAL CONFIDENCE CHECK

✅ **Your existing code is correct.** No refactoring needed.  
✅ **Database schema supports OAuth.** No migrations needed.  
✅ **Webhook logic works.** No changes needed.  
✅ **Real-time chat works.** No changes needed.  

🔵 **Just add:** OAuth layer (UI + backend glue)  
🔵 **Timeline:** 4 days to production  
🔵 **Effort:** Medium (new code, not refactoring)  

---

**Status:** READY TO BUILD 🚀
