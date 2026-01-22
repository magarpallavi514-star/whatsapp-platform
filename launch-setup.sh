#!/bin/bash

# 🚀 PRODUCTION LAUNCH QUICK START
# Run this after completing domain, email, and payment setup

echo "🚀 Pixels WhatsApp - Production Launch Script"
echo "=============================================="
echo ""

# Step 1: Validate environment variables
echo "📝 Step 1: Checking environment variables..."
echo ""

# Backend env check
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env found"
    if grep -q "ZEPTO_API_KEY" backend/.env; then
        echo "  ✅ ZEPTO_API_KEY configured"
    else
        echo "  ❌ ZEPTO_API_KEY missing - add it to backend/.env"
    fi
    
    if grep -q "CASHFREE_PUBLIC_KEY" backend/.env; then
        echo "  ✅ CASHFREE keys configured"
    else
        echo "  ❌ CASHFREE keys missing - add them to backend/.env"
    fi
else
    echo "❌ Backend .env not found"
    exit 1
fi

echo ""

# Frontend env check
if [ -f "frontend/.env.local" ]; then
    echo "✅ Frontend .env.local found"
else
    echo "❌ Frontend .env.local not found"
    exit 1
fi

echo ""
echo "📦 Step 2: Installing dependencies..."
echo ""

# Install backend dependencies
cd backend
if ! grep -q "zepto-sdk\|nodemailer" package.json; then
    echo "📦 Installing email service package..."
    npm install zepto-sdk
fi

if ! grep -q "cashfree-pg" package.json; then
    echo "📦 Installing Cashfree package..."
    npm install cashfree-pg
fi

cd ..

echo ""
echo "✅ All checks complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create email service file: backend/src/services/emailService.js"
echo "2. Create payment controller: backend/src/controllers/cashfreePaymentController.js"
echo "3. Create features page: frontend/app/features/page.tsx"
echo "4. Create signup page: frontend/app/signup/page.tsx"
echo "5. Test payment flow with sandbox credentials"
echo "6. Test email sending"
echo "7. Deploy to production"
echo ""
echo "🎉 Then you're ready to onboard your first client!"
