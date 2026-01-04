#!/bin/bash

# Simple manual tests (run these while server is running in another terminal)

BASE_URL="http://localhost:5050"
ADMIN_KEY="wpk_admin_78add24f2731f52fa58175a4312c13df2a83ac4e9b3f99d69c40aec485e605c0"
PIXELS_KEY="wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29"

echo ""
echo "🧪 QUICK TESTS FOR PHASE 2B"
echo "======================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check:"
curl -s "$BASE_URL/health" && echo ""
echo ""

# Test 2: Existing API key still works (hashed)
echo "2️⃣  Test existing API key (hashed):"
curl -s "$BASE_URL/api/stats" \
  -H "Authorization: Bearer $PIXELS_KEY" && echo ""
echo ""

# Test 3: Create Enromatics account
echo "3️⃣  Create Enromatics account:"
curl -s -X POST "$BASE_URL/api/admin/accounts" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "enromatics",
    "name": "Enromatics", 
    "email": "tech@enromatics.com",
    "type": "client",
    "plan": "professional"
  }' && echo ""
echo ""

# Test 4: List all accounts
echo "4️⃣  List all accounts:"
curl -s "$BASE_URL/api/admin/accounts" \
  -H "Authorization: Bearer $ADMIN_KEY" && echo ""
echo ""

# Test 5: Get specific account
echo "5️⃣  Get enromatics account:"
curl -s "$BASE_URL/api/admin/accounts/enromatics" \
  -H "Authorization: Bearer $ADMIN_KEY" && echo ""
echo ""

# Test 6: Self-service - Get own account
echo "6️⃣  Self-service - Get own account:"
curl -s "$BASE_URL/api/account/me" \
  -H "Authorization: Bearer $PIXELS_KEY" && echo ""
echo ""

# Test 7: Try admin endpoint without auth (should fail)
echo "7️⃣  Security test - Admin endpoint without auth:"
curl -s -X POST "$BASE_URL/api/admin/accounts" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"hacker","name":"Hacker"}' && echo ""
echo ""

echo "======================================"
echo "✅ Tests complete!"
echo ""
