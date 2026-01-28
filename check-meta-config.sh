#!/bin/bash

# Meta & WhatsApp Configuration Diagnostic
# Checks if Meta app credentials and phone numbers are properly connected

echo "🔍 META & WHATSAPP CONFIGURATION DIAGNOSTIC"
echo "=========================================="
echo ""

# Check .env file
echo "📋 1. Checking .env Configuration"
echo "-----------------------------------"

# Check for .env file
if [ -f "backend/.env" ]; then
    echo "✅ .env file exists"
    
    # Check for Meta/WhatsApp credentials
    if grep -q "FACEBOOK_APP_ID=" backend/.env; then
        APP_ID=$(grep "FACEBOOK_APP_ID=" backend/.env | cut -d'=' -f2)
        echo "   ✅ FACEBOOK_APP_ID: ${APP_ID:0:10}..." 
    else
        echo "   ❌ FACEBOOK_APP_ID missing"
    fi
    
    if grep -q "FACEBOOK_APP_SECRET=" backend/.env; then
        echo "   ✅ FACEBOOK_APP_SECRET: (present)"
    else
        echo "   ❌ FACEBOOK_APP_SECRET missing"
    fi
    
    if grep -q "META_VERIFY_TOKEN=" backend/.env; then
        VERIFY_TOKEN=$(grep "META_VERIFY_TOKEN=" backend/.env | cut -d'=' -f2)
        echo "   ✅ META_VERIFY_TOKEN: $VERIFY_TOKEN"
    else
        echo "   ❌ META_VERIFY_TOKEN missing"
    fi
    
    if grep -q "WHATSAPP_ACCESS_TOKEN=" backend/.env; then
        TOKEN=$(grep "WHATSAPP_ACCESS_TOKEN=" backend/.env | cut -d'=' -f2)
        echo "   ✅ WHATSAPP_ACCESS_TOKEN: ${TOKEN:0:15}..."
    else
        echo "   ❌ WHATSAPP_ACCESS_TOKEN missing"
    fi
else
    echo "❌ .env file NOT found"
fi

echo ""
echo "🗄️  2. Checking MongoDB Phone Numbers"
echo "-------------------------------------"

# Create a MongoDB query script
cat > temp_mongo_query.js << 'EOF'
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Query PhoneNumber collection
    const db = mongoose.connection.db;
    const phoneNumbers = await db.collection('phonenumbers').find({}).toArray();
    
    console.log(`\n📱 Found ${phoneNumbers.length} phone number(s):\n`);
    
    phoneNumbers.forEach((phone, index) => {
      console.log(`${index + 1}. Phone Number:`);
      console.log(`   - phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   - wabaId: ${phone.wabaId}`);
      console.log(`   - accountId: ${phone.accountId}`);
      console.log(`   - isActive: ${phone.isActive}`);
      console.log(`   - createdAt: ${phone.createdAt}`);
      console.log('');
    });
    
    // Check for webhook logs
    const messages = await db.collection('messages').countDocuments();
    console.log(`📬 Total messages in database: ${messages}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
EOF

echo "Note: Run the following to check phone numbers in database:"
echo "cd backend && node ../temp_mongo_query.js"
echo ""

echo "🔗 3. Testing Meta API Access"
echo "------------------------------"

# Check if curl is available
if command -v curl &> /dev/null; then
    echo "Testing Meta API token validity..."
    
    TOKEN=$(grep "WHATSAPP_ACCESS_TOKEN=" backend/.env | cut -d'=' -f2)
    
    if [ ! -z "$TOKEN" ]; then
        # Try to get account info (requires valid token)
        RESPONSE=$(curl -s -X GET \
            "https://graph.instagram.com/me/accounts" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
        
        if echo "$RESPONSE" | grep -q "data"; then
            echo "✅ Meta API token appears to be VALID"
            echo "   Response: (contains data array)"
        elif echo "$RESPONSE" | grep -q "error"; then
            echo "❌ Meta API token appears to be INVALID"
            ERROR=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
            echo "   Error: $ERROR"
        else
            echo "⚠️  Meta API response unclear"
            echo "   Response: $RESPONSE"
        fi
    else
        echo "⚠️  Could not extract token from .env"
    fi
else
    echo "⚠️  curl not available - cannot test API"
fi

echo ""
echo "📊 4. Configuration Summary"
echo "----------------------------"

echo ""
echo "✅ CHECKLIST:"
echo "  [ ] FACEBOOK_APP_ID configured"
echo "  [ ] FACEBOOK_APP_SECRET configured"
echo "  [ ] META_VERIFY_TOKEN configured"
echo "  [ ] WHATSAPP_ACCESS_TOKEN configured"
echo "  [ ] At least 1 phone number connected in dashboard"
echo "  [ ] Phone number is ACTIVE (isActive: true)"
echo "  [ ] Webhook URL is accessible"
echo ""

echo "🔗 IMPORTANT LINKS:"
echo "  - Meta App: https://developers.facebook.com/apps"
echo "  - Phone Numbers: http://localhost:3000/dashboard/settings"
echo "  - Webhook Testing: See backend/WEBHOOK_VERIFICATION_REPORT.txt"
echo ""

# Cleanup
rm -f temp_mongo_query.js

echo "=========================================="
echo "Diagnostic complete!"
