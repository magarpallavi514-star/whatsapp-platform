# 🔗 INTEGRATION TOKEN SYSTEM

## Overview

The WhatsApp Platform now supports **Integration Tokens** that allow external applications (like Enromatics) to connect to the platform on behalf of tenant accounts.

## 🔑 Token Types

| Token Type | Format | Purpose | Used By |
|------------|--------|---------|---------|
| **Admin Key** | `wpk_admin_xxx` | Platform management | Pixels team |
| **API Key** | `wpk_live_xxx` | Direct API access | API clients |
| **Integration Token** | `wpi_int_xxx` | External app integration | Enromatics, etc. |

---

## 🎯 How It Works

### 1. Tenant Generates Integration Token

Tenants can generate integration tokens from their dashboard:

```bash
POST https://whatsapp-platform-production-e48b.up.railway.app/api/account/integration-token
Authorization: Bearer wpk_live_YOUR_API_KEY

Response:
{
  "success": true,
  "integrationToken": "wpi_int_abc123...",
  "tokenPrefix": "wpi_int_abc",
  "createdAt": "2026-01-07T...",
  "warning": "Save this token securely. Use it in external apps."
}
```

### 2. Use Token in External Apps (Enromatics)

External apps use the integration token to authenticate:

```javascript
// In Enromatics or other external apps
fetch('https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wpi_int_abc123...',
    // OR
    'X-Integration-Token': 'wpi_int_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+919766504856',
    message: 'Hello from Enromatics!'
  })
})
```

### 3. Platform Validates Token

The platform validates the integration token and returns tenant-specific data.

---

## 📡 Available Endpoints

### Generate Integration Token
```bash
POST /api/account/integration-token
Authorization: Bearer wpk_live_YOUR_API_KEY

Response: Returns new integration token (shown only once)
```

### Get Token Info
```bash
GET /api/account/integration-token
Authorization: Bearer wpk_live_YOUR_API_KEY

Response: {
  "integrationToken": {
    "prefix": "wpi_int_abc",
    "createdAt": "2026-01-07...",
    "lastUsedAt": "2026-01-07...",
    "exists": true
  }
}
```

### Revoke Token
```bash
DELETE /api/account/integration-token
Authorization: Bearer wpk_live_YOUR_API_KEY

Response: Invalidates the integration token
```

---

## 🔐 Security

### Token Storage
- ✅ Tokens are hashed with SHA-256 before storage
- ✅ Only prefix is stored in plaintext for display
- ✅ Full token shown only once during generation
- ✅ Tracks last used date for monitoring

### Token Format
- **Prefix**: `wpi_int_` (WhatsApp Platform Integration)
- **Length**: 72 characters total
- **Entropy**: 256 bits (cryptographically secure)

### Best Practices
1. **Generate separate tokens** for each external app
2. **Store securely** in environment variables
3. **Monitor usage** via lastUsedAt
4. **Rotate regularly** (every 90 days)
5. **Revoke immediately** if compromised

---

## 🚀 Integration Guide for Enromatics

### Step 1: Tenant Setup
1. Tenant logs into WhatsApp Platform dashboard
2. Goes to Settings → Integration Tokens
3. Clicks "Generate Integration Token"
4. Copies the token: `wpi_int_abc123...`

### Step 2: Configure Enromatics
Add to Enromatics environment variables:

```env
# Enromatics .env
WHATSAPP_PLATFORM_URL=https://whatsapp-platform-production-e48b.up.railway.app
WHATSAPP_INTEGRATION_TOKEN=wpi_int_abc123...
```

### Step 3: Use in Enromatics Code

```javascript
// In Enromatics backend
const platformUrl = process.env.WHATSAPP_PLATFORM_URL;
const integrationToken = process.env.WHATSAPP_INTEGRATION_TOKEN;

// Send message
async function sendWhatsAppMessage(to, message) {
  const response = await fetch(`${platformUrl}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integrationToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to, message })
  });
  
  return response.json();
}

// Get messages
async function getMessages() {
  const response = await fetch(`${platformUrl}/api/messages`, {
    headers: {
      'Authorization': `Bearer ${integrationToken}`
    }
  });
  
  return response.json();
}

// Get stats
async function getStats() {
  const response = await fetch(`${platformUrl}/api/stats`, {
    headers: {
      'Authorization': `Bearer ${integrationToken}`
    }
  });
  
  return response.json();
}
```

---

## 🔄 Token Lifecycle

```
1. GENERATION
   Tenant → Dashboard → Generate Token
   ↓
2. DISTRIBUTION
   Token → Enromatics .env
   ↓
3. USAGE
   Enromatics → API calls with token
   ↓
4. MONITORING
   Platform tracks lastUsedAt
   ↓
5. ROTATION (optional)
   Regenerate token every 90 days
   ↓
6. REVOCATION (if needed)
   Immediately invalidate token
```

---

## ⚡ Quick Start

### For Tenants:
```bash
# 1. Get your API key from dashboard
API_KEY="wpk_live_xxx"

# 2. Generate integration token
curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/account/integration-token \
  -H "Authorization: Bearer $API_KEY"

# 3. Copy the integration token
# 4. Add to Enromatics .env
```

### For Enromatics:
```bash
# Use integration token for all API calls
INTEGRATION_TOKEN="wpi_int_xxx"

# Send message
curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send \
  -H "Authorization: Bearer $INTEGRATION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"+919766504856","message":"Hello!"}'
```

---

## 🆚 Token Comparison

| Feature | API Key | Integration Token |
|---------|---------|-------------------|
| **Format** | `wpk_live_xxx` | `wpi_int_xxx` |
| **Use Case** | Direct API access | External app integration |
| **Generated By** | Platform admin | Tenant self-service |
| **Regeneration** | Admin only | Tenant anytime |
| **Typical User** | API clients | External apps (Enromatics) |
| **Revocation** | Admin only | Tenant anytime |

---

## 📝 Database Schema

```javascript
{
  integrationTokenHash: String (hashed),
  integrationTokenPrefix: String (first 12 chars),
  integrationTokenCreatedAt: Date,
  integrationTokenLastUsedAt: Date
}
```

---

## ✅ Migration Guide

### Existing Tenants
1. No action required - old API keys still work
2. Generate integration token when ready to integrate with external apps
3. Use integration token specifically for Enromatics and similar apps

### New Tenants
1. Receive API key when account is created (admin use)
2. Generate integration token from dashboard (external apps)

---

## 🔍 Monitoring & Analytics

Track token usage:
```bash
GET /api/account/integration-token

Response:
{
  "lastUsedAt": "2026-01-07T15:30:00Z",
  "createdAt": "2026-01-01T10:00:00Z"
}
```

Monitor for:
- ⚠️ Unused tokens (security risk)
- ⚠️ Excessive usage (potential abuse)
- ⚠️ Old tokens (>90 days without rotation)

---

**Need Help?** Contact: tech@pixels.com
