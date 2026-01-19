"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Send, AlertCircle, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Contact {
  _id: string
  name: string
  phone: string
  whatsappNumber: string
  type?: string
}

interface BroadcastFormData {
  name: string
  messageType: "text" | "template" | "media"
  content: {
    text: string
    templateName: string
    templateParams: string[]
    mediaUrl: string
    mediaType: string
  }
  recipientList: string
  recipients: {
    phoneNumbers: string[]
    contactIds: string[]
  }
  throttleRate: number
}

export default function CreateBroadcastPage() {
  const router = useRouter()
  const user = authService.getCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recipientMode, setRecipientMode] = useState<"manual" | "contacts">("manual")

  const [formData, setFormData] = useState<BroadcastFormData>({
    name: "",
    messageType: "text",
    content: {
      text: "",
      templateName: "",
      templateParams: [],
      mediaUrl: "",
      mediaType: ""
    },
    recipientList: "manual",
    recipients: {
      phoneNumbers: [],
      contactIds: []
    },
    throttleRate: 50
  })

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) throw new Error("Failed to fetch contacts")

      const data = await response.json()
      
      if (data.success && data.contacts) {
        setContacts(data.contacts)
      }
    } catch (err) {
      console.error("Error fetching contacts:", err)
    } finally {
      setLoadingContacts(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.whatsappNumber.includes(searchQuery) ||
    contact.phone.includes(searchQuery)
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [name]: value
      }
    }))
  }

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...formData.recipients.phoneNumbers]
    newPhoneNumbers[index] = value
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        phoneNumbers: newPhoneNumbers
      }
    }))
  }

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        phoneNumbers: [...prev.recipients.phoneNumbers, ""]
      }
    }))
  }

  const removePhoneNumber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        phoneNumbers: prev.recipients.phoneNumbers.filter((_, i) => i !== index)
      }
    }))
  }

  const toggleContactSelection = (contactId: string) => {
    setFormData(prev => {
      const contactIds = prev.recipients.contactIds
      if (contactIds.includes(contactId)) {
        return {
          ...prev,
          recipients: {
            ...prev.recipients,
            contactIds: contactIds.filter(id => id !== contactId)
          }
        }
      } else {
        return {
          ...prev,
          recipients: {
            ...prev.recipients,
            contactIds: [...contactIds, contactId]
          }
        }
      }
    })
  }

  const selectAllFilteredContacts = () => {
    const allContactIds = filteredContacts.map(c => c._id)
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        contactIds: Array.from(new Set([...prev.recipients.contactIds, ...allContactIds]))
      }
    }))
  }

  const clearAllContacts = () => {
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        contactIds: []
      }
    }))
  }

  const getPhoneNumbersFromContacts = () => {
    const selectedContacts = contacts.filter(c => formData.recipients.contactIds.includes(c._id))
    return selectedContacts.map(c => c.whatsappNumber || c.phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.accountId) {
      setError("User not authenticated")
      return
    }

    if (!formData.name.trim()) {
      setError("Campaign name is required")
      return
    }

    if (!formData.content.text && formData.messageType === "text") {
      setError("Message content is required")
      return
    }

    const phoneNumbers = recipientMode === "contacts" 
      ? getPhoneNumbersFromContacts()
      : formData.recipients.phoneNumbers.filter(p => p.trim())

    if (phoneNumbers.length === 0) {
      setError("At least one recipient is required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/broadcasts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            recipients: {
              phoneNumbers,
              contactIds: formData.recipients.contactIds
            }
          })
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create broadcast")
      }

      const data = await response.json()
      
      if (data.success) {
        router.push(`/dashboard/broadcasts`)
      } else {
        setError(data.error || "Failed to create broadcast")
      }
    } catch (err) {
      console.error("Error creating broadcast:", err)
      setError(err instanceof Error ? err.message : "Failed to create broadcast")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/broadcasts">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Broadcast</h1>
              <p className="text-gray-600 mt-1">Send messages to multiple contacts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Summer Sale 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Message Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message Type
            </label>
            <select
              name="messageType"
              value={formData.messageType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="text">Text Message</option>
              <option value="template">Template</option>
              <option value="media">Media</option>
            </select>
          </div>

          {/* Message Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message Content
            </label>
            {formData.messageType === "text" && (
              <textarea
                name="text"
                value={formData.content.text}
                onChange={handleContentChange}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
            {formData.messageType === "template" && (
              <input
                type="text"
                name="templateName"
                value={formData.content.templateName}
                onChange={handleContentChange}
                placeholder="Template name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
            {formData.messageType === "media" && (
              <input
                type="url"
                name="mediaUrl"
                value={formData.content.mediaUrl}
                onChange={handleContentChange}
                placeholder="Media URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Recipients
            </label>
            
            {/* Mode Selection */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientMode"
                  value="manual"
                  checked={recipientMode === "manual"}
                  onChange={(e) => setRecipientMode("manual")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Manual Entry</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientMode"
                  value="contacts"
                  checked={recipientMode === "contacts"}
                  onChange={(e) => setRecipientMode("contacts")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Select from Contacts ({contacts.length})</span>
              </label>
            </div>

            {/* Manual Entry Mode */}
            {recipientMode === "manual" && (
              <div className="space-y-3">
                {formData.recipients.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                      placeholder="Enter phone number (+1234567890)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoneNumber(index)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhoneNumber}
                  className="w-full px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 font-medium"
                >
                  + Add Phone Number
                </button>
              </div>
            )}

            {/* Contacts Selection Mode */}
            {recipientMode === "contacts" && (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Bulk Actions */}
                {filteredContacts.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllFilteredContacts}
                      className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium"
                    >
                      Select All ({filteredContacts.length})
                    </button>
                    {formData.recipients.contactIds.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllContacts}
                        className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}

                {/* Selected Count */}
                {formData.recipients.contactIds.length > 0 && (
                  <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {formData.recipients.contactIds.length} contact(s) selected
                  </div>
                )}

                {/* Contacts List */}
                {loadingContacts ? (
                  <div className="text-center py-4 text-gray-600">Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-4 text-gray-600">
                    {contacts.length === 0 ? "No contacts available" : "No matching contacts"}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg divide-y max-h-64 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <label
                        key={contact._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.recipients.contactIds.includes(contact._id)}
                          onChange={() => toggleContactSelection(contact._id)}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                          <p className="text-sm text-gray-600 truncate">{contact.whatsappNumber || contact.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Throttle Rate */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Send Rate (messages per second)
            </label>
            <input
              type="number"
              name="throttleRate"
              value={formData.throttleRate}
              onChange={handleInputChange}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">Recommended: 1-50 messages per second to avoid WhatsApp rate limits</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Link href="/dashboard/broadcasts" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Broadcast
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
