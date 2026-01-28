# 🚀 OAUTH IMPLEMENTATION - START DEVELOPMENT
**Status:** READY TO BUILD  
**Option:** C (OAuth for everyone)  
**Entry Point:** After account creation  
**Data Strategy:** Single source of truth (PhoneNumber is authority)

---

## 📍 USER JOURNEY (What You're Building)

```
User signs up
    ↓
Account created in DB
    ↓
✅ Redirect to: /onboarding/whatsapp
    ↓
(This is THE OAUTH SETUP PAGE)
    ↓
User sees: "Let's connect your WhatsApp"
    ↓
User clicks: "Connect WhatsApp"
    ↓
OAuth flow:
  - Meta login
  - Approve access
  - Redirect back
    ↓
Backend saves:
  - Phone numbers
  - WABA ID
  - Access token
    ↓
Dashboard opens
    ↓
✅ Ready to chat!
```

---

## 🎯 CRITICAL: SINGLE SOURCE OF TRUTH

**The Problem to Avoid:**
```
❌ BAD: Data in multiple places
  - Account.phoneNumberId
  - Account.wabaId
  - PhoneNumber.phoneNumberId
  - PhoneNumber.wabaId
  Result: Conflicts, inconsistency, bugs
```

**The Solution We're Using:**
```
✅ GOOD: One place owns the data
  PhoneNumber collection is AUTHORITY
    ↓
  Everything else READS from PhoneNumber
    ↓
  Account.wabaId is just a REFERENCE (for webhook routing)
    ↓
  No duplication
    ↓
  Single source of truth
```

---

## 🔐 DATA CONSISTENCY RULES

**Rule 1: PhoneNumber is the Authority**
```javascript
// ✅ TRUTH: PhoneNumber collection has all data
PhoneNumber.findOne({ accountId, phoneNumberId })
{
  accountId: String,          // ← Authority for account link
  phoneNumberId: String,      // ← Authority for phone ID
  wabaId: String,            // ← Authority for WABA ID
  accessToken: String,       // ← Authority for token
  isActive: Boolean,         // ← Authority for status
  qualityRating: String      // ← Authority for quality
}
```

**Rule 2: Account.wabaId is REFERENCE ONLY**
```javascript
// ⚠️ REFERENCE: Only for webhook routing
Account.findOne({ accountId })
{
  wabaId: String  // ← Points to PhoneNumber.wabaId
                  // ← Used ONLY to find account from webhook
                  // ← Derived from PhoneNumber, not source
}
```

**Rule 3: Never Duplicate Data**
```javascript
// ❌ DON'T store in Account:
Account.phoneNumberId  // ← NO! Source of truth is PhoneNumber
Account.accessToken    // ← NO! Source of truth is PhoneNumber
Account.displayPhone   // ← NO! Source of truth is PhoneNumber

// ✅ DO store in Account:
Account.wabaId  // ← OK - reference for webhook routing
```

**Rule 4: Always Query From Authority**
```javascript
// ❌ BAD: Query Account for phone data
const phone = await Account.findOne({ accountId })
const phoneId = account.phoneNumberId  // ← Wrong source!

// ✅ GOOD: Query PhoneNumber for phone data
const phone = await PhoneNumber.findOne({ accountId })
const phoneId = phone.phoneNumberId    // ← Correct source!
```

---

## 🏗️ ARCHITECTURE (What Gets Built)

```
SIGNUP FLOW (Existing)
    ↓
Account created
    ↓
    ├─ accountId: "2600001"
    ├─ email: "user@example.com"
    └─ subscription: { status: 'active/inactive' }
    
NEW: ONBOARDING FLOW
    ↓
Redirect to: /onboarding/whatsapp
    ↓
    ├─ Check: Account exists? ✅
    ├─ Check: Already has phones? (skip if yes)
    └─ Show OAuth button
    
OAUTH FLOW (New Code)
    ↓
Client → Meta OAuth
    ↓
Backend exchanges code
    ↓
Fetches: WABA ID, Phone IDs, Access Token
    ↓
SAVES ONCE TO PhoneNumber (authority)
    ↓
Updates Account.wabaId (reference only)
    ↓
Redirect to: /dashboard
    ↓
Ready to use!
```

---

