# ✅ DEPLOYMENT CHECKLIST

## 🎯 BEFORE RAILWAY DEPLOYMENT

### **GitHub** ✅
- [x] Code pushed to GitHub
- [x] Backend in `backend/` folder
- [x] .env file NOT committed (gitignored)
- [x] All tests passing locally

### **MongoDB Atlas**
- [ ] Database accessible from anywhere (0.0.0.0/0)
- [ ] Connection string ready
- [ ] Test connection works

### **Meta WhatsApp API**
- [ ] App credentials ready
- [ ] Phone number verified
- [ ] Webhook verify token ready

---

## 🚀 RAILWAY DEPLOYMENT STEPS

### **1. Create Project**
```
1. Go to railway.app
2. "New Project" > "Deploy from GitHub"
3. Select: mpiyush15/whatsapp-platform
4. Root directory: backend
```

### **2. Add Environment Variables**
```
Copy from backend/.env to Railway:
- MONGODB_URI
- PORT=5050
- NODE_ENV=production
- All WhatsApp API credentials
- ADMIN_API_KEY_HASH
- JWT_SECRET
```

### **3. Deploy**
```
Railway auto-deploys on git push
First deployment: 2-3 minutes
```

### **4. Get Railway URL**
```
Example: https://whatsapp-platform-production.up.railway.app
Save this URL - you'll need it!
```

---

## 🧪 POST-DEPLOYMENT TESTING

### **Test 1: Health Check**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```
Expected: `{"status":"OK"}`

### **Test 2: API Authentication**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/stats \
  -H "Authorization: Bearer wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29"
```
Expected: Stats JSON response

### **Test 3: Admin Endpoint**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/admin/accounts \
  -H "Authorization: Bearer wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0"
```
Expected: List of accounts

---

## 🔗 UPDATE META WEBHOOK

### **In Meta App Dashboard:**
```
1. Go to: https://developers.facebook.com/apps/2094709584392829
2. WhatsApp > Configuration
3. Webhook URL: https://YOUR-RAILWAY-URL.railway.app/api/webhooks/whatsapp
4. Verify Token: pixels_webhook_secret_2025
5. Subscribe to: messages, message_status
6. Click "Verify and Save"
```

### **Test Webhook:**
Send a test message to your WhatsApp number.
Check Railway logs for:
```
📨 Incoming message from: ...
✅ Message processed
```

---

## ✅ DEPLOYMENT SUCCESS CRITERIA

- [ ] Health endpoint returns 200
- [ ] Database connection works
- [ ] API authentication works
- [ ] Admin endpoints work
- [ ] Webhooks receiving messages
- [ ] Can send messages via API
- [ ] No errors in Railway logs

---

## 🎯 AFTER DEPLOYMENT

### **Save These URLs:**
```
Production API: https://YOUR-RAILWAY-URL.railway.app
GitHub Repo: https://github.com/mpiyush15/whatsapp-platform
Railway Dashboard: https://railway.app/project/YOUR-PROJECT-ID
```

### **Update Documentation:**
```
- Update RAILWAY-DEPLOYMENT.md with actual URL
- Share API URL with frontend team
- Update Meta webhook URL
```

---

## 🚨 IF SOMETHING GOES WRONG

### **Check Railway Logs:**
```
Railway Dashboard > Logs tab
Look for:
- MongoDB connection errors
- Missing environment variables
- API errors
```

### **Common Issues:**

**Can't connect to MongoDB:**
- Check Atlas network access (allow 0.0.0.0/0)
- Verify connection string in Railway env vars

**Webhooks not working:**
- Verify webhook URL in Meta dashboard
- Check verify token matches
- Look for errors in Railway logs

**API returns 401:**
- Verify ADMIN_API_KEY_HASH is set in Railway
- Check API key is correct

---

## 📞 NEXT STEPS

Once backend is live on Railway:

1. ✅ **Test all endpoints** (health, API, webhooks)
2. ✅ **Verify webhooks working** (send test message)
3. ✅ **Update Meta webhook URL**
4. 🎨 **BUILD FRONTEND** (Next.js dashboard)
5. 🚀 **Deploy frontend** (Vercel)
6. 🔗 **Connect frontend to Railway API**

---

## 🔥 YOU'RE READY!

**Current Status:**
- ✅ Code on GitHub
- ⏳ Ready for Railway deployment
- 🎯 Next: Deploy to Railway

**Let's deploy this! 🚀**
