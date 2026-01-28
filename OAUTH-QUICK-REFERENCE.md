# 📍 QUICK REFERENCE - WHAT EXISTS VS WHAT TO BUILD

**Use this to brief your team in 5 minutes**

---

## ✅ ALREADY EXISTS (Copy These Patterns)

| Component | File | Why Reference |
|-----------|------|----------------|
| **Phone model encryption** | [PhoneNumber.js](backend/src/models/PhoneNumber.js#L24) | OAuth token uses same AES-256 encryption |
| **Meta API calls** | [whatsappService.js](backend/src/services/whatsappService.js#L804) | Shows exact axios pattern for Meta Graph API |
| **Multi-tenant pattern** | [settingsController.js](backend/src/controllers/settingsController.js#L76) | OAuth must use same `accountId` isolation |
| **Webhook subscribe logic** | [webhookController.js](backend/src/controllers/webhookController.js) | Shows how to subscribe WABA to webhooks |
| **JWT auth middleware** | [app.js](backend/src/app.js) | OAuth endpoints need same requireAuth |
| **Frontend auth headers** | [settings/page.tsx](frontend/app/dashboard/settings/page.tsx#L750) | Copy this for OAuth API calls |
| **Router navigation** | [checkout/page.tsx](frontend/app/checkout/page.tsx) | Use `useRouter().push()` for redirects |

---

## 🆕 BUILD FROM SCRATCH (New Code)

| Component | Create Where | Purpose |
|-----------|--------------|---------|
| **OAuth Controller** | `backend/src/controllers/oauthController.js` | Token exchange + phone fetch |
| **OAuth Routes** | `backend/src/routes/oauthRoutes.js` | 3 endpoints (oauth, status, disconnect) |
| **OAuth Status Page** | `frontend/app/dashboard/settings/whatsapp-oauth/page.tsx` | Show connection status |
| **OAuth Callback Page** | `frontend/app/integrations/whatsapp/callback/page.tsx` | Receive code + exchange |
| **Meta OAuth Button** | In status page | Redirect to Meta OAuth URL |

---

## 🔄 COPY-PASTE SNIPPETS

### Meta OAuth URL (Frontend)
```javascript
const metaOAuthUrl = 
  `https://www.facebook.com/v19.0/dialog/oauth?` +
  `client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&` +
  `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
  `scope=whatsapp_business_management,whatsapp_business_messaging&` +
  `state=${state}`
```

### Token Exchange (Backend)
```javascript
const tokenResponse = await axios.post(
  'https://graph.facebook.com/v19.0/oauth/access_token',
  {
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    redirect_uri: callbackUrl,
    code
  }
)
```

### Fetch WABAs (Backend)
```javascript
const wabaResponse = await axios.get(
  `https://graph.facebook.com/v19.0/${businessId}/whatsapp_business_accounts`,
  { headers: { 'Authorization': `Bearer ${access_token}` } }
)
```

### Fetch Phone Numbers (Backend)
```javascript
const phoneResponse = await axios.get(
  `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
  { headers: { 'Authorization': `Bearer ${access_token}` } }
)
```

---

## 📝 WHAT NOT TO TOUCH

🚫 **DO NOT REFACTOR:**
- PhoneNumber model (correct as-is)
- Account model (correct as-is)
- webhookController (correct as-is)
- settingsController (keep existing logic)
- Socket.io real-time (working perfectly)
- Message/Conversation models (leave alone)

---

## ⚡ QUICK TEAM BRIEF

> "We have 1.2.0 in production with manual WhatsApp setup.
> 
> Now we're adding **Meta Embedded Signup OAuth** as the client-facing onboarding.
> 
> This is:
> - 5 new files (controllers, routes, pages)
> - 0 refactoring of existing code
> - 4 days to production
> - No breaking changes
> 
> Reference: OAUTH-IMPLEMENTATION-ROADMAP.md (full execution plan)"

---

## 🎯 DAY-BY-DAY

**Day 1:**
- Frontend: OAuth status page + button
- Backend: Start OAuth controller

**Day 2:**
- Backend: OAuth endpoints (exchange, status, disconnect)
- Frontend: Callback page

**Day 3:**
- Testing with Meta sandbox
- Error handling

**Day 4:**
- Production testing
- Deployment

---

**Status:** Ready to assign tasks to team ✅