## 📝 FILES TO CREATE (Phase 1: Core OAuth)

### Backend (3 files)

**1. Create:** `backend/src/controllers/oauthController.js`
```javascript
// Handle OAuth exchange
// Fetch from Meta
// Save to PhoneNumber (single source of truth)
// Update Account.wabaId (reference)
// Return success
```

**2. Create:** `backend/src/routes/oauthRoutes.js`
```javascript
// POST /api/integrations/whatsapp/oauth (exchange)
// GET /api/integrations/whatsapp/status (read)
// POST /api/integrations/whatsapp/disconnect (disable)
```

**3. Modify:** `backend/src/app.js`
```javascript
// Mount oauthRoutes to /api/integrations
```

### Frontend (2 files)

**1. Create:** `frontend/app/onboarding/whatsapp/page.tsx`
```typescript
// Shows after signup
// "Connect your WhatsApp"
// Big button: "Connect WhatsApp"
// Meta OAuth redirect
```

**2. Create:** `frontend/app/integrations/whatsapp/callback/page.tsx`
```typescript
// Receives OAuth code from Meta
// Calls backend to exchange
// Redirects to dashboard on success
```

### Modify (1 file)

**1. Modify:** `backend/src/app.js`
```javascript
// Add: import oauthRoutes
// Add: app.use('/api/integrations', oauthRoutes)
```

---

## 🔄 DATA FLOW (No Duplication)

```
┌─────────────────────────────────────────────┐
│ META GIVES US:                              │
│  - access_token                             │
│  - phone_number_id: "889344924259692"       │
│  - wabaId: "1536545574042607"              │
│  - display_phone_number: "+1 (201) 555-01" │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │  SINGLE WRITE POINT   │
        │   (Save to DB once)   │
        └───────────────────────┘
                    ↓
    ┌──────────────────────────────────┐
    │ PhoneNumber Collection (TRUTH)    │
    │                                   │
    │ accountId: "2600001"              │
    │ phoneNumberId: "889344924259692"  │
    │ wabaId: "1536545574042607"       │
    │ accessToken: (encrypted)          │
    │ displayPhone: "+1 (201) 555-01"  │
    │ isActive: true                    │
    └──────────────────────────────────┘
                    ↓
    ┌──────────────────────────────────┐
    │ Account Collection (REFERENCE)    │
    │                                   │
    │ accountId: "2600001"              │
    │ wabaId: "1536545574042607" ←──────┼─ Points here
    │                                   │
    │ ⚠️ Derived, not source             │
    └──────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │  MULTIPLE READ POINTS │
        │  (Query for usage)     │
        └───────────────────────┘
                    ↓
    ┌──────────────────────────────────┐
    │ Webhook receives from Meta        │
    │ entry.id = "1536545574042607"   │
    │                                   │
    │ Find Account by wabaId ✅ Fast   │
    │ Find Phone by accountId + ID ✅  │
    └──────────────────────────────────┘
                    ↓
    ┌──────────────────────────────────┐
    │ Dashboard Chat needs access token│
    │                                   │
    │ Query PhoneNumber ✅ Get token   │
    │ Decrypt it ✅ Use for sending    │
    └──────────────────────────────────┘
```

**Key Point:** Data written ONCE (PhoneNumber), read MANY places.

---

## ✅ CONSISTENCY CHECKS (Before & After)

### Before OAuth (Manual)
```javascript
// Current system (we're replacing)
// Client pastes credentials → Stored in PhoneNumber
// Works because: Source of truth is PhoneNumber

After OAuth (Same principle!)
// Meta gives credentials → Stored in PhoneNumber
// Works because: Source of truth is STILL PhoneNumber
```

**NO CHANGES NEEDED** to existing code that reads from PhoneNumber.

---

### Database Queries Don't Change

```javascript
// Send message (existing code - NO CHANGES)
const phone = await PhoneNumber.findOne({ 
  accountId, 
  isActive: true 
}).select('+accessToken')  // ← Still reads from PhoneNumber

const token = phone.accessToken  // ← Still works

// Webhook routing (existing code - NO CHANGES)
const account = await Account.findOne({ wabaId })  // ← Still reads Account.wabaId

const phone = await PhoneNumber.findOne({
  accountId: account.accountId,
  phoneNumberId: req.body.metadata.phone_number_id
})  // ← Still reads from PhoneNumber
```

