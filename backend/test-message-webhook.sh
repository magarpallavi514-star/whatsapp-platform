#!/bin/bash

# Test message to Enromatics via API
API_URL="http://localhost:5050/api"

# You need to login first and get a token
# For now, using a demo token - you'll need to replace with your actual token

echo "🔐 Test: Sending message via API..."
echo ""

# First, let's create a conversation and message via the webhook simulation
# This simulates WhatsApp sending us a message

curl -X POST "$API_URL/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "1234567890",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "919123456789",
            "phone_number_id": "1003427786179738",
            "waba_id": "1211735840550044"
          },
          "messages": [{
            "from": "919209270811",
            "id": "wamid.test.'"$(date +%s)"'",
            "timestamp": "'"$(date +%s)"'",
            "type": "text",
            "text": {
              "body": "✅ Test message from '$(date)'"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test User"
            },
            "wa_id": "919209270811"
          }]
        }
      }]
    }]
  }' 2>&1

echo ""
echo ""
echo "✅ Test message sent via webhook!"
echo ""
echo "📝 The message should appear in live chat for Enromatics account"
echo "🔄 Login to dashboard and check the conversation thread"
echo ""
echo "Phone: 919123456789"
echo "Contact: Test User (919209270811)"
