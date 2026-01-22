#!/bin/bash

# 🚀 PIXELS WHATSAPP - QUICK LAUNCH REFERENCE
# Copy-paste commands for rapid deployment

echo "════════════════════════════════════════════════════════════════"
echo "🚀 PIXELS WHATSAPP - PRODUCTION LAUNCH QUICK START"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 STEP 1: VERIFY FILES CREATED${NC}"
echo ""
echo "Checking email service..."
if [ -f "backend/src/services/emailService.js" ]; then
    echo -e "${GREEN}✅ emailService.js found${NC}"
else
    echo -e "${RED}❌ emailService.js NOT FOUND${NC}"
fi

echo "Checking payment service..."
if [ -f "backend/src/services/cashfreeService.js" ]; then
    echo -e "${GREEN}✅ cashfreeService.js found${NC}"
else
    echo -e "${RED}❌ cashfreeService.js NOT FOUND${NC}"
fi

echo "Checking payment controller..."
if [ -f "backend/src/controllers/cashfreePaymentController.js" ]; then
    echo -e "${GREEN}✅ cashfreePaymentController.js found${NC}"
else
    echo -e "${RED}❌ cashfreePaymentController.js NOT FOUND${NC}"
fi

echo ""
echo -e "${BLUE}🔑 STEP 2: SETUP CREDENTIALS${NC}"
echo ""
echo "1. Get Zepto API Key:"
echo "   → Go to https://www.zeptomail.com/"
echo "   → Sign up → Dashboard → Settings → API Keys"
echo "   → Copy the API Key"
echo ""
echo "2. Get Cashfree API Keys:"
echo "   → Go to https://dashboard.cashfree.com/"
echo "   → Sign up → Complete KYC → Settings → API Keys"
echo "   → Copy Public Key & Secret Key"
echo ""

echo -e "${BLUE}🔧 STEP 3: UPDATE ENVIRONMENT VARIABLES${NC}"
echo ""
echo "Edit backend/.env and add:"
cat << 'EOF'

# Email (Zepto)
ZEPTO_API_KEY=your_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Payment (Cashfree)
CASHFREE_CLIENT_ID=your_client_id
CASHFREE_SECRET_KEY=your_secret_key
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

EOF

echo -e "${BLUE}🚀 STEP 4: INSTALL DEPENDENCIES${NC}"
echo ""
echo "Run these commands:"
echo ""
echo "cd backend"
echo "npm install zepto-sdk"
echo "npm install cashfree-pg"
echo ""

echo -e "${BLUE}📝 STEP 5: UPDATE PAYMENT ROUTES${NC}"
echo ""
echo "✅ Already done! paymentRoutes.js updated with:"
echo "   • POST /api/payment/create-order"
echo "   • POST /api/payment/verify"
echo "   • POST /api/payment/webhook/confirm"
echo "   • GET /api/payment/invoice/:orderId"
echo ""

echo -e "${BLUE}🧪 STEP 6: TEST LOCALLY${NC}"
echo ""
echo "1. Start backend: npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Go to http://localhost:3000/signup"
echo "4. Create test account"
echo "5. Check email for welcome email"
echo "6. Go to /checkout"
echo "7. Select plan and click 'Proceed to Payment'"
echo "8. Use test card: 4111 1111 1111 1111"
echo "9. Expiry: 12/25, CVV: 123"
echo "10. Complete payment"
echo "11. Check email for payment confirmation"
echo ""

echo -e "${BLUE}🌍 STEP 7: CONFIGURE DOMAIN${NC}"
echo ""
echo "1. Buy domain from:"
echo "   • namecheap.com (cheapest)"
echo "   • google.com/domains (easiest)"
echo "   • godaddy.com (popular)"
echo ""
echo "2. Point DNS to your server:"
echo "   • If Railway: CNAME to railway-app.up.railway.app"
echo "   • If VPS: A record to your server IP"
echo ""
echo "3. Wait 24 hours for DNS propagation"
echo ""

echo -e "${BLUE}📊 STEP 8: DEPLOY TO PRODUCTION${NC}"
echo ""
echo "Backend:"
echo "  git add ."
echo "  git commit -m 'Add email and payment integration'"
echo "  git push"
echo "  # Or deploy via Railway/Heroku dashboard"
echo ""
echo "Frontend:"
echo "  git add ."
echo "  git commit -m 'Update for production'"
echo "  git push"
echo "  # Or deploy via Vercel/Railway dashboard"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 YOU'RE READY TO LAUNCH!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. ✅ Files created"
echo "2. ⏳ Buy domain (5 min)"
echo "3. ⏳ Setup Zepto (5 min)"
echo "4. ⏳ Setup Cashfree (5 min)"
echo "5. ⏳ Deploy (10 min)"
echo "6. 🚀 LAUNCH (celebrate!)"
echo ""
echo "Estimated total time: 25 minutes until live! ⚡"
echo ""
echo "Questions? Check these files:"
echo "  • LAUNCH-READY.md - Complete overview"
echo "  • LAUNCH-CHECKLIST.md - Detailed checklist"
echo "  • PRODUCTION-LAUNCH-GUIDE.md - Complete guide"
echo ""
