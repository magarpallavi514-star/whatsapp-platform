# 📋 TEAM TASK BREAKDOWN - META OAUTH IMPLEMENTATION

**Project:** Client Onboarding via Meta Embedded Signup  
**Duration:** 4 days  
**Status:** Ready to assign

---

## 👥 TEAM ASSIGNMENTS

### Backend Developer
- **Lead:** OAuth Controller + Routes
- **Support:** Testing + deployment
- **Estimate:** 1.5 days

### Frontend Developer  
- **Lead:** OAuth Pages + UI
- **Support:** Testing + bug fixes
- **Estimate:** 1.5 days

### QA / Tester
- **Lead:** End-to-end testing
- **Support:** Sandbox validation
- **Estimate:** 1 day

---

## 🔵 BACKEND DEVELOPER TASKS

### Task 1: Create OAuth Controller
**File to create:** `backend/src/controllers/oauthController.js`

**Functions needed:**
1. `handleWhatsAppOAuth(req, res)` - Token exchange
2. `getWhatsAppStatus(req, res)` - Status check
3. `disconnectWhatsApp(req, res)` - Disconnect

**Reference:** [OAUTH-IMPLEMENTATION-ROADMAP.md](OAUTH-IMPLEMENTATION-ROADMAP.md) (Step 2A, 2B, 2C)

**Dependencies:**
```javascript
import axios from 'axios'
import PhoneNumber from '../models/PhoneNumber.js'
import Account from '../models/Account.js'
```

**Meta API endpoints:**
- `POST /oauth/access_token` - Exchange code
- `GET /debug_token` - Verify token
- `GET /businesses` - Get businesses
- `GET /whatsapp_business_accounts` - Get WABAs
- `GET /phone_numbers` - Get phones

**Time:** 4-5 hours

---

### Task 2: Create OAuth Routes
**File to create:** `backend/src/routes/oauthRoutes.js`

**Routes:**
```
POST /api/integrations/whatsapp/oauth
GET /api/integrations/whatsapp/status
POST /api/integrations/whatsapp/disconnect
```

**All require:** `requireAuth` middleware

**Reference:** Check existing routes pattern in [backend/src/routes/settingsRoutes.js](backend/src/routes/settingsRoutes.js)

**Time:** 1 hour

---

### Task 3: Mount Routes in App
**File to modify:** `backend/src/app.js`

**Add:**
```javascript
import oauthRoutes from './routes/oauthRoutes.js'
app.use('/api/integrations', oauthRoutes)
```

**Check:** Make sure it's AFTER auth middleware

**Time:** 15 minutes

---

### Task 4: Test Endpoints
**Tools:** Postman / Thunder Client

**Test cases:**
1. [ ] Exchange valid code → Get access token
2. [ ] Exchange invalid code → Error
3. [ ] Fetch WABAs successfully
4. [ ] Fetch phone numbers successfully
5. [ ] Save to PhoneNumber collection
6. [ ] Update Account.wabaId
7. [ ] Get status for connected account
8. [ ] Disconnect removes phone numbers
9. [ ] Error handling for network failures

**Reference:** [webhookController.js](backend/src/controllers/webhookController.js) for error patterns

**Time:** 3 hours

---

### Task 5: Webhook Subscription
**Inside:** `handleWhatsAppOAuth` function

