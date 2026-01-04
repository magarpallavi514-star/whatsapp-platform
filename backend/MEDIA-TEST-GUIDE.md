# 🧪 WhatsApp Media Test Guide

**Date:** January 4, 2026  
**Backend Status:** ✅ Running on http://localhost:5050  
**MongoDB:** ✅ Connected to pixelswhatsapp  
**S3 Integration:** ✅ Ready

---

## 📋 Test Instructions

### **Step 1: Find Your WhatsApp Test Number**

Your configured WhatsApp Business number is linked to:
- **Phone Number ID:** `889344924259692`
- **Business Account ID:** `1536545574042607`

To find the actual phone number:
1. Go to **Meta Business Suite**: https://business.facebook.com/
2. Navigate to **WhatsApp Manager** → **Phone numbers**
3. Find the number with ID `889344924259692`
4. This is the number you'll send the test message TO

---

### **Step 2: Send Test Image**

**From your personal WhatsApp:**
1. Open WhatsApp on your phone
2. Start a conversation with your WhatsApp Business number
3. Send an **image** (any photo from your gallery or camera)
4. Optionally add a caption: "Test image for S3 integration"

**Important:** You can also send:
- 📄 **PDF or document** 
- 🎬 **Video** (short one recommended)
- 🎵 **Audio/Voice note**

---

### **Step 3: Watch Backend Logs**

The backend terminal should show:

```bash
🔔🔔🔔 WEBHOOK HIT! 🔔🔔🔔

📬 ========== INCOMING MESSAGES ==========
Number of messages: 1

--- Processing Message ---
Message ID: wamid.HBgNOTE5ODcwMjI...
From: 919870223456
Type: image
Timestamp: 1735994523

Image ID: 889344924259692

📥 Downloading image from WhatsApp and uploading to S3...
📥 Downloading media from WhatsApp: 889344924259692
📄 Media info - Type: image/jpeg, Size: 245678 bytes
✅ Downloaded 245678 bytes from WhatsApp
☁️  Uploading to S3: whatsapp-media/pixels_internal/2026-01-04/image/a1b2c3d4-uuid.jpg
✅ Uploaded to S3: https://pixels-official.s3.ap-south-1.amazonaws.com/whatsapp-media/...
✅ Image saved to S3: https://pixels-official.s3.ap-south-1.amazonaws.com/...

✅ Contact created/updated
✅ Conversation created/updated
✅ Saved incoming message to database: 677a1b2c3d4e5f6a7b8c9d0e
```

---

### **Step 4: Verify in MongoDB**

Let me create a script to check the saved message:

```javascript
// Query the latest message
db.messages.findOne(
  { direction: 'inbound', messageType: 'image' },
  { sort: { createdAt: -1 } }
)

// Should return something like:
{
  _id: ObjectId("..."),
  accountId: "pixels_internal",
  phoneNumberId: "889344924259692",
  waMessageId: "wamid.HBgN...",
  recipientPhone: "919870223456",
  messageType: "image",
  content: {
    mediaId: "889344924259692",
    mimeType: "image/jpeg",
    caption: "Test image for S3 integration",
    mediaUrl: "https://pixels-official.s3.ap-south-1.amazonaws.com/whatsapp-media/pixels_internal/2026-01-04/image/uuid.jpg",
    s3Key: "whatsapp-media/pixels_internal/2026-01-04/image/uuid.jpg",
    filename: "889344924259692.jpg",
    fileSize: 245678,
    sha256: "abc123...",
    mediaType: "image"
  },
  status: "delivered",
  direction: "inbound",
  createdAt: ISODate("2026-01-04T13:45:23.000Z")
}
```

---

### **Step 5: Check S3 Bucket**

1. **Go to AWS S3 Console**: https://s3.console.aws.amazon.com/
2. **Open bucket:** `pixels-official`
3. **Navigate to:** `whatsapp-media/pixels_internal/2026-01-04/image/`
4. **You should see:** Your uploaded image file with UUID filename

**Folder structure will be:**
```
pixels-official/
├── invoices/                                    (existing)
└── whatsapp-media/
    └── pixels_internal/
        └── 2026-01-04/
            └── image/
                └── a1b2c3d4-uuid.jpg            (YOUR IMAGE!)
```

---

### **Step 6: Access the Image**

**Option A: Public URL (if bucket is public)**
```
https://pixels-official.s3.ap-south-1.amazonaws.com/whatsapp-media/pixels_internal/2026-01-04/image/uuid.jpg
```

