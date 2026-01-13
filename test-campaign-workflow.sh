#!/bin/bash

# Campaign System Test Script
# Tests the complete workflow: segments fetch → campaign creation

echo "🚀 CAMPAIGN SYSTEM TEST WORKFLOW"
echo "================================"
echo ""

# Get JWT token from login (if needed)
# For now, assuming you have a valid JWT token stored in an env variable
TOKEN=${AUTH_TOKEN:-"your-jwt-token-here"}

# Test Account ID (replace with your actual account ID)
ACCOUNT_ID=${ACCOUNT_ID:-"67812a7a7c5b3d8e1f2g3h4i"}
PHONE_NUMBER_ID=${PHONE_NUMBER_ID:-"1234567890"}
API_URL=${API_URL:-"http://localhost:5050"}

echo "Configuration:"
echo "  API URL: $API_URL"
echo "  Account ID: $ACCOUNT_ID"
echo "  Token: ${TOKEN:0:20}..."
echo ""

# Test 1: Check if segments endpoint is accessible
echo "📋 TEST 1: Fetch Available Segments"
echo "-----------------------------------"
echo "Endpoint: GET /api/campaigns/segments"
echo ""

SEGMENTS_RESPONSE=$(curl -s -X GET \
  "$API_URL/api/campaigns/segments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$SEGMENTS_RESPONSE" | jq '.' 2>/dev/null || echo "$SEGMENTS_RESPONSE"
echo ""

# Extract segments from response
SEGMENTS=$(echo "$SEGMENTS_RESPONSE" | jq '.segments' 2>/dev/null)

if [ -z "$SEGMENTS" ] || [ "$SEGMENTS" == "null" ]; then
  echo "❌ ERROR: No segments returned"
  echo "Possible causes:"
  echo "  1. No contacts with tags in this account"
  echo "  2. Authentication failed"
  echo "  3. Backend not running"
  exit 1
else
  echo "✅ Segments fetched successfully!"
  echo "Segments: $(echo "$SEGMENTS" | jq -r '.[].name' 2>/dev/null | tr '\n' ', ')"
  echo ""
fi

# Test 2: Estimate audience reach
echo "📊 TEST 2: Estimate Audience Reach"
echo "-----------------------------------"
echo "Endpoint: POST /api/campaigns/estimate-reach"
echo ""

ESTIMATE_RESPONSE=$(curl -s -X POST \
  "$API_URL/api/campaigns/estimate-reach" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audience": {
      "type": "all"
    }
  }')

echo "Response:"
echo "$ESTIMATE_RESPONSE" | jq '.' 2>/dev/null || echo "$ESTIMATE_RESPONSE"
echo ""

REACH=$(echo "$ESTIMATE_RESPONSE" | jq '.estimatedReach' 2>/dev/null)

if [ -z "$REACH" ] || [ "$REACH" == "null" ]; then
  echo "❌ ERROR: Could not estimate reach"
else
  echo "✅ Estimated reach: $REACH contacts"
  echo ""
fi

# Test 3: Create a test campaign
echo "📧 TEST 3: Create Campaign"
echo "--------------------------"
echo "Endpoint: POST /api/campaigns"
echo ""

CREATE_RESPONSE=$(curl -s -X POST \
  "$API_URL/api/campaigns" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign - Automated Test",
    "description": "This is an automated test campaign",
    "type": "broadcast",
    "audience": {
      "type": "all"
    },
    "message": {
      "type": "text",
      "content": "Hello! This is a test campaign."
    }
  }')

echo "Response:"
echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

CAMPAIGN_ID=$(echo "$CREATE_RESPONSE" | jq -r '.campaign._id' 2>/dev/null)

if [ -z "$CAMPAIGN_ID" ] || [ "$CAMPAIGN_ID" == "null" ]; then
  echo "❌ ERROR: Could not create campaign"
else
  echo "✅ Campaign created! ID: $CAMPAIGN_ID"
  echo ""
fi

# Test 4: Get campaign details
if [ ! -z "$CAMPAIGN_ID" ] && [ "$CAMPAIGN_ID" != "null" ]; then
  echo "👀 TEST 4: Get Campaign Details"
  echo "--------------------------------"
  echo "Endpoint: GET /api/campaigns/{id}"
  echo ""

  DETAILS_RESPONSE=$(curl -s -X GET \
    "$API_URL/api/campaigns/$CAMPAIGN_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "Response:"
  echo "$DETAILS_RESPONSE" | jq '.' 2>/dev/null || echo "$DETAILS_RESPONSE"
  echo ""

  STATUS=$(echo "$DETAILS_RESPONSE" | jq -r '.campaign.status' 2>/dev/null)
  
  if [ "$STATUS" == "draft" ]; then
    echo "✅ Campaign status: $STATUS (as expected)"
  else
    echo "⚠️  Campaign status: $STATUS"
  fi
  echo ""
fi

# Summary
echo "📊 TEST SUMMARY"
echo "==============="
echo "✅ All tests completed!"
echo ""
echo "Next steps:"
echo "1. Check if segments were fetched correctly"
echo "2. Verify estimated reach matches contact count"
echo "3. Test campaign creation in the UI at http://localhost:3000/dashboard/campaigns/create"
echo "4. Monitor backend logs for any errors"
echo ""
