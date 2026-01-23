# Complete List - UI Files That Need ObjectId Compatibility Updates

## FILE CATEGORIZATION & PRIORITY

---

## TIER 1: CRITICAL (Must Fix First - Directly Handle Account Data)

### Settings & Account Management
1. **[frontend/app/dashboard/settings/page.tsx](frontend/app/dashboard/settings/page.tsx)** ⚠️ CRITICAL
   - Fetches phone numbers
   - Manages WABA connections  
   - Gets/updates account profile
   - Issue: Uses accountId for phone lookup queries

2. **[frontend/app/dashboard/settings/whatsapp-setup/page.tsx](frontend/app/dashboard/settings/whatsapp-setup/page.tsx)** ⚠️ CRITICAL
   - WABA account setup form
   - Business account management
   - Issue: Needs to handle ObjectId in businessAccountId field

### Core WhatsApp Features
3. **[frontend/app/dashboard/templates/page.tsx](frontend/app/dashboard/templates/page.tsx)** ⚠️ CRITICAL
   - Fetches all templates
   - Submit to Meta
   - Sync from Meta
   - Create/delete templates
   - Issue: Template CRUD operations depend on proper accountId format

4. **[frontend/app/dashboard/contacts/page.tsx](frontend/app/dashboard/contacts/page.tsx)** ⚠️ CRITICAL
   - Fetch contacts list
   - Create/update/delete contacts
   - CSV import/export
   - Issue: Contact operations use accountId filtering

5. **[frontend/app/dashboard/broadcasts/page.tsx](frontend/app/dashboard/broadcasts/page.tsx)** ⚠️ CRITICAL
   - Broadcast list management
   - Status updates
   - Issue: Broadcast queries filtered by accountId

6. **[frontend/app/dashboard/broadcasts/create/page.tsx](frontend/app/dashboard/broadcasts/create/page.tsx)** ⚠️ CRITICAL
   - Broadcast creation form
   - Template/contact selection
   - Issue: Depends on proper template/contact fetching

7. **[frontend/app/dashboard/chatbot/page.tsx](frontend/app/dashboard/chatbot/page.tsx)** ⚠️ CRITICAL
   - Fetch chatbot rules
   - Create/update/delete rules
   - Issue: Multiple alert() calls need replacement + accountId queries

8. **[frontend/app/dashboard/campaigns/page.tsx](frontend/app/dashboard/campaigns/page.tsx)** ⚠️ CRITICAL
   - Fetch campaigns list
   - Status management (start/pause/resume)
   - Delete campaigns
   - Issue: Campaign queries filtered by accountId + _id used in filters

---

## TIER 2: HIGH PRIORITY (Important Features)

### Campaign Management
9. **[frontend/app/dashboard/campaigns/create/page.tsx](frontend/app/dashboard/campaigns/create/page.tsx)** 🔴 HIGH
   - Campaign creation form
   - Segment selection
   - Issue: Needs segments fetch by accountId

### Communication
10. **[frontend/app/dashboard/chat/page.tsx](frontend/app/dashboard/chat/page.tsx)** 🔴 HIGH
   - Fetch conversations
   - Fetch messages
   - Send messages
   - Mark as read
   - Issue: Message queries by accountId + error handling with alert()

### Admin & Billing
11. **[frontend/app/dashboard/invoices/page.tsx](frontend/app/dashboard/invoices/page.tsx)** 🔴 HIGH
   - Invoice list and details
   - Issue: accountId field in Invoice interface

12. **[frontend/app/dashboard/platform-billing/page.tsx](frontend/app/dashboard/platform-billing/page.tsx)** 🔴 HIGH
   - Organization billing data
   - Fetch organizations
   - Issue: Uses org._id in data keys

13. **[frontend/app/dashboard/organizations/page.tsx](frontend/app/dashboard/organizations/page.tsx)** 🔴 HIGH
   - Organization management
   - Issue: Organization _id handling

---

## TIER 3: MEDIUM PRIORITY (Analytics & Display)

14. **[frontend/app/dashboard/analytics/page.tsx](frontend/app/dashboard/analytics/page.tsx)** 🟡 MEDIUM
   - Analytics dashboard
   - Fetch stats by campaign
   - Issue: Campaign _id filtering

15. **[frontend/app/dashboard/transactions/page.tsx](frontend/app/dashboard/transactions/page.tsx)** 🟡 MEDIUM
   - Transaction history
   - Organization lookup
   - Issue: org._id in transaction data

16. **[frontend/app/dashboard/website-settings/page.tsx](frontend/app/dashboard/website-settings/page.tsx)** 🟡 MEDIUM
   - Pricing plans
   - Website config
   - Issue: Fetch operations by accountId

17. **[frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)** 🟡 MEDIUM
   - Dashboard homepage
   - Recent items display
   - Issue: Fetch subscription, stats by accountId

18. **[frontend/app/dashboard/layout.tsx](frontend/app/dashboard/layout.tsx)** 🟡 MEDIUM
   - Notifications fetch
   - User data verification
   - Issue: Uses user?.accountId for queries

