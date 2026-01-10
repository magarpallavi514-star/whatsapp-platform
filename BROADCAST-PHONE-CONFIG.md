# Broadcast Phone Number Configuration Issue

## Problem
```
❌ Send message error: Phone number not configured or inactive
Failed to send broadcast to +918087131777
```

## Root Cause
The broadcast is trying to send from a WhatsApp Business Account phone number that is either:
1. **Not in the database** - Phone number hasn't been configured
2. **Marked as inactive** - `isActive: false` in the database
3. **Wrong phoneNumberId** - The ID in broadcast doesn't match database

## Solution

### Step 1: Verify Phone Number Configuration
Check if your WhatsApp Business Account phone number is configured:

```bash
# In backend, run:
mongo
use whatsapp_platform
db.phonenumbers.find()
```

Expected output should show:
```json
{
  "phoneNumberId": "your_phone_id",
  "accountId": "your_account_id",
  "phone": "+918087131777",
  "isActive": true,
  "accessToken": "encrypted_token"
}
```

### Step 2: If Phone Number is Missing
Go to Dashboard → Settings → WhatsApp Setup and:
1. Enter your WhatsApp Business Phone ID
2. Enter your WhatsApp Business Account ID
3. Enter your Meta API Access Token
4. Click "Verify & Save"

This will create/update the phone number configuration.

### Step 3: If Phone Number is Inactive
Enable it manually in MongoDB:
```bash
mongo
use whatsapp_platform
db.phonenumbers.updateOne(
  { phoneNumberId: "your_phone_id" },
  { $set: { isActive: true } }
)
```

### Step 4: Verify Broadcast Uses Correct Phone Number
When creating a broadcast, the `phoneNumberId` must match what's configured:

1. Check the broadcast in database:
```bash
mongo
use whatsapp_platform
db.broadcasts.find({ name: "your_broadcast_name" })
```

2. Verify the `phoneNumberId` field matches your configured phone number

### Step 5: Test Broadcast Again
Once phone number is configured and active:
1. Create a new broadcast with correct phone number
2. Add recipient phone numbers
3. Send the broadcast

## Common Issues

### Issue: "Phone number not configured"
**Solution:** Go to Settings → WhatsApp Setup and configure your phone number

### Issue: "Phone number inactive"
**Solution:** Enable the phone number in database or reconfigure in Settings

### Issue: "Wrong phone number ID"
**Solution:** Make sure the broadcast was created with the correct phone number ID

## For Live Server

If this happens on live server:
1. Check environment variables are set correctly
2. Ensure `.env` has correct `MONGODB_URI`
3. Verify WhatsApp API credentials haven't expired
4. Check if phone number needs re-verification with Meta

## Testing

After fixing, test with:
1. New broadcast with test phone number
2. Check server logs for "Broadcast execution error"
3. Verify message reaches recipient's WhatsApp

---
Last Updated: 10 January 2026
