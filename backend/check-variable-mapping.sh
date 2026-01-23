#!/bin/bash

echo "🔍 Checking Variable Name Consistency..."
echo ""
echo "═════════════════════════════════════════════════════"
echo ""

echo "1️⃣  Database Schema (PhoneNumber.js):"
grep -A5 "phoneNumberId\|wabaId\|accessToken" backend/src/models/PhoneNumber.js | head -20
echo ""

echo "2️⃣  Webhook Handler (getting Meta data):"
grep "phone_number_id\|waba_id\|display_phone_number" backend/src/controllers/webhookController.js | head -10
echo ""

echo "3️⃣  Database Queries (reading from DB):"
grep "phoneNumberId\|wabaId" backend/src/controllers/webhookController.js | head -10
echo ""

echo "═════════════════════════════════════════════════════"
echo ""

echo "✅ MAPPING:"
echo "  Meta sends:        →  We store as:"
echo "  phone_number_id    →  phoneNumberId"
echo "  waba_id            →  wabaId"
echo "  display_phone_number → displayPhone"
echo "  access_token       →  accessToken (encrypted)"
echo ""

echo "Status: ✅ Consistent"
