import axios from 'axios'
import PhoneNumber from '../models/PhoneNumber.js'
import Account from '../models/Account.js'

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0'

/**
 * Validate data consistency after OAuth save
 * MUST pass before returning success to client
 */
async function validateConsistency(accountId, phone) {
  const errors = []
  
  // 1. PhoneNumber record exists
  const phoneRecord = await PhoneNumber.findOne({
    accountId,
    phoneNumberId: phone.phoneNumberId
  })
  
  if (!phoneRecord) {
    errors.push('❌ PhoneNumber record not found after save')
  }
  
  // 2. Account.wabaId matches PhoneNumber.wabaId
  const account = await Account.findOne({ accountId })
  
  if (account.wabaId !== phone.wabaId) {
    errors.push(`❌ Account.wabaId (${account.wabaId}) does not match PhoneNumber.wabaId (${phone.wabaId})`)
  }
  
  // 3. PhoneNumber.accessToken is encrypted (not plaintext)
  if (phoneRecord.accessToken && phoneRecord.accessToken.length < 100) {
    errors.push('❌ AccessToken appears unencrypted')
  }
  
  // 4. No duplicate phone numbers in same account
  const duplicates = await PhoneNumber.find({
    accountId,
    phoneNumberId: phone.phoneNumberId
  })
  
  if (duplicates.length > 1) {
    errors.push(`❌ ${duplicates.length} duplicate phone numbers found`)
  }
  
  // 5. Account can be found by wabaId
  const accountByWaba = await Account.findOne({ wabaId: phone.wabaId })
  
  if (!accountByWaba) {
    errors.push('❌ Account not found by wabaId')
  }
  
  // Return result
  if (errors.length > 0) {
    throw new Error(`Consistency validation failed:\n${errors.join('\n')}`)
  }
  
  console.log('✅ All consistency checks passed')
  return true
}

/**
 * Log consistency event for monitoring
 */
function logConsistencyEvent(type, data) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'CONSISTENCY_EVENT',
    type,
    accountId: data.accountId,
    wabaId: data.wabaId,
    phoneNumberId: data.phoneNumberId,
    status: data.status,
    message: data.message
  }))
}

/**
 * POST /api/integrations/whatsapp/oauth
 * Exchange OAuth code for access token + phone data
 * Single write point - saves to PhoneNumber (authority)
 */
