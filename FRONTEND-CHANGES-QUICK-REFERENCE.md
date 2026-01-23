# Quick Reference: Exact Changes Needed per File

## FILES ALREADY CREATED/READY ✅
- `frontend/components/ErrorToast.tsx` - Error toast component (READY TO USE)

---

## CRITICAL FILES - EXACT CHANGES

### 1. Settings Page
**File:** `frontend/app/dashboard/settings/page.tsx`
- Add import: `import { ErrorToast, useErrorToast } from "@/components/ErrorToast"`
- Add state: `const { error, setError, clearError } = useErrorToast()`
- Replace all `setError("...")` assignments ✓ (Already correct)
- Replace all `alert(...)` with `setError(...)`
- Add at end of JSX: `<ErrorToast message={error} onDismiss={clearError} />`

---

### 2. Templates Page
**File:** `frontend/app/dashboard/templates/page.tsx`
- Line 143, 147, 168: Replace `alert(...)` with `setError(...)`
- Line 205, 208, 212: Replace template submit alerts
- Line 227, 230, 234: Replace sync alerts
- Add state hook and ErrorToast component

---

### 3. Contacts Page
**File:** `frontend/app/dashboard/contacts/page.tsx`
- Line 116, 120, 139, 143: Replace `alert(...)` with `setError(...)`
- Line 224, 237, 270, 285, 312, 316, 323: Replace CSV import alerts
- Add state hook and ErrorToast component

---

### 4. Chatbot Page
**File:** `frontend/app/dashboard/chatbot/page.tsx`
- Line 143, 157, 161: Replace `alert(...)` for auth/fetch errors
- Line 172, 178, 183, 188: Replace validation alerts
- Line 247, 251: Replace save error alerts
- Add state hook and ErrorToast component

---

### 5. Broadcasts Page
**File:** `frontend/app/dashboard/broadcasts/page.tsx`
- Scan for all `alert()` calls
- Replace with `setError()`
- Add state hook and ErrorToast component

---

### 6. Campaigns Page
**File:** `frontend/app/dashboard/campaigns/page.tsx`
- Line 168, 191: Replace `alert(...)` with `setError(...)`
- Add state hook and ErrorToast component
- Note: Already uses user?.accountId (keep as-is, backend handles conversion)

---

### 7. Campaign Create Page
**File:** `frontend/app/dashboard/campaigns/create/page.tsx`
- Scan for error handling
- Add state hook and ErrorToast component
- Keep segment fetch using user?.accountId

---

### 8. Chat Page
**File:** `frontend/app/dashboard/chat/page.tsx`
- Line 275, 279, 292, 365: Replace alert() calls
- Add state hook and ErrorToast component
- Handle connection errors gracefully

---

## HIGH PRIORITY FILES

### 9. Invoices Page
**File:** `frontend/app/dashboard/invoices/page.tsx`
- Add error state and ErrorToast
- Handle fetch errors gracefully

### 10. Platform Billing Page
**File:** `frontend/app/dashboard/platform-billing/page.tsx`
- Line 45: Replace console.error with setError if needed
- Add error state and ErrorToast

### 11. Organizations Page
**File:** `frontend/app/dashboard/organizations/page.tsx`
- Add error state and ErrorToast
- Handle fetch operations

### 12. WhatsApp Setup Page
**File:** `frontend/app/dashboard/settings/whatsapp-setup/page.tsx`
- Scan for alert() or error handling
- Add ErrorToast component

---

## MEDIUM PRIORITY FILES

### 13. Dashboard Page
**File:** `frontend/app/dashboard/page.tsx`
- Line 36: Replace console.error with setError
- Add error state and ErrorToast

### 14. Analytics Page
**File:** `frontend/app/dashboard/analytics/page.tsx`
- Add error state and ErrorToast
- Handle analytics fetch errors

### 15. Transactions Page
**File:** `frontend/app/dashboard/transactions/page.tsx`
- Add error state and ErrorToast

