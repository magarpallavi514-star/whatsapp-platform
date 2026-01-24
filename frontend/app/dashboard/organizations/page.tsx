"use client"

import { Building2, Plus, Search, MoreVertical, Users, TrendingUp, DollarSign, Activity, X, Bell, Mail } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { ErrorToast } from "@/components/ErrorToast"
import Link from "next/link"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/config/api"

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false)
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [isPaymentLinkModal, setIsPaymentLinkModal] = useState(false)
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false)
  const [selectedOrgForEmail, setSelectedOrgForEmail] = useState<any>(null)
  const [emailType, setEmailType] = useState("payment_reminder")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    plan: "free",
    status: "active",
    billingCycle: "monthly"
  })

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        const response = await fetch(`${API_URL}/admin/organizations`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch organizations")
        }

        const data = await response.json()
        setOrganizations(data.data || [])
      } catch (err) {
        console.error("Error fetching organizations:", err)
        setError("Failed to load organizations")
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch available pricing plans
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/pricing/plans/public`)
        if (response.ok) {
          const data = await response.json()
          setAvailablePlans(data.data || [])
        }
      } catch (err) {
        console.error("Error fetching plans:", err)
      }
    }

    fetchOrganizations()
    fetchPlans()
  }, [])

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      
      // Calculate next billing date based on billing cycle
      const signupDate = new Date()
      let nextBillingDate = new Date(signupDate)
      
      if (formData.billingCycle === "monthly") {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      } else if (formData.billingCycle === "quarterly") {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
      } else if (formData.billingCycle === "annually") {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
      }
      
      const dataToSend = {
        ...formData,
        nextBillingDate: nextBillingDate.toISOString()
      }
      
      const response = await fetch(`${API_URL}/admin/organizations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error("Failed to create organization")
      }

      // Refresh organizations list
      const data = await response.json()
      setOrganizations([...organizations, data.data])
      setFormData({ name: "", email: "", countryCode: "+91", phoneNumber: "", plan: "free", status: "active", billingCycle: "monthly" })
      setIsDrawerOpen(false)
    } catch (err) {
      console.error("Error creating organization:", err)
      alert("Failed to create organization")
    }
  }

  const handleOpenDetails = async (org: any) => {
    setSelectedOrg(org)
    setEditData({ ...org })
    setIsDetailDrawerOpen(true)
    setIsEditMode(false)
    
    // Fetch invoices for this organization
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/billing/invoices?accountId=${org._id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedOrg((prev: any) => ({
          ...prev,
          _invoices: data.data || []
        }))
      }
    } catch (err) {
      console.error("Error fetching invoices:", err)
      // Continue without invoices - they'll show "No invoices" message
    }
  }

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Update form submitted")
    try {
      const token = localStorage.getItem("token")
      
      // Calculate next billing date based on signup date + billing cycle
      let dataToSend = { ...editData }
      
      const signupDate = new Date(selectedOrg.createdAt || new Date())
      let nextBillingDate = new Date(signupDate)
      
      if (editData.billingCycle === "monthly") {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      } else if (editData.billingCycle === "quarterly") {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
      } else if (editData.billingCycle === "annually") {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
      }
      
      dataToSend.nextBillingDate = nextBillingDate.toISOString()
      
      const response = await fetch(`${API_URL}/admin/organizations/${selectedOrg._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        throw new Error("Failed to update organization")
      }

      const data = await response.json()
      setOrganizations(organizations.map(org => org._id === selectedOrg._id ? data.data : org))
      setSelectedOrg(data.data)
      setEditData({ ...data.data })
      setIsEditMode(false)
      alert("Organization updated successfully")
    } catch (err) {
      console.error("Error updating organization:", err)
      alert("Failed to update organization")
    }
  }

  // 💳 Generate Payment Link for Client
  const handleGeneratePaymentLink = async () => {
    if (!selectedPlanForPayment) {
      alert("Please select a plan")
      return
    }

    try {
      setIsGeneratingPaymentLink(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/admin/organizations/${selectedOrg._id}/generate-payment-link`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planId: selectedPlanForPayment._id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate payment link")
      }

      const data = await response.json()
      
      alert(`✅ Payment link generated!\n\nInvoice: ${data.data.invoiceNumber}\nAmount: ₹${data.data.amount}\n\n📧 Email sent to client`)
      
      setIsPaymentLinkModal(false)
      setSelectedPlanForPayment(null)
      
      // Refresh organizations list
      const orgResponse = await fetch(`${API_URL}/admin/organizations`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganizations(orgData.data || [])
      }
    } catch (err) {
      console.error("Error generating payment link:", err)
      alert(`❌ ${err instanceof Error ? err.message : "Failed to generate payment link"}`)
    } finally {
      setIsGeneratingPaymentLink(false)
    }
  }

  // 📋 Create Free Invoice for Client
  const handleCreateInvoice = async () => {
    try {
      setIsGeneratingPaymentLink(true)
      const token = localStorage.getItem("token")
      
      console.log("📋 Creating invoice for:", selectedOrg?.name, "ID:", selectedOrg?._id)
      console.log("🔑 Token present:", !!token)

      const response = await fetch(`${API_URL}/admin/organizations/${selectedOrg._id}/create-invoice`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: 0,
          description: "Free account invoice"
        })
      })

      console.log("📡 Response status:", response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error("❌ API Error Response:", response.status, errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          console.error("❌ Could not parse error response")
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("✅ Invoice created:", data)
      
      alert(`✅ Free invoice created!\n\nInvoice: ${data.data.invoiceNumber}\nAmount: ₹${data.data.amount}`)
      
      setIsDetailDrawerOpen(false)
      
      // Refresh organizations list
      const orgResponse = await fetch(`${API_URL}/admin/organizations`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganizations(orgData.data || [])
      }
    } catch (err) {
      console.error("Error creating invoice:", err)
      alert(`❌ ${err instanceof Error ? err.message : "Failed to create invoice"}`)
    } finally {
      setIsGeneratingPaymentLink(false)
    }
  }


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registered Users & Organizations</h1>
          <p className="text-gray-600 mt-1">View all registered users using our services</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total Users: <span className="font-bold text-green-600">{organizations.length}</span>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Registered Users</p>
              <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{organizations.filter((o: any) => o.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined This Month</p>
              <p className="text-2xl font-bold text-gray-900">{organizations.filter((o: any) => o.createdAt?.includes("2026-01")).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loading...</p>
              <p className="text-2xl font-bold text-gray-900">Real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Registered Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading registered users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No registered users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org, index) => (
                    <tr 
                      key={index} 
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{org.email || "N/A"}</p>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{org.phoneNumber || "N/A"}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.plan === "pro"
                            ? "bg-blue-100 text-blue-700"
                            : org.plan === "starter"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {org.plan || "Free"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {org.status || "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrg(org)
                            setEditData({ ...org })
                            setIsEditMode(false)
                            setIsDetailDrawerOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrg(org)
                            setEditData({ ...org })
                            setIsEditMode(true)
                            setIsDetailDrawerOpen(true)
                          }}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrgForEmail(org)
                            setIsEmailDrawerOpen(true)
                            setEmailType("payment_reminder")
                          }}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Send Email"
                        >
                          <Mail size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Drawer with Glass Blur */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Glass Blur Background */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Organization</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleAddOrganization} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Country Code"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Create Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer - Professional View/Edit Organization */}
      {isDetailDrawerOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Glass Blur Background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setIsDetailDrawerOpen(false)
              setIsEditMode(false)
            }}
          />
          
          {/* Drawer */}
          <div className="relative w-[550px] h-full bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditMode ? "Edit Organization" : "Organization Details"}
                </h2>
                <p className="text-sm text-gray-200 mt-1">{selectedOrg.name || "N/A"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => console.log('Send notification to ' + selectedOrg.email)}
                  className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-slate-700 rounded-lg"
                  title="Send Email Notification"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  onClick={() => console.log('Send WhatsApp to ' + selectedOrg.phoneNumber)}
                  className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-slate-700 rounded-lg"
                  title="Send WhatsApp Message"
                >
                  <FaWhatsapp className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setIsDetailDrawerOpen(false)
                    setIsEditMode(false)
                  }}
                  className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditMode ? (
                <form id="editForm" onSubmit={handleUpdateOrganization} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Organization Name</label>
                    <input
                      type="text"
                      value={editData?.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Email</label>
                    <input
                      type="email"
                      value={editData?.email || ""}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      value={editData?.phoneNumber || ""}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Plan</label>
                    <select
                      value={editData?.plan || ""}
                      onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
                    <select
                      value={editData?.status || ""}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Billing Cycle</label>
                    <select
                      value={editData?.billingCycle || "monthly"}
                      onChange={(e) => setEditData({ ...editData, billingCycle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </form>
              ) : (
                <div className="p-8 space-y-8">
                  {/* Organization Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Organization Info</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Name</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrg.name || "N/A"}</p>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrg.email || "N/A"}</p>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrg.phoneNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Plan & Billing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Plan</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{selectedOrg.plan || "N/A"}</p>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Tenure</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{selectedOrg.billingCycle || "N/A"}</p>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                        <span className={`inline-block text-xs font-bold mt-1 px-3 py-1 rounded-full ${
                          selectedOrg.status === "active"
                            ? "bg-green-200 text-green-800"
                            : "bg-amber-200 text-amber-800"
                        }`}>
                          {selectedOrg.status || "N/A"}
                        </span>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Signup Date</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {selectedOrg.createdAt ? new Date(selectedOrg.createdAt).toLocaleDateString('en-IN') : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Billing Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Next Billing Date</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {selectedOrg.nextBillingDate ? new Date(selectedOrg.nextBillingDate).toLocaleDateString('en-IN') : "Not Set"}
                        </p>
                      </div>
                      <div className="px-4 py-3 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Total Payments</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">₹{selectedOrg.totalPayments || "0"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoices Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Invoices</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Invoice #</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrg._invoices && selectedOrg._invoices.length > 0 ? (
                            selectedOrg._invoices.slice(0, 3).map((invoice: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900 font-medium">{invoice.invoiceNumber}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-gray-900 font-medium">₹{invoice.totalAmount?.toFixed(2) || '0'}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <a 
                                    href={invoice.pdfUrl || '#'} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                  >
                                    Download
                                  </a>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-sm">
                                📄 No invoices yet. They will appear after payment confirmation.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="px-4 py-3 bg-gray-50 text-center text-xs text-gray-600 border-t border-gray-200">
                        💡 View all invoices in <a href="/dashboard/invoices" className="text-blue-600 hover:underline font-semibold">Invoices page</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    type="submit"
                    form="editForm"
                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-semibold text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 bg-gray-300 text-gray-900 py-2.5 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsPaymentLinkModal(true)}
                    className="flex-1 bg-green-600 text-white py-1.5 px-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-xs"
                    title="Generate payment link and create invoice"
                  >
                    💳 Generate Payment Link
                  </button>
                  <button
                    onClick={handleCreateInvoice}
                    disabled={isGeneratingPaymentLink}
                    className="flex-1 bg-blue-600 text-white py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create a free invoice for this client"
                  >
                    {isGeneratingPaymentLink ? "Creating..." : "📋 Create Invoice"}
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 bg-slate-900 text-white py-1.5 px-2 rounded-lg hover:bg-slate-800 transition-colors font-semibold text-xs"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailDrawerOpen(false)
                      setIsEditMode(false)
                    }}
                    className="flex-1 bg-gray-300 text-gray-900 py-1.5 px-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-xs"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      {isPaymentLinkModal && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPaymentLinkModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">💳 Generate Payment Link</h3>
              <button 
                onClick={() => setIsPaymentLinkModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select a plan to create invoice and send payment link to <strong>{selectedOrg.name}</strong>
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availablePlans && availablePlans.length > 0 ? (
                  availablePlans.map((plan: any) => (
                    <div 
                      key={plan._id}
                      onClick={() => setSelectedPlanForPayment(plan)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlanForPayment?._id === plan._id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{plan.monthlyPrice?.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500">/month</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No plans available</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGeneratePaymentLink}
                disabled={!selectedPlanForPayment || isGeneratingPaymentLink}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {isGeneratingPaymentLink ? "Generating..." : "Generate Link"}
              </button>
              <button
                onClick={() => setIsPaymentLinkModal(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2.5 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Drawer */}
      {isEmailDrawerOpen && selectedOrgForEmail && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsEmailDrawerOpen(false)}
          />
          <div className="relative ml-auto bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b border-gray-200 px-8 py-4 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
              <button
                onClick={() => setIsEmailDrawerOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* Organization Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  disabled
                  value={selectedOrgForEmail.name || ""}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={selectedOrgForEmail.email || ""}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 cursor-not-allowed"
                />
              </div>

              {/* Email Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="payment_reminder">Payment Reminder</option>
                  <option value="custom_message">Custom Message</option>
                  <option value="renewal_notice">Renewal Notice</option>
                </select>
              </div>

              {/* Plan Details (for payment reminder) */}
              {emailType === "payment_reminder" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-blue-900">
                    <strong>Current Plan:</strong> {selectedOrgForEmail.plan || "Free"}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Status:</strong> {selectedOrgForEmail.status || "Inactive"}
                  </p>
                  {selectedOrgForEmail.plan && selectedOrgForEmail.plan !== "free" && (
                    <p className="text-sm text-blue-900">
                      <strong>Next Billing:</strong> {selectedOrgForEmail.nextBillingDate ? new Date(selectedOrgForEmail.nextBillingDate).toLocaleDateString() : "N/A"}
                    </p>
                  )}
                </div>
              )}

              {/* Custom Message (for custom message type) */}
              {emailType === "custom_message" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-32"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex gap-3">
              <button
                onClick={async () => {
                  try {
                    setIsSendingEmail(true)
                    const token = localStorage.getItem("token")
                    
                    const response = await fetch(`${API_URL}/admin/send-payment-reminder`, {
                      method: "POST",
                      headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        accountId: selectedOrgForEmail._id,
                        emailType: emailType,
                        message: emailMessage || undefined
                      })
                    })

                    if (!response.ok) {
                      const error = await response.json()
                      throw new Error(error.message || "Failed to send email")
                    }

                    const result = await response.json()
                    console.log("Email sent successfully:", result)
                    setIsEmailDrawerOpen(false)
                    setEmailMessage("")
                  } catch (err) {
                    console.error("Error sending email:", err)
                    alert(`Error: ${err instanceof Error ? err.message : "Failed to send email"}`)
                  } finally {
                    setIsSendingEmail(false)
                  }
                }}
                disabled={isSendingEmail || (emailType === "custom_message" && !emailMessage.trim())}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {isSendingEmail ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={() => setIsEmailDrawerOpen(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2.5 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