**Option B: Signed URL (if bucket is private)**
The backend automatically generates signed URLs valid for 1 hour.

---

## 🧪 What to Test

### ✅ Test 1: Image with Caption
- Send: Any photo with text caption
- Expected: Both image and caption saved
- Verify: `content.caption` exists in MongoDB

### ✅ Test 2: PDF Document
- Send: Any PDF file
- Expected: File downloaded and saved to S3
- Verify: File appears in `whatsapp-media/.../document/` folder

### ✅ Test 3: Video
- Send: Short video (under 16MB recommended)
- Expected: Video processed and saved
- Verify: `messageType: "video"` in database

### ✅ Test 4: Voice Note
- Send: Voice message
- Expected: Audio saved as OGG/AAC
- Verify: `messageType: "audio"` in database

### ✅ Test 5: Multiple Media
- Send: 3-4 different media files in sequence
- Expected: All processed individually
- Verify: All show up in MongoDB with unique S3 URLs

---

## 📊 Success Indicators

### ✅ Webhook Received
```
🔔🔔🔔 WEBHOOK HIT! 🔔🔔🔔
```

### ✅ Media Downloaded
```
📥 Downloading media from WhatsApp: {mediaId}
✅ Downloaded {X} bytes from WhatsApp
```

### ✅ S3 Upload Success
```
☁️  Uploading to S3: whatsapp-media/...
✅ Uploaded to S3: https://pixels-official.s3.ap-south-1.amazonaws.com/...
```

### ✅ Database Saved
```
✅ Saved incoming message to database: {messageId}
```

---

## ⚠️ Troubleshooting

### Issue: No webhook received
**Symptoms:** No logs appearing after sending message

**Possible Causes:**
1. Webhook not configured in Meta dashboard
2. Railway backend URL not set correctly
3. Meta verify token mismatch

**Fix:**
1. Check webhook URL in Meta: `https://your-railway-url.railway.app/api/webhook`
2. Verify token: `pixels_webhook_secret_2025`
3. Ensure phone number is active in Meta

---

### Issue: "Failed to download media"
**Symptoms:** Error in logs: `❌ Failed to download/upload image`

**Possible Causes:**
1. Access token expired
2. Media ID invalid
3. Network timeout

**Fix:**
1. Check access token is valid: `WHATSAPP_ACCESS_TOKEN` in .env
2. Token might need refresh from Meta dashboard
3. Try sending again

---

### Issue: "Access Denied" S3 error
**Symptoms:** S3 upload fails with 403

**Possible Causes:**
1. IAM credentials expired
2. No S3 permissions
3. Bucket policy restrictive

**Fix:**
1. Verify AWS credentials in .env
2. Check IAM user has `s3:PutObject` permission
3. Test with: `node test-s3-media.js`

---

### Issue: Media URL not accessible
**Symptoms:** S3 URL returns 403 Forbidden

**Possible Causes:**
1. Bucket is private (expected!)
2. Need signed URL for access

**Fix:**
This is normal! Use signed URLs for private buckets:
```javascript
import { getSignedUrlForS3Object } from './src/services/s3Service.js';

const signedUrl = await getSignedUrlForS3Object(s3Key, 3600); // 1 hour
console.log(signedUrl); // This URL will work!
```

---

## 📱 Quick Test Script

I'll create a Node.js script to check the latest message:

```javascript
// Run this after sending a test image
node check-latest-message.js
```

Let me create that script now...

---

## 🎯 Next Steps After Test

Once media test is successful:

### ✅ Phase 1: COMPLETE
- [x] S3 Service created
- [x] Webhook auto-download
- [x] Media storage working
- [x] Test passed

### 🔄 Phase 2: JWT Authentication
1. Install packages: `jsonwebtoken`, `bcryptjs`
2. Create User model
3. Build auth endpoints
4. Update frontend login

### 🔄 Phase 3: Frontend Integration
1. Connect to real API
2. Display real data
3. Real-time updates (Socket.io)

---

## 🚀 Ready to Test!

**Current Status:**
- ✅ Backend: Running on port 5050
- ✅ MongoDB: Connected
- ✅ S3: Configured and tested
- ✅ Webhook: Ready to receive

**Action Required:**
👉 **Send an image to your WhatsApp Business number NOW!**

Watch the backend terminal for the magic! 🎩✨
