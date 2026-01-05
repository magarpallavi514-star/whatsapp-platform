#!/bin/bash

# Test Media Upload Feature
# This script tests the new /api/messages/send-media endpoint

echo "🧪 Testing Media Upload Feature"
echo "================================"
echo ""

# Configuration
API_KEY="wpk_live_f0b8a01652eb0b9950484f3b4674bd800e9e3e9a216f200f34b0502a0591ac5d"
PHONE_NUMBER_ID="889344924259692"
RECIPIENT_PHONE="919310691973"

# Choose base URL
if [ "$1" == "prod" ]; then
  BASE_URL="https://whatsapp-platform-production-e48b.up.railway.app"
  echo "🌐 Testing PRODUCTION deployment"
else
  BASE_URL="http://localhost:3000"
  echo "🏠 Testing LOCAL server"
fi

echo "URL: $BASE_URL"
echo ""

# Create a test image file (1x1 pixel PNG)
TEST_IMAGE="/tmp/test-image.png"
echo "📸 Creating test image..."
base64 -D > "$TEST_IMAGE" <<EOF
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
EOF

if [ -f "$TEST_IMAGE" ]; then
  echo "✅ Test image created: $TEST_IMAGE"
else
  echo "❌ Failed to create test image"
  exit 1
fi

echo ""
echo "🚀 Sending media message..."
echo ""

# Send media message
RESPONSE=$(curl -s -X POST "$BASE_URL/api/messages/send-media" \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@$TEST_IMAGE" \
  -F "phoneNumberId=$PHONE_NUMBER_ID" \
  -F "recipientPhone=$RECIPIENT_PHONE" \
  -F "caption=Test media upload from API" \
  -F "campaign=test")

echo "$RESPONSE" | jq '.'

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
  if [ "$SUCCESS" == "true" ]; then
    echo ""
    echo "✅ Media message sent successfully!"
    echo ""
    echo "Details:"
    echo "$RESPONSE" | jq '{
      messageId: .data.messageId,
      mediaUrl: .data.mediaUrl,
      mediaType: .data.mediaType,
      filename: .data.filename
    }'
  else
    echo ""
    echo "❌ Failed to send media message"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
  fi
else
  echo ""
  echo "❌ Invalid response from server"
fi

# Cleanup
rm -f "$TEST_IMAGE"
echo ""
echo "🧹 Cleaned up test files"