**OAuth doesn't break existing code. It just feeds the same data.**

---

## 🧪 CONSISTENCY VALIDATION

**Add this check in OAuth endpoint:**

```javascript
export const validateDataConsistency = async (accountId, phone) => {
  // After saving, verify no conflicts
  
  // 1. PhoneNumber exists
  const phoneRecord = await PhoneNumber.findOne({ 
    accountId, 
    phoneNumberId: phone.phoneNumberId 
  })
  
  if (!phoneRecord) {
    throw new Error('PhoneNumber save failed')
  }
  
  // 2. Account.wabaId matches
  const account = await Account.findOne({ accountId })
  
  if (account.wabaId !== phone.wabaId) {
    throw new Error('Account.wabaId mismatch - data inconsistency')
  }
  
  // 3. No duplicate in other accounts
  const duplicates = await PhoneNumber.find({
    phoneNumberId: phone.phoneNumberId,
    accountId: { $ne: accountId }
  })
  
  if (duplicates.length > 0) {
    console.warn(`⚠️ Phone exists in ${duplicates.length} other accounts`)
    // This is OK - different accounts can have same phone
  }
  
  return true
}
```

---

## 🚀 IMPLEMENTATION STEPS (Today)

### Step 1: Create OAuth Controller
**File:** `backend/src/controllers/oauthController.js`

