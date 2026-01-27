# ✅ Setup WhatsApp Webhook for Local Development

## Step 1: Install ngrok
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

## Step 2: Start ngrok (in a new terminal)
```bash
ngrok http 5050
```
This will give you a URL like: `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app`

## Step 3: Configure in WhatsApp Business Account
1. Go to: https://developers.facebook.com/
2. Select your app → WhatsApp
3. Go to **Configuration** section
4. Under "Webhook URL", enter:
   ```
   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/api/whatsapp/webhook
   ```
   (Replace with your actual ngrok URL)

## Step 4: Webhook Token Verification
1. Under "Verify Token", enter your META_VERIFY_TOKEN:
   ```
   pixels_webhook_secret_2025
   ```
   (This is in your .env file)

## Step 5: Subscribe to Messages
1. Click "Subscribe to this field" for:
   - ✅ messages
   - ✅ message_template_status_update
   - ✅ message_status

## Step 6: Test Webhook
The system will automatically verify by calling your webhook with a challenge token.

## Step 7: Send Test Message
Send a message to your WABA number (+918087131777) from any WhatsApp account.
It should appear in the Live Chat within seconds.

## Common Issues:
- ❌ "Webhook verification failed" → Check your VERIFY_TOKEN matches
- ❌ Messages not coming in → Check webhook is subscribed to "messages" field
- ❌ ngrok URL expired → ngrok gives new URL when restarted, update in dashboard

## Current Configuration in .env:
- WHATSAPP_PHONE_NUMBER_ID: 889344924259692
- WHATSAPP_ACCESS_TOKEN: [Your access token]
- META_VERIFY_TOKEN: pixels_webhook_secret_2025
- WEBHOOK: POST /api/whatsapp/webhook

Happy messaging! 🎉
