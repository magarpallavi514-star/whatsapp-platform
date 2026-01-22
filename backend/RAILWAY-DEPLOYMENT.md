# 🚀 RAILWAY DEPLOYMENT GUIDE - WhatsApp Platform Backend

## 📋 Prerequisites

- ✅ GitHub repository: https://github.com/mpiyush15/whatsapp-platform
- ✅ Railway account: https://railway.app
- ✅ MongoDB Atlas database
- ✅ Meta WhatsApp Business API credentials

---

## 🎯 STEP 1: CREATE NEW PROJECT ON RAILWAY

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `mpiyush15/whatsapp-platform`
5. Railway will detect Node.js automatically ✅

---

## 🎯 STEP 2: CONFIGURE ENVIRONMENT VARIABLES

In Railway project settings, add these environment variables:

### **Database**
```
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp
```

### **Server**
```
PORT=5050
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### **Meta WhatsApp API**
```
WHATSAPP_APP_ID=2094709584392829
WHATSAPP_PHONE_NUMBER_ID=889344924259692
WHATSAPP_BUSINESS_ACCOUNT_ID=1536545574042607
WHATSAPP_ACCESS_TOKEN=EAAdxIJSvcn0BP0yMIMzXxlJuDr2PmiTIy3VEzE94Sqo5NS4ChBzg3PxriCWW64TLPrTSziiRYCnEzfXQqDaYjfW7HLZCfDcvkqm1Bb04VglwpMXeRvxKzOGu4YzzLRJYHfVqT4NwDZAKPUAUT76d8tHJZB2jE28nNEhiefKRxS2ZAVNTMvAf5BXIKGQXnyZAwSgZDZD
META_APP_SECRET=b74799186bb64571487423a924d1a3ca
META_VERIFY_TOKEN=pixels_webhook_secret_2025
META_API_VERSION=v21.0
```

### **Facebook Integration**
```
FACEBOOK_APP_ID=1193384345994095
FACEBOOK_APP_SECRET=e80034de1f0bc9013b3b7c2fbe5f3ec7
```

### **Authentication**
```
JWT_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
ADMIN_API_KEY_HASH=dde875f57dae36bb78f54a9a3d479bf9d8ce3d4361af85302c9c8efa5e85473f
```

### **Optional (for future use)**
```
SUPER_ADMIN_EMAIL=mpiyush2727@gmail.com
NEXTAUTH_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
NEXTAUTH_URL=https://your-frontend-domain.com
```

---

## 🎯 STEP 3: CONFIGURE BUILD SETTINGS

Railway auto-detects Node.js, but verify:

**Build Command:** (leave empty - not needed)
**Start Command:** `node server.js`
**Root Directory:** `backend`

---

## 🎯 STEP 4: DEPLOY

1. Click **"Deploy"** in Railway
2. Wait for deployment (2-3 minutes)
3. Railway will provide a URL: `https://whatsapp-platform-production.up.railway.app`

---

## 🎯 STEP 5: TEST DEPLOYMENT

### **Test Health Endpoint**
```bash
curl https://your-railway-url.railway.app/health
```

**Expected:**
```json
{
  "status": "OK",
  "message": "Server is healthy",
  "uptime": 123.45
}
```

### **Test API with Your Key**
```bash
curl https://your-railway-url.railway.app/api/stats \
  -H "Authorization: Bearer wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29"
```

---

## 🎯 STEP 6: UPDATE META WEBHOOK URL

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Navigate to **WhatsApp > Configuration**
3. Update **Webhook URL** to:
   ```
   https://your-railway-url.railway.app/api/webhooks/whatsapp
   ```
4. **Verify Token:** `pixels_webhook_secret_2025`
5. Subscribe to these webhook fields:
   - ✅ messages
   - ✅ message_status

---

## 🎯 STEP 7: VERIFY WEBHOOK

Meta will send a test message. Check Railway logs:
```
✅ Webhook verified successfully
```

---

## 📊 MONITORING

### **View Logs**
Railway Dashboard > Your Project > Logs

### **Check Metrics**
Railway Dashboard > Metrics

### **Restart Service**
Railway Dashboard > Settings > Restart

---

## 🔒 SECURITY CHECKLIST

- ✅ All secrets in environment variables (not in code)
- ✅ MONGODB_URI uses connection string (no hardcoded password in code)
- ✅ API keys hashed in database
- ✅ CORS configured for frontend domain
- ✅ Rate limiting enabled (if needed)

---

## 🚨 TROUBLESHOOTING

### **Deployment Fails**
- Check Railway logs for errors
- Verify all environment variables are set
- Check MongoDB connection string

### **Can't Connect to Database**
- Verify MongoDB Atlas allows Railway IP addresses
- In Atlas: Network Access > Add IP Address > Allow from anywhere (0.0.0.0/0)

### **Webhooks Not Working**
- Check Meta webhook verification
- Verify webhook URL is correct
- Check verify token matches

### **API Returns 401**
- Verify API key is correct
- Check `ADMIN_API_KEY_HASH` is set
- Ensure API key migration ran successfully

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- ✅ Health endpoint returns 200
- ✅ Database connection successful
- ✅ API key authentication works
- ✅ Webhooks receive messages
- ✅ Can send messages via API
- ✅ Logs show no errors

---

## 📝 IMPORTANT NOTES

1. **Domain**: Railway provides a free domain. For custom domain, add in Railway settings.

2. **Scaling**: Railway auto-scales. Monitor usage in dashboard.

3. **Environment Variables**: Can be updated in Railway dashboard without redeployment.

4. **Database**: Using MongoDB Atlas (already set up). No changes needed.

5. **Cost**: Railway free tier gives 500 hours/month. Monitor usage.

---

## 🔗 USEFUL LINKS

- **Railway Dashboard**: https://railway.app/dashboard
- **Meta App Dashboard**: https://developers.facebook.com/apps/2094709584392829
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repo**: https://github.com/mpiyush15/whatsapp-platform

---

## 🎉 SUCCESS!

Once deployed, your backend will be live at:
```
https://whatsapp-platform-production.up.railway.app
```

**Next Step**: Build frontend and connect to this API! 🚀

---

## 📞 SUPPORT

**Issues?**
1. Check Railway logs
2. Verify environment variables
3. Test API endpoints manually
4. Check webhook configuration in Meta

**Ready for frontend?** Let's build the UI! 👊