**After phone save, call:**
```javascript
// Subscribe WABA to webhook
await axios.post(
  `https://graph.facebook.com/v19.0/${wabaId}/subscribed_apps`,
  {
    subscribed_fields: ['messages', 'message_status']
  },
  { headers: { 'Authorization': `Bearer ${access_token}` } }
)
```

**Time:** 1 hour

---

### Task 6: Environment Variables
**File:** `backend/.env`

**Verify present:**
```
✅ META_APP_ID=2094709584392829
✅ META_APP_SECRET=b74799186bb64571487423a924d1a3ca
✅ FRONTEND_URL=https://replysys.com (for redirect_uri)
```

**Add to Railway deployment vars:**
- Same 3 vars

**Time:** 15 minutes

---

### Task 7: Deploy to Railway
**Steps:**
1. Test locally (`npm run dev`)
2. `git add . && git commit && git push`
3. Railway auto-deploys
4. Verify logs: No errors

**Time:** 30 minutes

---

**Backend Total:** 10-11 hours (~1.5 days)

---

## 🟢 FRONTEND DEVELOPER TASKS

### Task 1: Create WhatsApp OAuth Status Page
**File to create:** `frontend/app/dashboard/settings/whatsapp-oauth/page.tsx`

**States to handle:**
1. Loading status
2. Not connected
3. Connecting
4. Connected (show phone details)
5. Error

**Show when connected:**
- Business name
- Phone numbers
- Quality rating
- Last verified date
- [Reconnect] [Disconnect] buttons

**Reference:** Check settings page structure at [frontend/app/dashboard/settings/page.tsx](frontend/app/dashboard/settings/page.tsx#L1)

**Time:** 3-4 hours

---

### Task 2: Create OAuth Redirect Button
**Location:** WhatsApp status page

**On click:**
```typescript
const connectWhatsApp = () => {
  const clientId = process.env.NEXT_PUBLIC_META_APP_ID
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/integrations/whatsapp/callback`
  )
  const scope = encodeURIComponent(
    'whatsapp_business_management,whatsapp_business_messaging'
  )
  const state = generateRandomString(32) // For security
  
  const metaOAuthUrl = 
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`
  
  window.location.href = metaOAuthUrl
}
```

**Reference:** [OAUTH-QUICK-REFERENCE.md](OAUTH-QUICK-REFERENCE.md)

**Time:** 1 hour

---

### Task 3: Create OAuth Callback Page
**File to create:** `frontend/app/integrations/whatsapp/callback/page.tsx`

**Functionality:**
1. Read `code` and `state` from URL
2. Call backend: `POST /api/integrations/whatsapp/oauth`
3. Show loader: "Connecting WhatsApp..."
4. On success: Redirect to `/dashboard/settings/whatsapp-oauth?success=true`
5. On error: Show error message

**Reference:** [OAUTH-IMPLEMENTATION-ROADMAP.md](OAUTH-IMPLEMENTATION-ROADMAP.md) (Step 1C - complete code template provided)

**Time:** 2 hours

---

### Task 4: Fetch OAuth Status
**Implement in:** WhatsApp status page

**API call:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/integrations/whatsapp/status`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)
```

**Handle response:**
- Show phone list
- Show quality rating
- Show last verified

**Reference:** [settings/page.tsx](frontend/app/dashboard/settings/page.tsx#L750) for auth header pattern

**Time:** 1.5 hours

---

### Task 5: Disconnect Button
**Add to:** Status page

**On click:**
```typescript
const disconnect = async () => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/integrations/whatsapp/disconnect`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  )
  // Refresh status
  fetchStatus()
}
```

**Time:** 1 hour

---

### Task 6: Environment Variables
**File:** `frontend/.env.local`

**Add:**
```
NEXT_PUBLIC_META_APP_ID=2094709584392829
NEXT_PUBLIC_API_URL=http://localhost:5050 (dev)
NEXT_PUBLIC_API_URL=https://whatsapp-platform-production-e48b.up.railway.app (prod)
```

**Time:** 15 minutes

---

### Task 7: Update Navigation
**File:** `frontend/app/dashboard/layout.tsx` or settings sidebar

**Change:**
- Remove: Manual WhatsApp setup link
- Add: OAuth status link
- Update labels

**Reference:** Current navigation setup

**Time:** 1 hour

---

### Task 8: Testing & Bug Fixes
**Test in:**
- Local dev environment
- Production after deploy

**Test cases:**
1. [ ] OAuth redirect works
2. [ ] Callback page receives code
3. [ ] Status shows connected
4. [ ] Shows phone details
5. [ ] Disconnect works
6. [ ] Reconnect works
7. [ ] Error messages display

**Time:** 2 hours

---

**Frontend Total:** 11-12 hours (~1.5-2 days)

---

## 🧪 QA / TESTER TASKS

### Task 1: Setup Test Accounts
**Where:** Meta App Dashboard

**Create:**
- [ ] Test Meta business account
- [ ] Test WABA
- [ ] 2-3 test phone numbers

**Time:** 30 minutes

