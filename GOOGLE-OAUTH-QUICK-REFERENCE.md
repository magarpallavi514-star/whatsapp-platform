# Google OAuth - Quick Reference

## 🎯 5-Minute Quick Start

### 1. Get Google Credentials (2 min)
```
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 Web credentials
5. Copy Client ID & Secret
```

### 2. Add to .env files (2 min)

**Backend (.env):**
```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
JWT_SECRET=your-secret-key
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
```

### 3. Install & Run (1 min)
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### 4. Test
- Open http://localhost:3000/login
- Click Google Sign-In button
- You're done! ✅

---

## 🔧 File Checklist

- ✅ Backend: `googleAuthController.js`
- ✅ Backend: `models/User.js`
- ✅ Backend: `routes/authRoutes.js` (updated)
- ✅ Backend: `.env` (updated)
- ✅ Frontend: `app/login/page.tsx` (updated)
- ✅ Frontend: `.env.local` (updated)
- ✅ Frontend: `package.json` (with @react-oauth/google)
- ✅ Backend: `package.json` (with google-auth-library)

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/google/login | Google sign-in |
| POST | /api/auth/google/link | Link Google to existing account |
| GET | /api/auth/me | Get current user (requires JWT) |

---

## 🔑 Environment Variables

### Backend
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
JWT_SECRET
```

### Frontend
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

---

## 🚦 Flow Diagram

```
Login Page
    ↓
User clicks Google button
    ↓
Google Sign-In dialog
    ↓
User authenticates
    ↓
Frontend gets credential
    ↓
POST /api/auth/google/login
    ↓
Backend verifies with Google
    ↓
Create/Update User & Account
    ↓
Return JWT token
    ↓
Store in localStorage
    ↓
Redirect to /dashboard
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Button not showing | Check NEXT_PUBLIC_GOOGLE_CLIENT_ID |
| Invalid token | Google credentials not verified |
| CORS error | Check FRONTEND_URL in backend .env |
| Module not found | Run npm install in frontend/backend |

---

## 📋 User Model Fields

```javascript
{
  email: String (unique),
  name: String,
  googleId: String,
  picture: String,
  accountId: ObjectId (ref: Account),
  role: enum ['superadmin', 'admin', 'manager', 'agent', 'user'],
  emailVerified: Boolean,
  status: enum ['active', 'inactive', 'suspended'],
  lastLogin: Date,
  createdAt: Date
}
```

---

## 🎓 What Happens Behind the Scenes

1. **Google sends credential** → JWT-signed token with user info
2. **Backend verifies** → Checks signature with Google public keys
3. **Creates account** → New Account + User if first login
4. **Generates JWT** → Platform's own JWT for session management
5. **Frontend stores** → Token in localStorage, user in localStorage
6. **All API calls** → Include Bearer token in Authorization header

---

## ✅ Production Checklist

- [ ] Add production domain to Google OAuth credentials
- [ ] Update .env with production URLs
- [ ] Enable HTTPS
- [ ] Use strong JWT_SECRET
- [ ] Test complete flow
- [ ] Set up email confirmation
- [ ] Monitor failed logins
- [ ] Plan backup auth methods (email/password)

---

## 📚 Useful Links

- Google Cloud Console: https://console.cloud.google.com/
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- React OAuth Google: https://www.npmjs.com/package/@react-oauth/google
- Google Auth Library: https://www.npmjs.com/package/google-auth-library

---

## 💡 Pro Tips

1. **Test with multiple Google accounts** - Make sure new user creation works
2. **Check browser storage** - localStorage shows what frontend has
3. **Watch server logs** - See what backend is receiving
4. **Use Postman** - Test `/api/auth/google/login` directly
5. **Monitor user creation** - Check MongoDB for new accounts
