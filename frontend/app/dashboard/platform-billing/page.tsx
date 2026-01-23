"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, CreditCard, Users, Download, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorToast } from "@/components/ErrorToast"
import { API_URL } from "@/lib/config/api"

export default function PlatformBillingPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [lastOrgSync, setLastOrgSync] = useState<string>("")
  const [autoSyncOrgs, setAutoSyncOrgs] = useState(true)
  const [orgSyncLoading, setOrgSyncLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrganizations()
    
    // Auto-sync organizations every 30 seconds
    if (autoSyncOrgs) {
      const interval = setInterval(fetchOrganizations, 30000)
      return () => clearInterval(interval)
    }
  }, [autoSyncOrgs])

  const fetchOrganizations = async () => {
    try {
      setOrgSyncLoading(true)
      const token = localStorage.getItem('token')

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
      setLastOrgSync(new Date().toLocaleTimeString('en-IN'))
    } catch (err) {
      console.error("Error fetching organizations:", err)
    } finally {
      setOrgSyncLoading(false)
      setIsLoading(false)
    }
  }

  // Calculate stats from real organizations data
  const stats = [
    { label: "Total Organizations", value: organizations.length.toString(), change: "+2", trend: "up" },
    { label: "Active Subscriptions", value: organizations.filter(o => o.status === 'active').length.toString(), change: "+1", trend: "up" },
    { label: "Total Payment Collected", value: `₹${organizations.reduce((sum, o) => sum + (o.totalPayments || 0), 0).toLocaleString()}`, change: "+5%", trend: "up" },
    { label: "Billing Dates Set", value: `${organizations.filter(o => o.nextBillingDate).length}/${organizations.length}`, change: "100%", trend: "up" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Billing</h1>
          <p className="text-gray-600 mt-1">Monitor revenue and subscriptions across all organizations</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`} />
              <span className={`text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹2.4L</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Basic Plans</span>
              <span className="font-medium">₹45K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pro Plans</span>
              <span className="font-medium">₹96K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Enterprise Plans</span>
              <span className="font-medium">₹99K</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Successful</span>
              <span className="font-medium text-green-600">197</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Failed</span>
              <span className="font-medium text-red-600">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium text-orange-600">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trial Conversions</p>
              <p className="text-2xl font-bold text-gray-900">65%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Trials</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Converted</span>
              <span className="font-medium text-green-600">13</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expired</span>
              <span className="font-medium text-red-600">7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table - Real-time Sync */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Organizations & Subscriptions</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time billing monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrganizations}
              disabled={orgSyncLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${orgSyncLoading ? "animate-spin" : ""}`} />
              Sync Now
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncOrgs}
                onChange={(e) => setAutoSyncOrgs(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Auto Sync (30s)</span>
            </label>
            <span className="text-xs text-gray-500">Last: {lastOrgSync || 'Never'}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No organizations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Billing Cycle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Payments</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Next Billing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const nextBillingDate = org.nextBillingDate ? new Date(org.nextBillingDate) : null
                  const today = new Date()
                  const daysUntil = nextBillingDate ? Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                  let billingStatus = "active"
                  if (daysUntil === null) billingStatus = "not-set"
                  else if (daysUntil < 0) billingStatus = "overdue"
                  else if (daysUntil <= 7) billingStatus = "due-soon"

                  return (
                    <tr key={org._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{org.name}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.plan === "pro"
                            ? "bg-blue-100 text-blue-700"
                            : org.plan === "enterprise"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {org.plan ? org.plan.charAt(0).toUpperCase() + org.plan.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 capitalize">{org.billingCycle || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">₹{org.totalPayments || '0'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.status === 'active'
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {nextBillingDate ? nextBillingDate.toLocaleDateString('en-IN') : "Not Set"}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          billingStatus === 'active' ? 'bg-green-100 text-green-800' :
                          billingStatus === 'due-soon' ? 'bg-yellow-100 text-yellow-800' :
                          billingStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {billingStatus === 'active' && <CheckCircle className="h-3 w-3" />}
                          {billingStatus === 'due-soon' && <Clock className="h-3 w-3" />}
                          {billingStatus === 'overdue' && <AlertCircle className="h-3 w-3" />}
                          {billingStatus === 'active' ? 'Active' :
                           billingStatus === 'due-soon' ? `Due in ${daysUntil}d` :
                           billingStatus === 'overdue' ? `Overdue ${daysUntil ? Math.abs(daysUntil) : 0}d` :
                           'Not Set'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
