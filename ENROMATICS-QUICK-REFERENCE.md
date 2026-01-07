# Enromatics Integration Quick Reference

## 🚀 Quick Start (5 Minutes)

### In Platform Dashboard
```
1. Login: http://localhost:3000
2. Settings → API Keys tab
3. Click "Generate Integration Token"
4. Copy the token (wpi_int_...)
```

### In Enromatics
```
1. Settings → WhatsApp Integration
2. Paste token in "API Key/Token" field
3. Click "Test Connection"
4. Should show ✅ Connected
5. Save settings
```

---

## 🔑 Token Types

| Type | Prefix | Used By | Use Case |
|------|--------|---------|----------|
| Integration Token | `wpi_int_` | Enromatics, 3rd party apps | Send messages, get conversations |
| API Key | `wpk_live_` | Internal stats API | Analytics only |

---

## ✅ Testing Connection

### Command Line Test
```bash
cd backend
node test-enromatics-token.js wpi_int_your_token
```

### Expected Output
```
✅ Token is valid and working!
```

### Manual Test (Curl)
```bash
curl -X GET http://localhost:5050/api/integrations/conversations \
  -H "Authorization: Bearer wpi_int_your_token" \
  -H "Content-Type: application/json"
```

---

## 📍 API Endpoints

### Available to Enromatics

**1. Send Message**
```
POST /api/integrations/send-message
{
  "recipientPhone": "+1234567890",
  "message": "Hello!"
}
```

**2. Get Conversations**
```
GET /api/integrations/conversations?limit=10
```

---

## ⚠️ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid Token" | Wrong token | Regenerate new token |
| "Connection Refused" | Backend not running | `npm run dev` in backend |
| "Not Found" | Wrong endpoint | Use `/api/integrations/` |
| "401 Unauthorized" | No auth header | Add `Authorization: Bearer wpi_int_...` |

---

## 🔄 Token Lifecycle

```
Generate → Copy → Paste in Enromatics → Test → Use
   ↓                                           ↓
  Only shown once                    Token is active
   Save immediately!                 for unlimited time*
   
*Until manually revoked or new token generated
```

---

## 📞 Support Checklist

- [ ] Token starts with `wpi_int_`
- [ ] Backend running on port 5050
- [ ] Enromatics using correct URL: `http://localhost:5050`
- [ ] Token pasted correctly (no extra spaces)
- [ ] Test connection shows ✅
- [ ] WhatsApp Business Account is connected

---

## 🔒 Security Reminders

✅ **DO:**
- Keep token private
- Use HTTPS in production
- Rotate tokens every 90 days

❌ **DON'T:**
- Share token in emails
- Commit token to git
- Use same token across multiple environments

---

## 📊 Useful Commands

```bash
# Test token validity
node test-enromatics-token.js <token>

# Regenerate new token (in dashboard)
Click "Generate Integration Token" button

# Check backend logs
npm run dev

# Check if backend is running
curl http://localhost:5050/health
```

---

## 📝 Sample Integration Response

```json
{
  "success": true,
  "integrationToken": "wpi_int_abc123def456...",
  "tokenPrefix": "wpi_int_abc123",
  "createdAt": "2026-01-08T12:00:00Z",
  "warning": "⚠️ Save this token securely. Use it in external apps (Enromatics, etc.)"
}
```

---

**Need more help?** See `ENROMATICS-SETUP-GUIDE.md` for detailed instructions.