---

### Task 2: End-to-End Testing
**Scenarios:**

#### Scenario 1: First-time OAuth
```
[ ] Click "Connect WhatsApp"
[ ] Redirect to Meta OAuth
[ ] Login with test account
[ ] Select WABA
[ ] Redirect back to app
[ ] Status shows "Connected"
[ ] Phone numbers appear
[ ] Quality rating shows
```

#### Scenario 2: Multiple Phone Numbers
```
[ ] Same user with 2 WABAs
[ ] OAuth flow complete
[ ] Both phone numbers saved
[ ] Both appear in UI
```

#### Scenario 3: Disconnect & Reconnect
```
[ ] Click "Disconnect"
[ ] Phone becomes inactive
[ ] Messages not sent (test)
[ ] Click "Connect" again
[ ] Reconnect successful
[ ] Phone becomes active
```

#### Scenario 4: Error Cases
```
[ ] Cancel OAuth flow → Error message
[ ] Network timeout → Error message
[ ] Invalid code → Error message
[ ] Invalid Meta account → Error message
```

**Reference:** [OAUTH-IMPLEMENTATION-ROADMAP.md](OAUTH-IMPLEMENTATION-ROADMAP.md) for expected behavior

**Time:** 4-5 hours

---

### Task 3: Integration Testing
**Test with real chat flow:**

After OAuth connect:
```
[ ] Send message from app → Arrives in WhatsApp
[ ] Receive message in WhatsApp → Appears in chat UI
[ ] Message status updates (sent → delivered → read)
[ ] Real-time socket.io updates work
```

**Reference:** [REALTIME-CHAT-FIX-GUIDE.md](REALTIME-CHAT-FIX-GUIDE.md)

**Time:** 3 hours

---

### Task 4: Performance Testing
**Check:**
- [ ] OAuth endpoint response time < 2 seconds
- [ ] Status endpoint response time < 1 second
- [ ] Phone number list fetches in < 0.5 seconds
- [ ] No memory leaks with repeated calls

**Tools:** Browser DevTools Network tab

**Time:** 2 hours

---

### Task 5: Browser Compatibility
**Test in:**
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile browsers

**Check:**
- [ ] OAuth redirect works
- [ ] Callback page loads
- [ ] Status page responsive
- [ ] Buttons clickable on mobile

**Time:** 2 hours

---

**QA Total:** 11-12 hours (~1.5 days)

---

## 📅 DAILY SCHEDULE

### Day 1 (Monday)
- **Backend:** Task 1-3 (OAuth controller + routes)
- **Frontend:** Task 1-2 (Status page + button)
- **Daily standup:** Confirm architecture questions

### Day 2 (Tuesday)
- **Backend:** Task 4-5 (Testing + webhooks)
- **Frontend:** Task 3-4 (Callback + status fetch)
- **QA:** Task 1 (Setup test accounts)

### Day 3 (Wednesday)
- **Backend:** Task 6-7 (Env vars + deploy)
- **Frontend:** Task 5-7 (Disconnect + navigation)
- **QA:** Task 2 (E2E testing)

### Day 4 (Thursday)
- **All:** Task final testing
- **QA:** Task 3-5 (Integration + performance)
- **All:** Production deployment
- **All:** Monitor logs

---

## ✅ DEFINITION OF DONE

### Backend
- [ ] All 3 endpoints working
- [ ] Error handling complete
- [ ] Deployed to Railway
- [ ] Logs show no errors
- [ ] QA can test

### Frontend
- [ ] All pages working
- [ ] OAuth flow end-to-end
- [ ] Mobile responsive
- [ ] Deployed to Vercel
- [ ] QA can test

### QA
- [ ] All test cases pass
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Ready for production

---

## 🚀 SIGN-OFF

When all tasks complete:

```
✅ Backend: OAuth controller + routes deployed
✅ Frontend: OAuth pages deployed
✅ QA: All tests passing
✅ Ready for: Client onboarding via OAuth
```

---

**Questions?** See [OAUTH-IMPLEMENTATION-ROADMAP.md](OAUTH-IMPLEMENTATION-ROADMAP.md)

**Ready to start?** Assign tasks above. 💪
