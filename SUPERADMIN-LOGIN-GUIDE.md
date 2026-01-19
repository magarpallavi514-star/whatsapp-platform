# 🔐 SUPERADMIN LOGIN CREDENTIALS

## Primary Superadmin Account
- **Email:** `mpiyush2727@gmail.com`
- **Password:** `Pm@22442232`
- **Role:** Superadmin (Full Platform Access)
- **AccountId:** `pixels_internal`

---

## Demo Test Accounts (Auto-Auth - Any Password Works)

### Demo Superadmin
- Email: `superadmin@test.com`
- Password: `22442232` (or any password)
- Role: superadmin

### Demo Admin
- Email: `admin@test.com`
- Password: (any password)
- Role: admin

### Demo Manager
- Email: `manager@test.com`
- Password: (any password)
- Role: manager

### Demo Agent
- Email: `agent@test.com`
- Password: (any password)
- Role: agent

---

## Troubleshooting Login Issues

### Issue: "Invalid email or password"

**Check 1: Is backend running?**
```bash
# Terminal 1 - Start backend
cd backend
npm run dev
# Should see: 🚀 Server is running on port 5050
```

**Check 2: Verify exact credentials**
- Email: `mpiyush2727@gmail.com` (case-sensitive)
- Password: `Pm@22442232` (exact match required)
- No spaces before/after

**Check 3: Check browser console**
- Open DevTools (F12)
- Check Network tab for 401/500 errors
- Check Console for fetch errors

**Check 4: Verify API URL**
- Check `.env.local` in frontend folder
- Should be: `NEXT_PUBLIC_API_URL=http://localhost:5050/api`

---

## Testing Login via Terminal

```bash
# Run test script
cd backend
node test-superadmin-login.js
```

Expected output if successful:
```
✅ LOGIN SUCCESSFUL!
Token: eyJhbGc...
User: { email: 'mpiyush2727@gmail.com', role: 'superadmin', ... }
```

---

## If Still Failing

1. **Clear browser cache/localStorage**
   - Open DevTools → Application → LocalStorage
   - Delete any entries for localhost:3000

2. **Check backend logs** when starting dev server
   - Should see: "🔑 ADMIN_USER Configuration"
   - Should see your login attempt with detailed logs

3. **Verify database connection**
   - Should see: "🔄 Connecting to MongoDB..."
   - Should see: "✅ Database connected successfully!"
