"use client"

import { useState, useEffect } from "react"
import { MessageSquare, User, Lock, Shield, Plus, Trash2, CheckCircle, XCircle, RefreshCw, Phone, X } from "lucide-react"
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    displayName: '',
    displayPhone: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
  const API_KEY = "wpk_live_f0b8a01652eb0b9950484f3b4674bd800e9e3e9a216f200f34b0502a0591ac5d"

  const fetchPhoneNumbers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/settings/phone-numbers`, {
        headers: { "Authorization": `Bearer ${API_KEY}` }
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
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
        headers: { "Authorization": `Bearer ${API_KEY}` }
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
        headers: { "Authorization": `Bearer ${API_KEY}` }
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

  useEffect(() => {
    fetchPhoneNumbers()
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
                { name: "API Keys", icon: Shield, id: 'api-keys' },
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
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {activeTab === 'profile' ? 'Profile' : activeTab === 'api-keys' ? 'API Keys' : 'Security'} Settings
              </h2>
              <div className="text-center py-12 text-gray-500">
                Coming soon...
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
    </div>
  )
}
