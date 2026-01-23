# Frontend Files to Update for ObjectId Compatibility

## Critical Pages (High Priority - Use ObjectId for queries)

### 1. **Settings & Configuration**
- [frontend/app/dashboard/settings/page.tsx](frontend/app/dashboard/settings/page.tsx) - Phone number management, WABA connection
- [frontend/app/dashboard/settings/whatsapp-setup/page.tsx](frontend/app/dashboard/settings/whatsapp-setup/page.tsx) - WABA setup form

### 2. **Core Features - Data Management**
- [frontend/app/dashboard/templates/page.tsx](frontend/app/dashboard/templates/page.tsx) - Template fetch, submit, sync operations
- [frontend/app/dashboard/contacts/page.tsx](frontend/app/dashboard/contacts/page.tsx) - Contact CRUD, CSV import/export
- [frontend/app/dashboard/broadcasts/page.tsx](frontend/app/dashboard/broadcasts/page.tsx) - Broadcast creation and management
- [frontend/app/dashboard/broadcasts/create/page.tsx](frontend/app/dashboard/broadcasts/create/page.tsx) - Broadcast form
- [frontend/app/dashboard/chatbot/page.tsx](frontend/app/dashboard/chatbot/page.tsx) - Chatbot rules, CRUD operations
- [frontend/app/dashboard/campaigns/page.tsx](frontend/app/dashboard/campaigns/page.tsx) - Campaign list, fetch, delete, status updates
- [frontend/app/dashboard/campaigns/create/page.tsx](frontend/app/dashboard/campaigns/create/page.tsx) - Campaign creation form

### 3. **Data Display & Views**
- [frontend/app/dashboard/chat/page.tsx](frontend/app/dashboard/chat/page.tsx) - Message threads, conversation fetch
- [frontend/app/dashboard/invoices/page.tsx](frontend/app/dashboard/invoices/page.tsx) - Invoice list and details
- [frontend/app/dashboard/analytics/page.tsx](frontend/app/dashboard/analytics/page.tsx) - Analytics dashboard
- [frontend/app/dashboard/transactions/page.tsx](frontend/app/dashboard/transactions/page.tsx) - Transaction history

### 4. **Platform Administration**
- [frontend/app/dashboard/platform-billing/page.tsx](frontend/app/dashboard/platform-billing/page.tsx) - Organization billing
- [frontend/app/dashboard/website-settings/page.tsx](frontend/app/dashboard/website-settings/page.tsx) - Website and pricing settings
- [frontend/app/dashboard/organizations/page.tsx](frontend/app/dashboard/organizations/page.tsx) - Organization management

### 5. **Layout & Navigation**
- [frontend/app/dashboard/layout.tsx](frontend/app/dashboard/layout.tsx) - Fetch notifications, user data
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx) - Dashboard stats and recent items
- [frontend/app/dashboard/system-health/page.tsx](frontend/app/dashboard/system-health/page.tsx) - System status

---

## What Needs to Be Updated in Each File

### Error Handling (Replace alert() with ErrorToast)
All pages using `alert()` should be updated to use the new `ErrorToast` component:
- Replace: `alert("error message")`
- With: `setError("error message")`
- Component: `<ErrorToast message={error} onDismiss={clearError} />`

### Data Fetching
Ensure all API calls properly handle:
1. Response status codes (401, 500, etc.)
2. Network errors
3. Display user-friendly error messages

### UI Field Matching
Pages need to ensure:
1. Account/phone/template IDs are treated as strings in display
2. Internal _id fields use ObjectId format
3. API responses correctly structure ObjectId vs String fields

---

## Summary
- **Total Pages**: 20 files
- **Critical Pages** (must update): 12
- **Important Pages** (should update): 8
- **Pattern**: All use `fetch()` API calls that need error handling + ObjectId support