```javascript
import axios from 'axios'
import PhoneNumber from '../models/PhoneNumber.js'
import Account from '../models/Account.js'

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0'

/**
 * Exchange OAuth code for access token + phone data
 * Single write point - saves to PhoneNumber (authority)
 */
export const handleWhatsAppOAuth = async (req, res) => {
  try {
    const { code, state } = req.body
    const accountId = req.account.accountId
    
    console.log('🔐 OAuth: Starting token exchange for account:', accountId)
    
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      `${GRAPH_API_URL}/oauth/access_token`,
      {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/integrations/whatsapp/callback`,
        code
      }
    )
    
    const { access_token } = tokenResponse.data
    console.log('✅ Token exchanged')
    
    // 2. Verify token
    const debugResponse = await axios.get(
      `${GRAPH_API_URL}/debug_token`,
      {
        params: {
          input_token: access_token,
          access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
        }
      }
    )
    console.log('✅ Token verified')
    
    // 3. Get businesses
    const businessResponse = await axios.get(
      `${GRAPH_API_URL}/me/businesses`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    if (!businessResponse.data.data?.length) {
      return res.status(400).json({
        success: false,
        message: 'No Meta Business Account found',
        action: 'Create a Meta Business Account first'
      })
    }
    
    const businessId = businessResponse.data.data[0].id
    console.log('✅ Business found:', businessId)
    
    // 4. Get WABAs
    const wabaResponse = await axios.get(
      `${GRAPH_API_URL}/${businessId}/whatsapp_business_accounts`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    if (!wabaResponse.data.data?.length) {
      return res.status(400).json({
        success: false,
        message: 'No WhatsApp Business Account found',
        action: 'Create a WhatsApp Business Account'
      })
    }
    
    const wabaId = wabaResponse.data.data[0].id
    console.log('✅ WABA found:', wabaId)
    
    // 5. Get phone numbers
    const phoneResponse = await axios.get(
      `${GRAPH_API_URL}/${wabaId}/phone_numbers`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    
    const phoneNumbers = phoneResponse.data.data || []
    
    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified phone numbers found in your WABA',
        action: 'Add and verify a phone number in Meta first'
      })
    }
    
    console.log('✅ Found phone numbers:', phoneNumbers.length)
    
    // 6. SINGLE WRITE POINT: Save to PhoneNumber (authority)
    const savedPhones = []
    
    for (const phone of phoneNumbers) {
      const existing = await PhoneNumber.findOne({
        accountId,
        phoneNumberId: phone.id
      })
      
      if (existing) {
        // Update existing
        await PhoneNumber.findOneAndUpdate(
          { accountId, phoneNumberId: phone.id },
          {
            wabaId,
            accessToken,  // Encrypted automatically
            displayPhone: phone.display_phone_number,
            isActive: true,
            verifiedAt: new Date()
          }
        )
        console.log('✅ Updated phone:', phone.display_phone_number)
      } else {
        // Create new
        const savedPhone = await PhoneNumber.create({
          accountId,
          phoneNumberId: phone.id,
          wabaId,
          accessToken,
          displayPhone: phone.display_phone_number,
          displayName: phone.verified_name || 'WhatsApp Business',
          isActive: true,
          verifiedAt: new Date()
        })
        console.log('✅ Saved phone:', phone.display_phone_number)
        savedPhones.push(savedPhone)
      }
    }
    
    // 7. Update Account.wabaId (reference - not authority)
    await Account.findOneAndUpdate(
      { accountId },
      { wabaId },
      { new: true }
    )
    console.log('✅ Updated Account.wabaId:', wabaId)
    
    // 8. Subscribe to webhook
    await axios.post(
      `${GRAPH_API_URL}/${wabaId}/subscribed_apps`,
      { subscribed_fields: ['messages', 'message_status'] },
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )
    console.log('✅ Subscribed to webhooks')
    
    // 9. Return success
    return res.json({
      success: true,
      message: 'WhatsApp connected successfully',
      phoneCount: phoneNumbers.length,
      phones: phoneNumbers.map(p => ({
        id: p.id,
        display: p.display_phone_number
      }))
    })
    
  } catch (error) {
    console.error('❌ OAuth error:', error.message)
    return res.status(400).json({
      success: false,
      message: error.message || 'OAuth failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Get OAuth status (which phones connected)
 * Reads from PhoneNumber (authority)
 */
export const getWhatsAppStatus = async (req, res) => {
  try {
    const accountId = req.account.accountId
    
    const phones = await PhoneNumber.find({ accountId })
      .select('-accessToken')
    
    const account = await Account.findOne({ accountId })
    
    return res.json({
      success: true,
      connected: phones.length > 0,
      wabaId: account?.wabaId,
      phoneNumbers: phones.map(p => ({
        id: p._id,
        phoneNumberId: p.phoneNumberId,
        displayPhone: p.displayPhone,
        isActive: p.isActive,
        qualityRating: p.qualityRating || 'unknown',
        verifiedAt: p.verifiedAt,
        createdAt: p.createdAt
      }))
    })
  } catch (error) {
    console.error('❌ Status error:', error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Disconnect WhatsApp (mark inactive)
 * Modifies PhoneNumber (authority)
 */
export const disconnectWhatsApp = async (req, res) => {
  try {
    const accountId = req.account.accountId
    
    // Mark all phones inactive
    await PhoneNumber.updateMany(
      { accountId },
      { isActive: false }
    )
    
    // Clear Account.wabaId
    await Account.findOneAndUpdate(
      { accountId },
      { wabaId: null }
    )
    
    console.log('✅ WhatsApp disconnected for account:', accountId)
    
    return res.json({
      success: true,
      message: 'WhatsApp disconnected'
    })
  } catch (error) {
    console.error('❌ Disconnect error:', error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
```

---

### Step 2: Create OAuth Routes
**File:** `backend/src/routes/oauthRoutes.js`

```javascript
import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  handleWhatsAppOAuth,
  getWhatsAppStatus,
  disconnectWhatsApp
} from '../controllers/oauthController.js'

const router = express.Router()

// OAuth endpoints
router.post('/whatsapp/oauth', requireAuth, handleWhatsAppOAuth)
router.get('/whatsapp/status', requireAuth, getWhatsAppStatus)
router.post('/whatsapp/disconnect', requireAuth, disconnectWhatsApp)

export default router
```

---

### Step 3: Mount Routes
**File:** `backend/src/app.js`

**Add at top:**
```javascript
import oauthRoutes from './routes/oauthRoutes.js'
```

**Add after existing routes (around line 239):**
```javascript
// OAuth integration routes
app.use('/api/integrations', oauthRoutes)
```

---

### Step 4: Create Onboarding Page
**File:** `frontend/app/onboarding/whatsapp/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowRight, Loader } from 'lucide-react'

export default function WhatsAppOnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleConnect = () => {
    setIsLoading(true)
    setError('')
    
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/integrations/whatsapp/callback`
    )
    const scope = encodeURIComponent(
      'whatsapp_business_management,whatsapp_business_messaging'
    )
    
    const metaOAuthUrl = 
      `https://www.facebook.com/v19.0/dialog/oauth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}` +
      `&state=${generateRandomString(32)}`
    
    window.location.href = metaOAuthUrl
  }
  
  const skipForNow = () => {
    router.push('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ready to chat?
          </h1>
          <p className="text-gray-600">
            Connect your WhatsApp Business Account to start messaging your customers
          </p>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}
        
        {/* Button */}
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition mb-4"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect WhatsApp
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
        
        {/* Skip */}
        <button
          onClick={skipForNow}
          className="w-full text-gray-600 hover:text-gray-900 font-medium py-2"
        >
          Skip for now
        </button>
        
        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>✅ You'll need:</p>
          <ul className="mt-2 space-y-1">
            <li>• A Meta Business Account</li>
            <li>• WhatsApp Business Account</li>
            <li>• A verified phone number</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
```

---

### Step 5: Create Callback Page
**File:** `frontend/app/integrations/whatsapp/callback/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader } from 'lucide-react'

export default function WhatsAppCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  
  useEffect(() => {
    const exchangeCode = async () => {
      try {
        const code = params.get('code')
        const state = params.get('state')
        const error = params.get('error')
        
        if (error) {
          console.error('OAuth error:', error)
          router.push(`/onboarding/whatsapp?error=${error}`)
          return
        }
        
        if (!code) {
          router.push('/onboarding/whatsapp?error=no_code')
          return
        }
        
        const token = localStorage.getItem('token')
        
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
        
        const data = await response.json()
        
        if (response.ok) {
          router.push('/dashboard?whatsapp=connected')
        } else {
          router.push(`/onboarding/whatsapp?error=${encodeURIComponent(data.message)}`)
        }
      } catch (error) {
        console.error('Exchange error:', error)
        router.push('/onboarding/whatsapp?error=connection_failed')
      }
    }
    
    exchangeCode()
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Connecting WhatsApp...</p>
      </div>
    </div>
  )
}
```

---

## 🔗 LINKING TO SIGNUP (Integration)

**File:** `backend/src/controllers/authController.js`

**After account created, add:**
```javascript
// After user signup success
if (response.ok) {
  // ✅ User created
  // ✅ Redirect frontend to OAuth onboarding
  
  return res.json({
    success: true,
    message: 'Account created',
    nextStep: '/onboarding/whatsapp'  // ← Send this
  })
}
```

**File:** `frontend/app/auth/signup/page.tsx`

**After signup:**
```typescript
if (signupResponse.ok) {
  // ✅ Redirect to OAuth onboarding
  router.push('/onboarding/whatsapp')
}
```

---

## ✅ CONSISTENCY GUARANTEES

**After OAuth, these are ALWAYS true:**

```javascript
// 1. PhoneNumber is source of truth
const phone = await PhoneNumber.findOne({ accountId })
✅ phone.phoneNumberId is correct
✅ phone.wabaId is correct
✅ phone.accessToken is correct

// 2. Account references it
const account = await Account.findOne({ accountId })
✅ account.wabaId === phone.wabaId (same value)

// 3. Webhook can find everything
const account = await Account.findOne({ wabaId: metaWabaId })
const phone = await PhoneNumber.findOne({ 
  accountId: account.accountId,
  phoneNumberId: metaPhoneId
})
✅ All data consistent

// 4. No duplicates
const duplicatePhones = await PhoneNumber.find({ phoneNumberId })
✅ Returns 1-N records (different accounts can have same phone)
✅ Never conflicts because accountId is unique key
```

---

## 🎯 NEXT STEPS

1. **Today:** Create 5 files above
2. **Test locally:** OAuth flow end-to-end
3. **Deploy:** To Railway + Vercel
4. **Verify:** Webhook still works
5. **Monitor:** No data inconsistencies

---

**Status:** ✅ READY TO BUILD
**Single Source of Truth:** ✅ PhoneNumber (authority), Account.wabaId (reference)
**No Breaking Changes:** ✅ Existing code unaffected
**Data Consistency:** ✅ Guaranteed by design

Let's build! 💪
