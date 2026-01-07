# Enromatics Integration Guide

## Overview

This guide explains how to connect **Enromatics** with the WhatsApp Platform using integration tokens.

## What You Need

- ✅ WhatsApp Platform Dashboard (at http://localhost:3000 or your deployed URL)
- ✅ Enromatics Account/Dashboard
- ✅ Your integration token (starts with `wpi_int_`)

## Step-by-Step Setup

### 1. Generate Integration Token

1. **Login to the Platform Dashboard**
   - Go to http://localhost:3000
   - Enter your email and password
   - Click Login

2. **Navigate to Settings**
   - Click on "Settings" in the left sidebar
   - Click on the "API Keys" tab

3. **Generate Token**
   - Click the blue "Generate Integration Token" button
   - A popup will show your token (looks like: `wpi_int_abc123def...`)
   - **⚠️ Copy this token immediately** - you'll need it for Enromatics

### 2. Configure in Enromatics

1. **Login to Enromatics Dashboard**
   - Go to your Enromatics admin panel

2. **Navigate to Integrations**
   - Go to Settings/Integrations or WhatsApp Configuration section

3. **Add WhatsApp Integration**
   - Look for "WhatsApp" or "WhatsApp Business" integration option
   - Click "Add" or "Configure"

4. **Paste the Token**
   - Find the "Token" or "API Key" field
   - Paste the integration token you copied from the platform
   - It should start with `wpi_int_`

5. **Test Connection**
   - Look for a "Test Connection" or "Verify" button
   - Click it to verify the token works
   - You should see ✅ **Connected** message

6. **Save Configuration**
   - Click "Save" or "Update"
   - Your Enromatics is now connected!

## Testing the Connection

### From Command Line

```bash
cd backend
node test-enromatics-token.js wpi_int_your_token_here
```

You should see:
```
✅ Token is valid and working!
```

### What the Platform Can Do

Once connected, Enromatics can:
- ✅ Send WhatsApp messages to customers
- ✅ Retrieve conversation history
- ✅ Get message status and delivery reports
- ✅ Create templates for bulk messaging

## API Endpoints Available to Enromatics

### Send Message
```
POST /api/integrations/send-message
Authorization: Bearer wpi_int_...
Content-Type: application/json

{
  "recipientPhone": "+1234567890",
  "message": "Hello from Enromatics!",
  "mediaUrl": "https://...",  // optional
  "mediaType": "image"        // optional (image, document, etc.)
}
```

### Get Conversations
```
GET /api/integrations/conversations?limit=10&offset=0
Authorization: Bearer wpi_int_...
```

## Troubleshooting

### ❌ "Invalid Token" Error
- **Problem:** Token is not recognized
- **Solution:** 
  - Generate a new token in the dashboard
  - Make sure token starts with `wpi_int_`
  - Check for typos when pasting

### ❌ "Connection Refused"
- **Problem:** Can't reach the API
- **Solution:**
  - Verify backend is running: `npm run dev` in `/backend`
  - Check API_URL matches your backend URL
  - Default: `http://localhost:5050`

### ❌ "Token Expired"
- **Problem:** Token stopped working after some time
- **Solution:**
  - Generate a new token
  - The old token is automatically revoked
  - Update Enromatics with the new token

### ❌ Messages Not Being Sent
- **Problem:** Enromatics can't send messages
- **Solution:**
  - Verify phone number is connected in platform
  - Check WhatsApp Business Account is active
  - Look at backend logs for error details

## Backend Environment Setup

Make sure your backend `.env` file has:

```env
# Server
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT (for dashboard login)
JWT_SECRET=your-secret-key-here

# WhatsApp API
WHATSAPP_API_VERSION=v21.0
```

## Regenerating Tokens

If you suspect your token has been compromised:

1. Go to Settings → API Keys
2. Click the button again - this generates a new token
3. **The old token is automatically revoked**
4. Update Enromatics with the new token immediately

## Support & Debugging

### Enable Debug Logs

In backend `.env`:
```env
DEBUG=pixels:*
```

### Check Server Logs

Monitor the backend console for messages:
```
🔑 Integration Token Check: ✅ Valid
→ ✅ Token verified for: account@email.com
```

### Common Log Messages

✅ **Token verified** = Good, token is working
❌ **Token not provided** = Missing Authorization header
❌ **Invalid token format** = Token doesn't start with `wpi_int_`
❌ **Account not found** = Token exists but account was deleted

## Security Best Practices

1. 🔐 **Keep token private**
   - Don't commit to version control
   - Don't share in emails or logs
   - Only share with Enromatics team

2. 🔑 **Rotate tokens regularly**
   - Generate new token every 90 days
   - Revoke old token immediately

3. 📊 **Monitor usage**
   - Check "Last Used" timestamp
   - Review conversation logs
   - Set up alerts for unusual activity

4. 🛑 **Revoke immediately if compromised**
   - Generate a new token
   - Update all systems using it
   - Check audit logs for suspicious activity

## Need Help?

- 📧 Check backend logs for detailed errors
- 🔍 Use the test script: `node test-enromatics-token.js <token>`
- 📝 Review API documentation at `/api/integrations` routes
- 🐛 Enable debug mode in backend .env

---

**Last Updated:** January 8, 2026
**Version:** 1.0.0
