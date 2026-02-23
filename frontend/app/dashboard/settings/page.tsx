"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, User, Lock, Shield, Plus, Trash2, CheckCircle, XCircle, RefreshCw, Phone, X, Copy, Eye, EyeOff, Key, Download, FileText, CreditCard, ArrowDown, Calendar, ArrowUp, Package, Loader, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorToast } from "@/components/ErrorToast"
import { authService } from "@/lib/auth"

// Declare global window functions
declare global {
  interface Window {
    launchWhatsAppSignup: () => void
    fbLoginCallback: (response: any) => void
    FB: any
  }
}

interface PhoneNumber {
  _id: string
  phoneNumberId: string
  wabaId: string
  displayName: string
  displayPhone: string
  phone?: string
  isActive: boolean
  verifiedAt?: string
  lastTestedAt?: string
  messageCount?: {
    total: number
    sent: number
    delivered: number
    failed: number
  }
  qualityRating?: string
}

interface ApiKeyData {
  _id: string
  name: string
  keyPrefix: string
  lastUsed?: string
  createdAt: string
  expiresAt?: string
}

interface MyAccountInfo {
  accountId: string
  name: string
  email: string
  type: string
  plan: string
  status: string
  apiKeyPrefix?: string
  apiKeyCreatedAt?: string
  apiKeyLastUsedAt?: string
  wabaId?: string
  phoneNumberId?: string
  displayPhone?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('whatsapp')
  const user = authService.getCurrentUser()
  const isSuperAdmin = user?.role === 'superadmin'
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [editFormData, setEditFormData] = useState({
    wabaId: '',
    displayName: '',
    displayPhone: ''
  })
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    timezone: '',
    accountId: '',
    userId: '',
    wabaId: '',
    businessId: '',
    isWhatsAppConnected: false,
    subdomain: ''
  })

  // Transactions states
  const [transactions, setTransactions] = useState<any[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  
  // Tenant management states
  const [tenantAccounts, setTenantAccounts] = useState<any[]>([])
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [tenantFormData, setTenantFormData] = useState({ name: '', email: '', phone: '' })
  const [addingTenant, setAddingTenant] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // API Key states
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKeyName, setApiKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"

  const getHeaders = () => {
    const token = authService.getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
    
    // Debug: log header state
    console.log('📤 Request Headers:', {
      hasAuth: !!headers.Authorization,
      authFormat: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'none'
    })
    
    return headers
  }

  const fetchPhoneNumbers = async () => {
    try {
      setIsLoading(true)
      const token = authService.getToken()
      
      // Check if token exists
      if (!token) {
        console.error("❌ No token found - user not authenticated")
        setError("Authentication required. Please login again.")
        setIsLoading(false)
        return
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
      }
      
      console.log('📱 FETCH PHONE NUMBERS START');
      console.log('  API URL:', `${API_URL}/settings/phone-numbers`);
      console.log('  Token present:', !!token);
      
      const response = await fetch(`${API_URL}/settings/phone-numbers`, {
        method: 'GET',
        headers: headers
      })
      
      console.log('📱 FETCH RESPONSE RECEIVED');
      console.log('  Status:', response.status);
      console.log('  OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ RESPONSE DATA:', {
          success: data.success,
          phoneNumbersCount: data.phoneNumbers?.length || 0,
          phoneNumbers: data.phoneNumbers
        })
        
        setPhoneNumbers(data.phoneNumbers || [])
        setError("") // Clear any previous errors
        console.log('✅ State updated with', (data.phoneNumbers || []).length, 'phone numbers')
        
        // If no phones, show helpful message
        if (!data.phoneNumbers || data.phoneNumbers.length === 0) {
          setError("⚠️ No WhatsApp Business Account connected\n\nPlease connect your WhatsApp account to start sending messages\n\nSteps:\n1. Go to Meta Business Dashboard\n2. Get your Phone Number ID\n3. Get your WABA ID\n4. Get your Access Token\n5. Click 'Add Phone Number' below and enter the details")
        }
      } else {
        let errorMessage = ""
        const status = response.status
        
        if (status === 401) {
          errorMessage = "❌ Session expired. Please login again."
        } else if (status === 403) {
          errorMessage = "❌ You don't have permission to access WhatsApp settings."
        } else if (status === 404) {
          errorMessage = "✅ No WhatsApp phone numbers configured yet.\n\nClick 'Add WhatsApp Account' button to get started.\n\nSteps to add:\n1. Get Phone Number ID from Meta Dashboard\n2. Get WABA ID from Meta Dashboard\n3. Get Access Token from Meta Dashboard\n4. Enter all details and click Add"
        } else if (status === 500) {
          errorMessage = "❌ Server error. Please contact support if this persists.\n\nServer is temporarily unavailable. This could be due to:\n1. Database connection issues\n2. API service down\n3. Configuration problems"
        } else if (status === 429) {
          errorMessage = "⚠️ Too many requests. Please wait a moment and try again."
        } else if (status === 503) {
          errorMessage = "⚠️ Service temporarily unavailable. Please try again in a few moments."
        } else {
          try {
            const contentType = response.headers.get('content-type')
            if (contentType?.includes('application/json')) {
              const errorBody = await response.json()
              errorMessage = errorBody.message || errorBody.error || `HTTP ${status} Error`
            } else {
              errorMessage = `HTTP ${status} Error`
            }
          } catch (e) {
            errorMessage = `Failed to load phone numbers (${status})`
          }
        }
        
        console.error("❌ Failed to fetch phone numbers:", { 
          status: response.status, 
          message: errorMessage,
          statusText: response.statusText
        })
        setError(errorMessage)
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      console.error("❌ Error fetching phone numbers:", errorMsg, error)
      
      let displayError = errorMsg
      if (errorMsg.includes('Failed to fetch')) {
        displayError = "⚠️ Network error. Please check your internet connection:\n\n1. Verify your internet is working\n2. Try refreshing the page\n3. Check if WhatsApp API is reachable"
      } else if (errorMsg.includes('abort')) {
        displayError = "⚠️ Request timeout. The server took too long to respond:\n\n1. Please wait a moment\n2. Try refreshing the page\n3. If problem persists, contact support"
      } else if (errorMsg.includes('CORS')) {
        displayError = "⚠️ Access error. The browser blocked the request:\n\n1. Check if you're using a VPN\n2. Try incognito mode\n3. Contact support if issue continues"
      }
      
      setError(displayError)
    } finally {
      setIsLoading(false)
      console.log('📱 FETCH PHONE NUMBERS END');
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/settings/phone-numbers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !currentStatus })
      })
      if (response.ok) fetchPhoneNumbers()
    } catch (error) {
      console.error("Error updating phone number:", error)
    }
  }

  const testConnection = async (id: string) => {
    try {
      setTestingId(id)
      const response = await fetch(`${API_URL}/settings/phone-numbers/${id}/test`, {
        method: 'POST',
        headers: getHeaders()
      })

      const result = await response.json()
      if (response.ok) {
        alert('Connection successful!')
        fetchPhoneNumbers()
      } else {
        alert('Connection test failed: ' + result.message)
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      alert('Connection test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleConnectWhatsAppFBLogin = () => {
    try {
      console.log('🎯 Initiating Facebook Business Login for WhatsApp...')
      
      // Check if FB SDK is loaded
      if (typeof window.launchWhatsAppSignup === 'undefined') {
        setError('Facebook SDK not loaded. Please refresh the page.')
        return
      }
      
      // Store return URL
      localStorage.setItem('oauth_return_to', '/dashboard/settings?tab=whatsapp')
      
      // Show loading state while OAuth is in progress
      setIsLoading(true)
      setError("")
      
      // Add a timeout to handle cases where callback never fires
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ OAuth callback timeout - checking if token was exchanged anyway')
        // Try to fetch phone numbers after 5 seconds
        fetchPhoneNumbers().then(() => {
          setIsLoading(false)
        })
      }, 5000)
      
      // Clear timeout when callback fires
      const originalCallback = window.fbLoginCallback
      window.fbLoginCallback = function(response) {
        clearTimeout(timeoutId)
        console.log('✅ Facebook Business Login callback fired')
        if (originalCallback) {
          originalCallback.call(this, response)
        }
      }
      
      // Launch the Facebook Business Login flow
      window.launchWhatsAppSignup()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate login'
      console.error('❌ Error:', errorMsg)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const deletePhoneNumber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return
    try {
      const response = await fetch(`${API_URL}/settings/phone-numbers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (response.ok) {
        alert('Phone number deleted successfully')
        //fetchPhoneNumbers()
         await fetchPhoneNumbers()
          await fetchProfile()

      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete phone number')
      }
    } catch (error) {
      console.error("Error deleting phone number:", error)
      alert('Failed to delete phone number')
    }
  }

  // Fetch profile data from backend
  const fetchProfile = async () => {
    try {
      const token = authService.getToken()
      const user = authService.getCurrentUser()
      
      const response = await fetch(`${API_URL}/settings/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile fetched:', data.profile)
        console.log('✅ WhatsApp Config:', data.whatsappConfig)
        
        // Populate form with fetched data including WhatsApp config
        setProfileData({
          name: data.profile?.name || '',
          email: data.profile?.email || '',
          company: data.profile?.company || '',
          phone: data.profile?.phone || '',
          timezone: data.profile?.timezone || 'Asia/Kolkata',
          accountId: data.profile?.accountId || user?.accountId || '',
          userId: data.profile?._id || user?.id || '',
          wabaId: data.whatsappConfig?.wabaId || '',
          businessId: data.whatsappConfig?.businessId || '',
          isWhatsAppConnected: data.whatsappConfig?.isConnected || false,
          subdomain: data.profile?.subdomain || ''
        })
      } else {
        console.error('Failed to fetch profile:', response.status)
        // Use user data from local storage as fallback
        if (user) {
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            company: '',
            phone: '',
            timezone: 'Asia/Kolkata',
            accountId: user.accountId || '',
            userId: user.id || '',
            wabaId: '',
            businessId: '',
            isWhatsAppConnected: false,
            subdomain: ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      setTransactionsError(null)

      const token = authService.getToken()
      if (!token) {
        setTransactionsError('Authentication required')
        return
      }

      // Fetch organizations data
      const response = await fetch(`${API_URL}/admin/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      const orgs = data.data || []
      
      // Convert organizations to transactions format
      const transactionsList: any[] = []
      
      orgs.forEach((org: any) => {
        // Add organization signup transaction
        transactionsList.push({
          id: `signup-${org._id}`,
          date: org.createdAt,
          organization: org.name,
          email: org.email,
          type: 'signup',
          description: `Signup - ${org.plan} plan`,
          plan: org.plan,
          amount: 0,
          status: 'completed',
          billingCycle: org.billingCycle,
          nextBillingDate: org.nextBillingDate
        })

        // Add billing cycle transaction if next billing date exists
        if (org.nextBillingDate) {
          transactionsList.push({
            id: `billing-${org._id}`,
            date: org.nextBillingDate,
            organization: org.name,
            email: org.email,
            type: 'billing',
            description: `${org.billingCycle} billing cycle`,
            plan: org.plan,
            amount: 0,
            status: 'scheduled',
            billingCycle: org.billingCycle,
            nextBillingDate: org.nextBillingDate
          })
        }

        // Add payment transaction if payments exist
        if (org.totalPayments && org.totalPayments > 0) {
          transactionsList.push({
            id: `payment-${org._id}`,
            date: org.createdAt,
            organization: org.name,
            email: org.email,
            type: 'payment',
            description: `Payment received`,
            plan: org.plan,
            amount: org.totalPayments,
            status: 'completed',
            billingCycle: org.billingCycle,
            nextBillingDate: org.nextBillingDate
          })
        }
      })

      // Sort by date descending
      transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setTransactions(transactionsList)
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Profile handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/settings/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      })
      if (response.ok) {
        alert('Profile updated successfully')
        fetchProfile() // Refresh the data
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert('Failed to update profile')
    }
  }

  // Utility function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  // API Keys handlers
  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/api-keys`, {
        headers: getHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      } else {
        let errorMessage = `HTTP ${response.status} ${response.statusText || ''}`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const errorBody = await response.json()
            errorMessage = errorBody.message || errorBody.error || errorMessage
          }
        } catch (e) {
          // Ignore parsing errors
        }
        console.error("❌ Failed to fetch API keys:", { 
          status: response.status, 
          message: errorMessage 
        })
      }
    } catch (error: any) {
      console.error("❌ Error fetching API keys:", error?.message || String(error))
    }
  }

  // Tenant Account Management
  const fetchTenantAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/admin/accounts`, {
        headers: getHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setTenantAccounts(data.accounts || [])
      } else {
        let errorMessage = `HTTP ${response.status} ${response.statusText || ''}`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const errorBody = await response.json()
            errorMessage = errorBody.message || errorBody.error || errorMessage
          }
        } catch (e) {
          // Ignore parsing errors
        }
        console.error("❌ Failed to fetch tenant accounts:", { 
          status: response.status, 
          message: errorMessage 
        })
      }
    } catch (error: any) {
      console.error("❌ Error fetching tenant accounts:", error?.message || String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const generateMyApiKey = async () => {
    if (!confirm('Generate new Integration Token for Enromatics?\n\nThis will create a token you can use to connect Enromatics with your WhatsApp Business Account.')) return
    
    try {
      const token = authService.getToken()
      console.log("🔑 Token Generation Debug:");
      console.log("  ✅ Has JWT Token:", !!token);
      
      if (!token) {
        console.error("  ❌ No JWT token found - user may not be authenticated");
        alert('Not authenticated. Please login again.');
        router.push('/login');
        return;
      }
      
      console.log("  📍 API URL:", `${API_URL}/account/integration-token`);
      
      const headers = getHeaders()
      console.log("  📤 Headers:", { 
        hasAuth: !!headers.Authorization,
        authLength: headers.Authorization?.length || 0,
        contentType: headers['Content-Type']
      });
      
      console.log("  📡 Sending request...");
      
      const response = await fetch(`${API_URL}/account/integration-token`, {
        method: 'POST',
        headers: headers
      })

      console.log("  📥 Response Status:", response.status, response.statusText);
      
      const result = await response.json()
      console.log("  📦 Response Body:", {
        success: result.success,
        hasToken: !!result.integrationToken,
        message: result.message,
        error: result.error
      });
      
      if (response.ok && result.integrationToken) {
        setNewApiKey(result.integrationToken)
        setShowApiKeyModal(true)
        console.log("✅ Integration Token generated successfully")
        console.log(response)
        console.log(result)
      } else {
        const errorMsg = result.message || result.error || `HTTP ${response.status}`
        console.error("❌ Token generation failed:", errorMsg);
        
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          router.push('/login');
        } else if (response.status === 404) {
          alert('Account not found. Please contact support.');
        } else {
          alert('Failed to generate token:\n\n' + errorMsg)
        }
      }
    } catch (error: any) {
      console.error("❌ Error generating integration token:", {
        message: error?.message,
        stack: error?.stack
      });
      alert('Failed to generate token: ' + error?.message)
    }
  }

  const generateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKeyName.trim()) {
      alert('Please enter a name for the API key')
      return
    }
    try {
      const response = await fetch(`${API_URL}/settings/api-keys`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: apiKeyName })
      })
      const result = await response.json()
      if (response.ok) {
        setNewApiKey(result.apiKey)
        setShowApiKeyModal(true)
        fetchApiKeys()
        setApiKeyName('')
      } else {
        alert('Failed to generate API key: ' + result.message)
      }
    } catch (error) {
      console.error("Error generating API key:", error)
      alert('Failed to generate API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return
    try {
      const response = await fetch(`${API_URL}/settings/api-keys/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (response.ok) {
        alert('API key deleted successfully')
        fetchApiKeys()
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      alert('Failed to delete API key')
    }
  }

  // Security handlers
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    try {
      const response = await fetch(`${API_URL}/settings/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      if (response.ok) {
        alert('Password changed successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const result = await response.json()
        alert('Failed to change password: ' + result.message)
      }
    } catch (error) {
      console.error("Error changing password:", error)
      alert('Failed to change password')
    }
  }

  // Initial load and authentication check
  // Initial load and authentication check
  useEffect(() => {
    const initializePage = async () => {
      const token = authService.getToken()
      const isAuth = authService.isAuthenticated()
      const user = authService.getCurrentUser()
      
      console.log('🔐 Settings Page Init:');
      console.log('  Auth Status:', isAuth);
      console.log('  Has Token:', !!token);
      console.log('  Token Length:', token?.length || 0);
      console.log('  Current User:', user?.email);
      console.log('  Current Account ID:', user?.accountId);
      
      if (!isAuth || !token) {
        console.error('❌ Not authenticated - redirecting to login');
        router.push('/login');
        return;
      }
      
      // Load initial data
      console.log('📱 Calling fetchPhoneNumbers...');
      fetchPhoneNumbers()
    }
    
    initializePage()
  }, [])

  // Reload data when tab changes
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      fetchPhoneNumbers()
    } else if (activeTab === 'api-keys') {
      fetchApiKeys()
    } else if (activeTab === 'profile') {
      fetchProfile()
    } else if (activeTab === 'transactions') {
      fetchTransactions()
    }
  }, [activeTab])

  // WhatsApp Embedded Signup Message Handler
  useEffect(() => {
    const handleEmbeddedSignup = (event: CustomEvent) => {
      const signupData = event.detail
      console.log('✅ WhatsApp Embedded Signup Session Data:', signupData)
      
      try {
        // Extract session info from signup data
        const { phone_number_id, waba_id, business_account_id, access_token, phone_number, display_name, status } = signupData
        
        if (phone_number_id && waba_id && access_token) {
          console.log('📲 Signup Data Extracted:')
          console.log('  Phone Number ID:', phone_number_id)
          console.log('  WABA ID:', waba_id)
          console.log('  Business Account ID:', business_account_id)
          console.log('  Phone:', phone_number)
          console.log('  Display Name:', display_name)
          console.log('  Status:', status)
          
          // Store to sessionStorage for later use
          sessionStorage.setItem('pending_wa_signup', JSON.stringify({
            phoneNumberId: phone_number_id,
            wabaId: waba_id,
            businessAccountId: business_account_id,
            accessToken: access_token,
            phoneNumber: phone_number,
            displayName: display_name,
            signupTime: new Date().toISOString()
          }))
          
          // Refresh phone numbers list to show new connection
          setTimeout(() => {
            console.log('🔄 Refreshing phone numbers after Embedded Signup...')
            fetchPhoneNumbers()
          }, 1000)
          
          // Show success notification
          setError("")
        }
      } catch (error) {
        console.error('❌ Error handling WhatsApp Embedded Signup:', error)
      }
    }
    
    // Listen for the custom event dispatched from layout
    window.addEventListener('wa_embedded_signup' as any, handleEmbeddedSignup as any)
    
    return () => {
      window.removeEventListener('wa_embedded_signup' as any, handleEmbeddedSignup as any)
    }
  }, [])

  // Facebook Business Login Success Handler
  useEffect(() => {
    const handleFBLoginSuccess = async (event: CustomEvent) => {
      const { code } = event.detail
      console.log('📲 Facebook Business Login Success Event - Code:', code.substring(0, 20) + '...')
      console.log('🔄 Now exchanging code for WhatsApp access token...')
      
      try {
        // Exchange code with backend for System User token
        const token = authService.getToken()
        const response = await fetch(`${API_URL}/integrations/whatsapp/oauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            code: code,
            method: 'fb_business_login' // Indicate this came from FB.login()
          })
        })
        
        console.log('📨 OAuth Exchange Response Status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ OAuth Exchange Success:', {
            success: data.success,
            message: data.message,
            phoneCount: data.phoneCount || 0,
            status: data.status
          })
          
          // Give backend a moment to sync everything
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Refresh phone numbers list
          console.log('🔄 Refreshing phone numbers...')
          await fetchPhoneNumbers()
          setError("")
          
          console.log('✅ WhatsApp connection complete! Page should now show your phone number.')
        } else {
          const errorData = await response.json()
          console.error('❌ OAuth Exchange Failed:', errorData)
          setError(errorData.message || 'Failed to connect WhatsApp account')
          setIsLoading(false)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Connection error'
        console.error('❌ Error exchanging code:', errorMsg)
        setError(errorMsg)
        setIsLoading(false)
      }
    }
    
    // Listen for Facebook Business Login success event
    window.addEventListener('fb_login_success' as any, handleFBLoginSuccess as any)
    
    return () => {
      window.removeEventListener('fb_login_success' as any, handleFBLoginSuccess as any)
    }
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and WhatsApp configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-1">
              {[
                { name: "WhatsApp Setup", icon: MessageSquare, id: 'whatsapp' },
                { name: "Profile", icon: User, id: 'profile' },
                { name: "Transactions", icon: CreditCard, id: 'transactions' },
                { name: "API Keys", icon: Key, id: 'api-keys' },
                { name: "Security", icon: Lock, id: 'security' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === item.id ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'whatsapp' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">WhatsApp Business Accounts</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your connected WhatsApp Business numbers</p>
                </div>
              </div>

              {/* Available Connection Summary */}
              {!isLoading && phoneNumbers.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">✅ Available Connection</h3>
                      <p className="text-sm text-green-700 mt-1">
                        {phoneNumbers.length} WhatsApp Business {phoneNumbers.length === 1 ? 'account' : 'accounts'} connected
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{phoneNumbers.length}</div>
                      <div className="text-xs text-green-600">
                        {phoneNumbers.filter(p => p.isActive).length} Active
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Display */}
              {error && (
                <div className="mb-6 p-4 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-Green-900">Refresh the page if connection not updated</h3>
                      <p className="text-red-700 text-sm mt-1 whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : phoneNumbers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">No WhatsApp numbers connected</p>
                  <p className="text-sm text-gray-500 mb-4">Connect your WhatsApp Business Account securely via Meta</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleConnectWhatsAppFBLogin}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Connect WhatsApp
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phoneNumbers.map((phone) => (
                    <div key={phone._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{phone.displayName}</h3>
                            {phone.isActive && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Phone Number</p>
                              <p className="font-medium text-gray-900">{phone.phone || phone.displayPhone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Phone Number ID</p>
                              <p className="font-mono text-xs text-gray-900">{phone.phoneNumberId}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">WABA ID</p>
                              <p className="font-mono text-xs text-gray-900">{phone.wabaId}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Messages Sent</p>
                              <p className="font-medium text-gray-900">{phone.messageCount?.sent || 0}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection(phone._id)}
                            disabled={testingId === phone._id}
                            title="Test connection"
                          >
                            <RefreshCw className={`h-4 w-4 ${testingId === phone._id ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(phone._id, phone.isActive)}
                            className={phone.isActive ? 'border-green-600 text-green-600' : ''}
                            title={phone.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {phone.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePhoneNumber(phone._id)}
                            className="text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-600 mb-3">Want to connect another WhatsApp account?</p>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleConnectWhatsAppFBLogin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Another WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'profile' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEDT)</option>
                    </select>
                  </div>
                  
                  {/* Account ID and User ID (Read-only) */}
                  <div className="md:col-span-2 border-t pt-6 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Account & User Identifiers
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileData.accountId}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(profileData.accountId)
                              alert('Account ID copied to clipboard!')
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileData.userId}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(profileData.userId)
                              alert('User ID copied to clipboard!')
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* WhatsApp Configuration (Read-only) */}
                  <div className="md:col-span-2 border-t pt-6 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      WhatsApp Configuration
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WABA ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileData.wabaId || 'Not connected'}
                            readOnly
                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm ${!profileData.wabaId ? 'text-gray-400' : ''}`}
                          />
                          {profileData.wabaId && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(profileData.wabaId)
                                alert('WABA ID copied!')
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileData.businessId || 'Not connected'}
                            readOnly
                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm ${!profileData.businessId ? 'text-gray-400' : ''}`}
                          />
                          {profileData.businessId && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(profileData.businessId)
                                alert('Business ID copied!')
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Connection Status
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                          {profileData.isWhatsAppConnected ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-gray-900">
                                ✅ WhatsApp connected and synchronized
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-orange-500" />
                              <span className="text-gray-700">
                                ⚠️ WhatsApp not yet connected. Complete OAuth setup to connect.
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </form>
            </div>
          ) : activeTab === 'transactions' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Transactions</h2>
              <p className="text-sm text-gray-600 mb-6">View your transaction history</p>

              {transactionsError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{transactionsError}</p>
                </div>
              )}

              {transactionsLoading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Your transactions will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Organization</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction: any) => (
                        <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'payment'
                                ? 'bg-red-100 text-red-800'
                                : transaction.type === 'billing'
                                ? 'bg-blue-100 text-blue-800'
                                : transaction.type === 'signup'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.type === 'payment'
                                ? 'Payment'
                                : transaction.type === 'billing'
                                ? 'Billing'
                                : transaction.type === 'signup'
                                ? 'Signup'
                                : 'Transaction'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {transaction.organization}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {transaction.amount > 0 ? `₹${transaction.amount.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'scheduled'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status === 'completed'
                                ? 'Completed'
                                : transaction.status === 'scheduled'
                                ? 'Scheduled'
                                : transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'api-keys' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Enromatics Integration</h2>
                <p className="text-sm text-gray-600 mt-1">Generate an integration token to connect Enromatics with your WhatsApp Business Account</p>
              </div>

              <div className="space-y-6">
                {/* Integration Token Generation */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <Key className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Integration Token</h3>
                    <p className="text-gray-600 mb-6">Click the button below to generate a token for Enromatics connection</p>
                    
                    <Button
                      onClick={generateMyApiKey}
                      className="bg-green-600 hover:bg-green-700 px-6 py-2"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Generate Integration Token
                    </Button>
                    
                  </div>
                </div>

                {/* Usage Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-3">📌 How to use in Enromatics:</p>
                  <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                    <li>Click "Generate Integration Token" button above</li>
                    <li>Copy the entire token (starts with <code className="bg-blue-100 px-2 py-1 rounded">wpi_int_</code>)</li>
                    <li>Go to Enromatics Dashboard</li>
                    <li>Navigate to Integrations → WhatsApp Configuration</li>
                    <li>Paste the token in the Token/API Key field</li>
                    <li>Click "Test Connection" to verify</li>
                    <li>Save your configuration</li>
                  </ol>
                </div>

                {/* Token Format Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">🔑 Token Format:</p>
                  <p className="text-sm text-gray-700 font-mono bg-white px-3 py-2 rounded border border-gray-300">
                    wpi_int_[64 random characters]
                  </p>
                </div>

              {/* 🔑 Integration Token Modal */}
{showApiKeyModal && newApiKey && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">
        Integration Token Generated
      </h3>

      <p className="text-sm text-gray-600">
        Copy and save this token now. You won’t be able to see it again.
      </p>

      <code className="block w-full bg-gray-100 border border-gray-300 rounded p-3 text-sm font-mono break-all">
        {newApiKey}
      </code>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(newApiKey)
            alert("Token copied to clipboard")
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Copy
        </button>

        <button
          onClick={() => {
            setShowApiKeyModal(false)
            setNewApiKey(null)
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



                {/* Security Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Security Tips:</p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Keep your token private - never share it publicly</li>
                    <li>If compromised, revoke and generate a new token</li>
                    <li>The token will work immediately after generation</li>
                    <li>You can only have one active integration token</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-8">
                {/* Change Password Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                          placeholder="Enter new password (min 8 characters)"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </form>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Enable 2FA
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Current Session</p>
                          <p className="text-sm text-gray-600">macOS • Chrome • Last active: Now</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
