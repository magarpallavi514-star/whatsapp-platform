#!/usr/bin/env node

/**
 * Verify WhatsApp webhook is configured in Meta
 */

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0'
const WABA_ID = '1179018337647970'
const SYSTEM_TOKEN = process.env.META_SYSTEM_TOKEN

async function checkWebhookSubscription() {
  try {
    console.log('\n🔍 ========== CHECKING WEBHOOK SUBSCRIPTION ==========')
    console.log('WABA ID:', WABA_ID)
    console.log('')
    
    // Get subscribed apps for this WABA
    console.log('📡 Fetching subscribed apps from Meta...')
    const response = await axios.get(
      `${GRAPH_API_URL}/${WABA_ID}/subscribed_apps`,
      {
        params: {
          access_token: SYSTEM_TOKEN
        }
      }
    )
    
    console.log('✅ Got response from Meta')
    console.log('Subscribed apps:', response.data)
    console.log('')
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Webhook is subscribed!')
      console.log('Number of apps:', response.data.data.length)
      response.data.data.forEach((app, i) => {
        console.log(`  [${i+1}] ${app.name} (ID: ${app.id})`)
      })
    } else {
      console.log('❌ No webhooks subscribed!')
      console.log('\nYou need to subscribe to webhooks with subscribed_fields:')
      console.log('  - messages')
      console.log('  - message_status')
      console.log('  - account_update')
    }
    
    console.log('')
    
  } catch (error) {
    console.error('❌ Error checking webhook subscription:')
    console.error('  Status:', error.response?.status)
    console.error('  Message:', error.message)
    if (error.response?.data) {
      console.error('  Data:', error.response.data)
    }
  }
}

async function checkPhoneNumbers() {
  try {
    console.log('\n📱 ========== CHECKING PHONE NUMBERS ==========')
    console.log('WABA ID:', WABA_ID)
    console.log('')
    
    console.log('📡 Fetching phone numbers from Meta...')
    const response = await axios.get(
      `${GRAPH_API_URL}/${WABA_ID}/phone_numbers`,
      {
        params: {
          access_token: SYSTEM_TOKEN,
          fields: 'id,display_phone_number,verification_status'
        }
      }
    )
    
    console.log('✅ Got phone numbers from Meta')
    console.log('')
    
    if (response.data.data && response.data.data.length > 0) {
      console.log(`✅ Found ${response.data.data.length} phone number(s):`)
      response.data.data.forEach((phone, i) => {
        console.log(`\n  [${i+1}] ${phone.display_phone_number}`)
        console.log(`      ID: ${phone.id}`)
        console.log(`      Status: ${phone.verification_status}`)
      })
    } else {
      console.log('❌ No phone numbers found in WABA!')
    }
    
    console.log('\n')
    
  } catch (error) {
    console.error('❌ Error checking phone numbers:')
    console.error('  Status:', error.response?.status)
    console.error('  Message:', error.message)
    if (error.response?.data) {
      console.error('  Data:', error.response.data)
    }
  }
}

async function main() {
  console.log('🚀 WhatsApp Webhook Configuration Check')
  console.log('=========================================\n')
  
  if (!SYSTEM_TOKEN) {
    console.error('❌ ERROR: META_SYSTEM_TOKEN not found in .env')
    process.exit(1)
  }
  
  await checkWebhookSubscription()
  await checkPhoneNumbers()
  
  console.log('✅ Check complete!')
  console.log('')
}

main().catch(console.error)
