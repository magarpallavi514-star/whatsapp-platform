# 🚂 Railway Environment Variable Setup

## ❌ Current Issue:
```
Failed to add phone number: Invalid API key or account inactive
Railway Error: ❌ ADMIN_API_KEY_HASH not configured in environment
```

## ✅ Solution: Add Missing Environment Variable to Railway

### Step 1: Go to Railway Dashboard
1. Open: https://railway.app/
2. Select your project: `whatsapp-platform`
3. Click on your service
4. Go to **Variables** tab

### Step 2: Add ADMIN_API_KEY_HASH

Click **"+ New Variable"** and add:

```
Variable Name: ADMIN_API_KEY_HASH
Value: 01498b92c09f05e30c70d102d0914d4759101ff47f28c76e81491f0324addb7b
```

### Step 3: Redeploy (Automatic)
- Railway will automatically redeploy after adding the variable
- Wait ~2 minutes for deployment to complete

### Step 4: Test
Once deployed, test the settings page again. The admin authentication should work!

---

## 📋 All Required Environment Variables for Railway:

Make sure these are all set in Railway:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pixelswhatsapp

# Admin Authentication (NEW - ADD THIS!)
ADMIN_API_KEY_HASH=01498b92c09f05e30c70d102d0914d4759101ff47f28c76e81491f0324addb7b

# AWS S3 for Media Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name

# Server Configuration
PORT=5050
NODE_ENV=production
```

---

## 🔑 Your Admin API Key (for reference):
```
wpk_admin_47a15be172e6a2d97f8eb64d30dfea533a6799718ea4d7f6c0036bf481d60ef2
```

This is already used in your frontend's settings page.

---

## ✅ After Setup:
- Dashboard → Settings → WhatsApp → Add Number should work
- Admin authentication will be validated correctly
- No more "Invalid API key" errors