export const handleWhatsAppOAuth = async (req, res) => {
  try {
    const { code, state } = req.body
    const accountId = req.accountId
    
    console.log('🔐 OAuth: Starting token exchange for account:', accountId)
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'No authorization code provided'
      })
    }
    
    // 1. Exchange code for access token
    console.log('🔄 Exchanging code for access token...')
    console.log('OAuth Params:', {
      client_id: process.env.META_APP_ID,
      code: code?.substring(0, 20) + '...' // Log first 20 chars only
    })
    
    let tokenResponse
    try {
      // Use GET request with params for token exchange
      // NOTE: For Embedded Signup, do NOT include redirect_uri
      console.log('🔄 Making GET request to Meta token endpoint...')
      tokenResponse = await axios.get(
        `${GRAPH_API_URL}/oauth/access_token`,
        {
          params: {
            client_id: process.env.META_APP_ID,
            client_secret: process.env.META_APP_SECRET,
            code
          }
        }
      )
      console.log('✅ Token response received:', {
        hasAccessToken: !!tokenResponse.data?.access_token,
        responseKeys: Object.keys(tokenResponse.data || {})
      })
    } catch (error) {
      console.error('❌ OAuth token exchange FAILED:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      })
      
      // Always return proper JSON error response
      return res.status(error.response?.status || 400).json({
        success: false,
        message: 'Failed to exchange code for access token',
        error: error.response?.data?.error?.message || error.message,
        meta: error.response?.data || {
          error: {
            type: error.code,
            message: error.message
          }
        }
      })
    }
    
    const { access_token } = tokenResponse.data
    console.log('✅ Token exchanged successfully')
    
    // 2. Verify token
    console.log('🔐 Verifying token...')
    try {
      await axios.get(
        `${GRAPH_API_URL}/debug_token`,
        {
          params: {
            input_token: access_token,
            access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
          }
        }
      )
      console.log('✅ Token verified')
    } catch (tokenError) {
      console.warn('⚠️ Token verification failed (non-critical):', tokenError.message)
    }
    
    // 3. Check Account for WABA ID (from webhook)
    const account = await Account.findOne({ accountId }).lean()
    const businessId = account?.businessId
    const wabaId = account?.wabaId
    
    console.log('🏢 ========== CHECKING ACCOUNT SYNC STATUS ==========')
    console.log('Business ID:', businessId || '⏳ waiting for webhook')
    console.log('WABA ID:', wabaId || '⏳ waiting for webhook')
    
    // 🔥 CRITICAL: In Embedded Signup, Meta sends WABA ID + Business ID via webhook
    // We do NOT fetch WABA here - Meta gives us everything we need via webhook
    if (!wabaId || !businessId) {
      console.warn('⚠️ WABA/Business ID not yet synced from webhook')
      console.log('   This is normal - webhook account_update event should arrive within seconds')
      console.log('   Returning success and settings page will show status once webhook completes')
      
      return res.json({
        success: true,
        message: 'OAuth completed! Waiting for Meta webhook to sync WABA details...',
        accountId: accountId,
        status: 'awaiting_webhook',
        waitingFor: {
          businessId: !businessId,
          wabaId: !wabaId
        },
        nextSteps: 'Refresh settings page in 5-10 seconds to see WABA details'
      })
    }
    
    console.log('✅ Account already synced from webhook - proceeding to fetch phone numbers')
    console.log('================================================\n')
    
    // 4. Fetch phone numbers using WABA ID from webhook
    console.log('📱 Fetching phone numbers from WABA:', wabaId)
    let phoneResponse
    try {
      phoneResponse = await axios.get(
        `${GRAPH_API_URL}/${wabaId}/phone_numbers`,
        {
          params: {
            access_token: access_token
          }
        }
      )
    } catch (phoneError) {
      console.error('❌ Failed to fetch phone numbers:', phoneError.message)
      
      return res.status(phoneError.response?.status || 400).json({
        success: false,
        message: 'Failed to fetch phone numbers',
        error: phoneError.response?.data?.error?.message || phoneError.message
      })
    }
    
    const phoneNumbers = phoneResponse.data.data || []
    
    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified phone numbers found in your WABA',
        action: 'Add and verify a phone number in your WhatsApp Business Account',
        nextSteps: [
          'Go to Meta Business Manager',
          'Select your WhatsApp Business Account',
          'Go to Phone Numbers section',
          'Add a phone number',
          'Verify with SMS code',
          'Return and try again'
        ],
        helpLink: 'https://business.facebook.com/settings/whatsapp'
      })
    }
    
    console.log('✅ Found phone numbers:', phoneNumbers.length)
    
    // 6. SINGLE WRITE POINT: Save to PhoneNumber (authority)
    const savedPhones = []
    
    for (const phone of phoneNumbers) {
      try {
        const existing = await PhoneNumber.findOne({
          accountId,
          phoneNumberId: phone.id
        })
        
        if (existing) {
          // Update existing
          const updated = await PhoneNumber.findOneAndUpdate(
            { accountId, phoneNumberId: phone.id },
            {
              wabaId,
              accessToken,  // Encrypted automatically
              displayPhone: phone.display_phone_number,
              displayName: phone.verified_name || 'WhatsApp Business',
              isActive: true,
              verifiedAt: new Date()
            },
            { new: true }
          )
          console.log('✅ Updated phone:', phone.display_phone_number)
          savedPhones.push(updated)
        } else {
          // Create new
          const savedPhone = await PhoneNumber.create({
            accountId,
            phoneNumberId: phone.id,
            wabaId,
            accessToken,
            displayPhone: phone.display_phone_number,
            displayName: phone.verified_name || 'WhatsApp Business',
            isActive: true,
            verifiedAt: new Date()
          })
          console.log('✅ Saved new phone:', phone.display_phone_number)
          savedPhones.push(savedPhone)
        }
      } catch (phoneError) {
        console.error('❌ Error saving phone:', phone.id, phoneError.message)
        throw phoneError
      }
    }
    
    // 7. Update Account with wabaId and businessId (reference - not authority)
    console.log('📝 Updating Account.wabaId and Account.businessId...')
    const updatePayload = { wabaId }
    if (extractedBusinessId) {
      updatePayload.businessId = extractedBusinessId
      console.log('🏢 Including businessId:', extractedBusinessId)
    }
    
    const updatedAccount = await Account.findOneAndUpdate(
      { accountId },
      updatePayload,
      { new: true }
    )
    console.log('✅ Updated Account:', { wabaId, businessId: extractedBusinessId })
    
    logConsistencyEvent('account_update', {
      accountId,
      wabaId,
      phoneNumberId: phoneNumbers[0]?.id,
      status: 'success',
      message: 'Account.wabaId updated'
    })
    
    // 8. Subscribe to webhook
    console.log('🔔 Subscribing to webhooks...')
    try {
      await axios.post(
        `${GRAPH_API_URL}/${wabaId}/subscribed_apps`,
        { 
          subscribed_fields: ['messages', 'message_status', 'account_update'],
          access_token: access_token
        }
      )
      console.log('✅ Subscribed to webhooks (messages, message_status, account_update)')
    } catch (webhookError) {
      console.warn('⚠️ Webhook subscription warning:', webhookError.message)
      // Don't fail - webhook might already be subscribed
    }
    
    // 9. CRITICAL: Validate consistency before returning success
    console.log('🔒 Validating data consistency...')
    await validateConsistency(accountId, savedPhones[0])
    
    logConsistencyEvent('oauth_save', {
      accountId,
      wabaId,
      phoneNumberId: phoneNumbers[0]?.id,
      status: 'success',
      message: 'OAuth completed, phones saved to PhoneNumber'
    })
    
    // 10. Return success
    console.log('✅ OAuth flow completed successfully')
    return res.json({
      success: true,
      message: 'WhatsApp connected successfully',
      businessName,
      phoneCount: phoneNumbers.length,
      phones: phoneNumbers.map(p => ({
        id: p.id,
        display: p.display_phone_number,
        verifiedName: p.verified_name || 'WhatsApp Business'
      }))
    })
    
  } catch (error) {
    console.error('❌ OAuth error:', error.message)
    
    logConsistencyEvent('oauth_error', {
      accountId: req.accountId,
      status: 'error',
      message: error.message
    })
    
    return res.status(400).json({
      success: false,
      message: error.message || 'OAuth connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * GET /api/integrations/whatsapp/status
 * Get OAuth status (which phones connected)
 * Reads from PhoneNumber (authority)
 */
export const getWhatsAppStatus = async (req, res) => {
  try {
    const accountId = req.accountId
    
    console.log('📊 Fetching WhatsApp status for account:', accountId)
    
    const phones = await PhoneNumber.find({ accountId })
      .select('-accessToken')
      .lean()
    
    const account = await Account.findOne({ accountId }).lean()
    
    console.log('✅ Found', phones.length, 'phone number(s)')
    
    return res.json({
      success: true,
      connected: phones.length > 0,
      wabaId: account?.wabaId,
      businessName: account?.name,
      phoneNumbers: phones.map(p => ({
        id: p._id,
        phoneNumberId: p.phoneNumberId,
        wabaId: p.wabaId,
        displayPhone: p.displayPhone,
        displayName: p.displayName,
        isActive: p.isActive,
        qualityRating: p.qualityRating || 'unknown',
        verifiedName: p.verifiedName || 'Not verified',
        verifiedAt: p.verifiedAt,
        createdAt: p.createdAt,
        lastTestedAt: p.lastTestedAt
      }))
    })
  } catch (error) {
    console.error('❌ Status error:', error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * POST /api/integrations/whatsapp/disconnect
 * Disconnect WhatsApp (mark inactive)
 * Modifies PhoneNumber (authority)
 */
export const disconnectWhatsApp = async (req, res) => {
  try {
    const accountId = req.accountId
    
    console.log('🔌 Disconnecting WhatsApp for account:', accountId)
    
    // Mark all phones inactive
    const result = await PhoneNumber.updateMany(
      { accountId },
      { isActive: false }
    )
    
    console.log('✅ Marked', result.modifiedCount, 'phone(s) as inactive')
    
    // Clear Account.wabaId
    await Account.findOneAndUpdate(
      { accountId },
      { wabaId: null }
    )
    
    console.log('✅ Cleared Account.wabaId')
    
    logConsistencyEvent('disconnect', {
      accountId,
      status: 'success',
      message: 'WhatsApp disconnected'
    })
    
    return res.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
      phonesAffected: result.modifiedCount
    })
  } catch (error) {
    console.error('❌ Disconnect error:', error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