### 16. Website Settings Page
**File:** `frontend/app/dashboard/website-settings/page.tsx`
- Line 401, 430: Already has error handling
- Ensure ErrorToast component is used

### 17. Dashboard Layout
**File:** `frontend/app/dashboard/layout.tsx`
- Line 104: Replace console.error with proper error handling
- Add notification error handling

### 18. System Health Page
**File:** `frontend/app/dashboard/system-health/page.tsx`
- Add error state and ErrorToast
- Handle health check errors

---

## PUBLIC PAGES (Lower Priority)

### 19. Login Page
**File:** `frontend/app/login/page.tsx`
- Already has error state ✓
- Ensure all errors displayed via setError ✓

### 20. Checkout Page
**File:** `frontend/app/checkout/page.tsx`
- Line 122, 128: Already has error state ✓
- Ensure ErrorToast component used

### 21. Pricing Page
**File:** `frontend/app/pricing/page.tsx`
- Line 31: Replace console.error with error state
- Add ErrorToast component

### 22. Home Page
**File:** `frontend/app/page.tsx`
- Line 127: Replace console.error with error state
- Add ErrorToast component

---

## COMPONENT FILES

### 23. Google Sign In Button
**File:** `frontend/components/GoogleSignInButton.tsx`
- Line 58, 67: Replace console.error with proper error handling
- Consider returning error status instead of console.error

### 24. Pricing Cards Component
**File:** `frontend/components/PricingCards.tsx`
- Line 44: Replace console.error with error callback
- Allow parent page to handle error display

### 25. Billing Dashboard Component
**File:** `frontend/components/BillingDashboard.tsx`
- Add error handling
- Let parent page display errors

### 26. Invoices Component
**File:** `frontend/components/InvoicesPage.tsx`
- Add error handling
- Ensure accountId field handled correctly

### 27. Superadmin Pricing Dashboard
**File:** `frontend/components/SuperadminPricingDashboard.tsx`
- Add error handling for plan CRUD

---

## LIBRARY/UTILITY FILES

### 28. API Library
**File:** `frontend/lib/api.ts`
- Already has unified error handling ✓
- Status codes properly handled ✓
- No changes needed

### 29. Auth Library
**File:** `frontend/lib/auth.ts`
- Verify token handling for ObjectId ✓
- Error handling in login/signup
- Ensure no breaking changes for accountId field

### 30. API Client
**File:** `frontend/lib/api-client.ts`
- Verify consistency with api.ts
- Check base URL handling

---

## STANDARD TEMPLATE FOR EACH FILE

Copy this pattern to every page needing updates:

```tsx
"use client"

import { useState, useEffect } from "react"
// ... other imports
import { ErrorToast, useErrorToast } from "@/components/ErrorToast"

export default function PageName() {
  const { error, setError, clearError } = useErrorToast()
  // ... other state

  // API calls
  const fetchData = async () => {
    try {
      const response = await fetch(...)
      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Failed to load data')
        return
      }
      // ... handle data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div>
      {/* Your page content */}
      <ErrorToast message={error} onDismiss={clearError} />
    </div>
  )
}
```

---

## TESTING CHECKLIST

After updating each file:
- [ ] Page loads without errors
- [ ] API calls succeed with new backend
- [ ] Errors display as toast messages (not alert/console)
- [ ] User can dismiss error messages
- [ ] No duplicate error displays
- [ ] ObjectId fields work in list/detail views
- [ ] CRUD operations work (create/read/update/delete)
- [ ] No "Account not found" 404 errors on correct endpoints

---

## SUMMARY OF CHANGES

**Total Files to Update:** 30+
**Pattern:** Error handling uniformity + ErrorToast integration

**Most Common Changes:**
1. Remove/replace `alert()` → use `setError()`
2. Add `useErrorToast()` hook
3. Add `<ErrorToast />` component to JSX
4. Wrap API calls in try-catch with proper error messages

**No ObjectId Logic Changes Needed in Frontend:**
- Backend handles ObjectId conversion
- Frontend continues using String accountId for user context
- All queries already send accountId (backend does the conversion)
