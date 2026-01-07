"use client"

import { useState, useEffect } from "react"
import { MessageSquare, User, Lock, Shield, Plus, Trash2, CheckCircle, XCircle, RefreshCw, Phone, X, Copy, Eye, EyeOff, Key } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PhoneNumber {
  _id: string
  phoneNumberId: string
  wabaId: string
  displayName: string
  displayPhone: string
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
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [myAccount, setMyAccount] = useState<MyAccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [testingId, setTestingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    displayName: '',
    displayPhone: ''
  })
  const [tenantFormData, setTenantFormData] = useState({
    accountName: 'John Doe',
    email: 'john@example.com',
    company: 'My Company',
    phone: '+1 234 567 8900',
    timezone: 'America/New_York'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [apiKeyName, setApiKeyName] = useState('')
  const [tenantAccounts, setTenantAccounts] = useState<any[]>([])
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [newTenantKey, setNewTenantKey] = useState('')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    timezone: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

  const fetchPhoneNumbers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/settings/phone-numbers`, {
        credentials: 'include' // Session cookie
      })
      if (response.ok) {
        const data = await response.json()
        setPhoneNumbers(data.phoneNumbers || [])
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPhoneNumber = async () => {
    if (!formData.phoneNumberId || !formData.wabaId || !formData.accessToken) {
      alert('Please fill all required fields')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/settings/phone-numbers`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (response.ok) {
        alert('Phone number added successfully')
        fetchPhoneNumbers()
        setShowAddModal(false)
        setFormData({ phoneNumberId: '', wabaId: '', accessToken: '', displayName: '', displayPhone: '' })
      } else {
        alert('Failed to add phone number: ' + result.message)
      }
    } catch (error) {
      console.error("Error adding phone number:", error)
      alert('Failed to add phone number')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/settings/phone-numbers/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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
      const response = await fetch(`${API_URL}/api/settings/phone-numbers/${id}/test`, {
        method: 'POST',
        credentials: 'include'
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

  const deletePhoneNumber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return
    try {
      const response = await fetch(`${API_URL}/api/settings/phone-numbers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        alert('Phone number deleted successfully')
        fetchPhoneNumbers()
      }
    } catch (error) {
      console.error("Error deleting phone number:", error)
      alert('Failed to delete phone number')
    }
  }

  // Profile handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/settings/profile`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          credentials: 'include'
        },
        body: JSON.stringify(profileData)
      })
      if (response.ok) {
        alert('Profile updated successfully')
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
      const response = await fetch(`${API_URL}/api/settings/api-keys`, {
        headers: { credentials: 'include' }
      })
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    }
  }

  // Tenant Account Management
  const fetchTenantAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/admin/accounts`, {
        headers: { credentials: 'include' }
      })
      if (response.ok) {
        const data = await response.json()
        setTenantAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Error fetching tenant accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // My Account API Key Management
  const fetchMyAccount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/account`, {
        headers: { credentials: 'include' }
      })
      if (response.ok) {
        const data = await response.json()
        setMyAccount(data.account || null)
      }
    } catch (error) {
      console.error("Error fetching account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMyApiKey = async () => {
    if (!confirm('Generate new API key? This will invalidate your current key if one exists!')) return
    
    try {
      const response = await fetch(`${API_URL}/api/account/api-key/generate`, {
        method: 'POST',
        headers: { credentials: 'include' }
      })

      const result = await response.json()
      if (response.ok) {
        setNewApiKey(result.apiKey)
        setShowApiKeyModal(true)
        fetchMyAccount()
      } else {
        alert('Failed to generate API key: ' + result.message)
      }
    } catch (error) {
      console.error("Error generating API key:", error)
      alert('Failed to generate API key')
    }
  }

  const generateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKeyName.trim()) {
      alert('Please enter a name for the API key')
      return
    }
    try {
      const response = await fetch(`${API_URL}/api/settings/api-keys`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          credentials: 'include'
        },
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
      const response = await fetch(`${API_URL}/api/settings/api-keys/${id}`, {
        method: 'DELETE',
        headers: { credentials: 'include' }
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
      const response = await fetch(`${API_URL}/api/settings/change-password`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          credentials: 'include'
        },
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

  useEffect(() => {
    fetchPhoneNumbers()
    if (activeTab === 'api-keys') {
      fetchTenantAccounts()
    }
  }, [activeTab])

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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">WhatsApp Business Accounts</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your connected WhatsApp Business numbers</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Number
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : phoneNumbers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">No WhatsApp numbers connected</p>
                  <p className="text-sm text-gray-500 mb-4">Add your first WhatsApp Business number</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phone Number
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
                              <p className="font-medium text-gray-900">{phone.displayPhone}</p>
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
                          >
                            <RefreshCw className={`h-4 w-4 ${testingId === phone._id ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(phone._id, phone.isActive)}
                            className={phone.isActive ? 'border-green-600 text-green-600' : ''}
                          >
                            {phone.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePhoneNumber(phone._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </form>
            </div>
          ) : activeTab === 'api-keys' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-600 mt-1">Generate API keys for your WhatsApp Business Account</p>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Loading...</p>
                </div>
              ) : !myAccount ? (
                <div className="text-center py-12 text-gray-500">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Account not found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Your Account</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Account ID</p>
                        <p className="font-medium text-gray-900">{myAccount.accountId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{myAccount.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">WhatsApp Number</p>
                        <p className="font-medium text-gray-900">{myAccount.displayPhone || phoneNumbers[0]?.displayPhone || 'Not connected'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Business Account ID</p>
                        <p className="font-mono text-xs text-gray-900">{myAccount.wabaId || phoneNumbers[0]?.wabaId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* API Key Section */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Key className="h-5 w-5 text-green-600" />
                          API Key
                        </h3>
                        <p className="text-sm text-gray-600">
                          Use this key to connect Enromatics or other applications to your WhatsApp Business Account
                        </p>
                      </div>
                    </div>

                    {myAccount.apiKeyPrefix ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Current API Key</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                          </div>
                          <p className="font-mono text-sm text-gray-900 mb-3">{myAccount.apiKeyPrefix}••••••••••••••••</p>
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                              <p>Created</p>
                              <p className="font-medium text-gray-900">{myAccount.apiKeyCreatedAt ? formatDate(myAccount.apiKeyCreatedAt) : 'Unknown'}</p>
                            </div>
                            <div>
                              <p>Last Used</p>
                              <p className="font-medium text-gray-900">{myAccount.apiKeyLastUsedAt ? formatDate(myAccount.apiKeyLastUsedAt) : 'Never'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={generateMyApiKey}
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-1">No API key generated</p>
                        <p className="text-sm text-gray-500 mb-4">Generate an API key to connect to external applications</p>
                        <Button
                          onClick={generateMyApiKey}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Generate API Key
                        </Button>
                      </div>
                    )}

                    {/* Usage Info */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">💡 How to use in Enromatics:</p>
                      <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                        <li>Copy your API key from above</li>
                        <li>Go to Enromatics Settings → WhatsApp Configuration</li>
                        <li>Paste the API key</li>
                        <li>Save and test the connection</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add WhatsApp Business Number</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID *</label>
                <input
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="889344924259692"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WABA ID *</label>
                <input
                  type="text"
                  value={formData.wabaId}
                  onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="1536545574042607"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token *</label>
                <textarea
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-xs"
                  placeholder="EAAaBZBc8vE3c..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Optional)</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="My Business WhatsApp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Phone (Optional)</label>
                <input
                  type="text"
                  value={formData.displayPhone}
                  onChange={(e) => setFormData({ ...formData, displayPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="flex gap-2 p-6 border-t justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={addPhoneNumber}>
                Add Phone Number
              </Button>
            </div>
          </div>
        </div>
      )}

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">API Key Generated</h2>
              <button onClick={() => setShowApiKeyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Important: Save this API key now!</p>
                <p className="text-sm text-yellow-700">
                  This is the only time you'll see the full API key. Store it securely.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newApiKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(newApiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-6 border-t justify-end">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowApiKeyModal(false)}>
                I've Saved My Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant API Key Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tenant Account Created!</h3>
                  <p className="text-sm text-gray-600">API key generated successfully</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Important: Save This Key</p>
                <p className="text-sm text-yellow-700">
                  This is the only time you'll see the full API key. 
                  Give this to your customer to integrate with the platform.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTenantKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm text-gray-900"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      copyToClipboard(newTenantKey)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Usage Example:</p>
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`fetch('${API_URL}/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${newTenantKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Hello!'
  })
})`}
                </pre>
              </div>
            </div>

            <div className="flex gap-2 p-6 border-t justify-end">
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={() => {
                  setShowTenantModal(false)
                  setNewTenantKey('')
                }}
              >
                I've Saved the Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