19. **[frontend/app/dashboard/system-health/page.tsx](frontend/app/dashboard/system-health/page.tsx)** 🟡 MEDIUM
   - System status display
   - Issue: Display health by account

---

## TIER 4: LIBRARY & UTILITIES (Foundation)

### API & Data Handling
20. **[frontend/lib/api.ts](frontend/lib/api.ts)** 🔵 FOUNDATION
   - Core API client
   - Error handling wrapper
   - Issue: Need unified error response handling

21. **[frontend/lib/auth.ts](frontend/lib/auth.ts)** 🔵 FOUNDATION
   - Authentication logic
   - User state management
   - Issue: Token handling for ObjectId accounts

22. **[frontend/lib/api-client.ts](frontend/lib/api-client.ts)** 🔵 FOUNDATION
   - API endpoint management
   - Issue: Consistency with API base URL

---

## TIER 5: COMPONENTS (UI Utilities)

23. **[frontend/components/ErrorToast.tsx](frontend/components/ErrorToast.tsx)** ✅ CREATED
   - New error display component
   - Ready to use

24. **[frontend/components/GoogleSignInButton.tsx](frontend/components/GoogleSignInButton.tsx)** 
   - Google auth with error handling
   - Issue: Multiple error cases with alert()

25. **[frontend/components/PricingCards.tsx](frontend/components/PricingCards.tsx)**
   - Pricing display component
   - Issue: Plan fetch errors

26. **[frontend/components/InvoicesPage.tsx](frontend/components/InvoicesPage.tsx)**
   - Invoice component
   - Issue: Invoice data formatting with accountId

27. **[frontend/components/BillingDashboard.tsx](frontend/components/BillingDashboard.tsx)**
   - Billing component
   - Issue: Subscription fetch

28. **[frontend/components/SuperadminPricingDashboard.tsx](frontend/components/SuperadminPricingDashboard.tsx)**
   - Admin pricing management
   - Issue: Plan CRUD operations

---

## PUBLIC PAGES (Lower Priority - No Account Data)

29. **[frontend/app/login/page.tsx](frontend/app/login/page.tsx)** 🟢 LOW
   - Login form
   - Google auth integration
   - Issue: Error handling (alert usage)

30. **[frontend/app/checkout/page.tsx](frontend/app/checkout/page.tsx)** 🟢 LOW
   - Payment checkout
   - Issue: Error handling + error message display

31. **[frontend/app/pricing/page.tsx](frontend/app/pricing/page.tsx)** 🟢 LOW
   - Pricing page
   - Issue: Plan fetch error handling

32. **[frontend/app/page.tsx](frontend/app/page.tsx)** 🟢 LOW
   - Home page
   - Issue: Pricing fetch error handling

---

## SUMMARY TABLE

| Priority | Count | Category | Action |
|----------|-------|----------|--------|
| **CRITICAL** (⚠️) | 8 | Core features | Fix immediately |
| **HIGH** (🔴) | 5 | Important features | Fix next |
| **MEDIUM** (🟡) | 6 | Analytics/display | Fix after |
| **FOUNDATION** (🔵) | 3 | Libraries | Fix together |
| **COMPONENT** | 6 | Utilities | Fix in parallel |
| **PUBLIC** (🟢) | 4 | Marketing pages | Fix last |
| **TOTAL** | **32** | | |

---

## IMPLEMENTATION STRATEGY

### Phase 1: Foundations (Day 1)
- [ ] Update `frontend/lib/api.ts` with unified error handling
- [ ] Update `frontend/lib/auth.ts` for ObjectId support
- [ ] ErrorToast component ready ✅

### Phase 2: Critical Pages (Day 1-2)
- [ ] Settings page + WhatsApp setup
- [ ] Templates CRUD
- [ ] Contacts CRUD  
- [ ] Broadcasts management
- [ ] Chatbot rules

### Phase 3: High Priority (Day 2)
- [ ] Campaign CRUD + create form
- [ ] Chat/messages
- [ ] Invoices
- [ ] Billing pages

### Phase 4: Medium Priority (Day 3)
- [ ] Analytics
- [ ] Transactions
- [ ] Dashboard
- [ ] Layout

### Phase 5: Components & Public Pages (Day 3-4)
- [ ] Component updates
- [ ] Public page error handling

---

## KEY PATTERNS TO IMPLEMENT

### 1. Error Toast Import
```tsx
import { ErrorToast, useErrorToast } from "@/components/ErrorToast"

const { error, setError, clearError } = useErrorToast()
```

### 2. Replace alert() Pattern
```tsx
// Before
alert("Error message")

// After
setError("Error message")
// + Add component to JSX
<ErrorToast message={error} onDismiss={clearError} />
```

### 3. API Response Handling
```tsx
// All fetch calls should:
if (!response.ok) {
  const error = await response.json()
  setError(error.message || `Error: ${response.status}`)
  return
}
```

### 4. ObjectId vs String
```tsx
// For queries (use _id - ObjectId)
const id = campaign._id

// For display (use accountId - String or proper field)
const displayId = account.accountId
```
