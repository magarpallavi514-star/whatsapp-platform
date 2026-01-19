# Google OAuth Setup Guide

## 🚀 Complete Setup Instructions for Google Sign-In/Sign-Up

### Step 1: Get Google OAuth Credentials (5 minutes)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click "Select a Project" → "NEW PROJECT"
   - Name: `Pixels WhatsApp Platform`
   - Click "CREATE"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click it → "ENABLE"

4. **Create OAuth Credentials:**
   - Go to "Credentials" in the left menu
   - Click "CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: `Pixels WhatsApp Web`

5. **Add Authorized Redirect URIs:**
   - Add these URIs:
     ```
     http://localhost:3000
     http://localhost:3000/login
     http://localhost:5050/api/auth/google/callback
     https://yourdomain.com (for production)
     https://yourdomain.com/login (for production)
     ```
   - Click "CREATE"

6. **Copy Your Credentials:**
   - You'll see "Client ID" and "Client Secret"
   - **Save these!** You need them in the next step

---

### Step 2: Update Environment Variables

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

#### Backend (.env):
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Replace:**
- `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID
- `YOUR_GOOGLE_CLIENT_SECRET_HERE` with your actual Client Secret

---

### Step 3: Install Dependencies

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd backend
npm install
```

---

### Step 4: Start the Servers

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Should start on http://localhost:5050
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

---

### Step 5: Test Google Sign-In

1. **Open login page:**
   - Go to: `http://localhost:3000/login`

2. **Click "Google Sign-In" button:**
   - The Google Sign-In widget should appear
   - Click it and sign in with your Google account

3. **Expected flow:**
   - Google login dialog appears
   - You sign in
   - Redirects to `/dashboard`
   - User info stored in localStorage

---

## 🔄 How It Works

### Frontend Flow:
```
User clicks Google button
    ↓
Google Sign-In loads & renders button
    ↓
User signs in with Google
    ↓
Google returns credential/token
    ↓
Frontend sends to backend: /api/auth/google/login
    ↓
User redirected to /dashboard
```

### Backend Flow:
```
Receives credential from frontend
    ↓
Verifies token with Google servers
    ↓
Extracts: googleId, email, name, picture
    ↓
Checks if user exists:
  - If new: Creates Account & User
  - If exists: Updates lastLogin
    ↓
Generates JWT token
    ↓
Returns token + user info to frontend
```

---

## 📁 Files Created/Modified

### New Files:
- ✅ `backend/src/controllers/googleAuthController.js` - Google auth logic
- ✅ `backend/src/models/User.js` - User model
- ✅ `frontend/components/GoogleSignInButton.tsx` - Sign-in component
- ✅ This guide!

### Modified Files:
- ✅ `backend/src/routes/authRoutes.js` - Added Google endpoints
- ✅ `backend/.env` - Added Google credentials
- ✅ `frontend/.env.local` - Added Google Client ID
- ✅ `frontend/package.json` - Added `@react-oauth/google`
- ✅ `backend/package.json` - Added `google-auth-library`
- ✅ `frontend/app/login/page.tsx` - Added Google sign-in button

---

## 🔐 API Endpoints

### POST /api/auth/google/login
**Authenticate with Google**
```bash
curl -X POST http://localhost:5050/api/auth/google/login \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "GOOGLE_TOKEN_HERE"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "USER_ID",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "GOOGLE_PROFILE_PIC",
    "role": "admin",
    "accountId": "ACCOUNT_ID",
    "account": {
      "id": "ACCOUNT_ID",
      "name": "Account Name",
      "plan": "starter"
    }
  }
}
```

### POST /api/auth/google/link (Protected)
**Link Google account to existing user**
```bash
curl -X POST http://localhost:5050/api/auth/google/link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "credential": "GOOGLE_TOKEN_HERE"
  }'
```

---

## 🧪 Testing

### Test Credentials:
```
Email: user@pixelsagency.com
```

### Manual Testing Steps:
1. Open http://localhost:3000/login
2. Click Google sign-in button
3. Sign in with your Google account
4. Check browser console for logs
5. Verify redirect to dashboard
6. Check localStorage for token

### Check Token Storage:
```javascript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('user')
localStorage.getItem('isAuthenticated')
```

---

## 🐛 Troubleshooting

### "Cannot find module 'google-auth-library'"
```bash
cd backend && npm install google-auth-library
```

### "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set"
- Check `.env.local` has the correct Client ID
- Make sure it starts with `NEXT_PUBLIC_`
- Restart npm dev server

### Google button doesn't appear
- Check browser console for errors
- Verify Client ID is correct
- Check if localhost is in authorized URIs

### "Invalid Google token signature"
- Token might be expired
- Make sure you're sending the credential correctly
- Token is only valid for a few minutes

### "This Google account is already linked to another user"
- The email is already used in the system
- Sign in with email/password instead
- Or ask admin to link the accounts

---

## 🚀 Production Deployment

### Before Going Live:

1. **Add production URLs to Google Console:**
   - `https://yourdomain.com`
   - `https://yourdomain.com/login`
   - `https://api.yourdomain.com/api/auth/google/callback`

2. **Update environment variables:**
   ```env
   # Frontend
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

   # Backend
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   JWT_SECRET=STRONG_SECRET_KEY_HERE
   ```

3. **Enable HTTPS** for your domain

4. **Test in production** before telling users

---

## 📚 Additional Features

### Link Google to Existing Account:
Users can link their Google account to an existing email/password account:

```javascript
// After user logs in with email/password
const response = await fetch('/api/auth/google/link', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ credential })
});
```

### Auto-Create Account on First Login:
- First-time Google users automatically get:
  - New Account (plan: starter)
  - New User (role: admin)
  - Email verified = true

### Get Current User:
```bash
curl -X GET http://localhost:5050/api/auth/me \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

## 🎯 Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Add environment variables
3. ✅ Test login locally
4. ✅ Implement signup confirmation email
5. ✅ Add profile completion flow
6. ✅ Deploy to production

---

## 📞 Support

If you have issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend server logs
4. Verify Google credentials are correct
5. Make sure localhost is in authorized URIs
