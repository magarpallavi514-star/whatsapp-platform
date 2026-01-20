'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Download, CreditCard, Calendar, Package, TrendingUp, ArrowUpRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/config/api'
import Link from 'next/link'

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'invoices'>('overview')
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [selectedSub, setSelectedSub] = useState<any>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      // Fetch all billing data in parallel
      const [subsRes, invoicesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/billing/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/billing/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/billing/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (subsRes.ok) {
        const data = await subsRes.json()
        setSubscriptions(data.data || [])
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json()
        setInvoices(data.data || [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'User requested' })
      })

      if (response.ok) {
        fetchBillingData()
        alert('Subscription cancelled successfully')
      }
    } catch (err) {
      alert('Failed to cancel subscription')
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    const token = localStorage.getItem('token')
    // Create a link with auth headers for download
    const link = document.createElement('a')
    link.href = `${API_URL}/billing/invoices/${invoiceId}/download?token=${token}`
    link.download = `invoice-${invoiceId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
              <p className="text-sm text-gray-500">Manage your plans, subscriptions, and invoices</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            {activeTab === 'overview' && stats && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Active Subscriptions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Subscriptions</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalSpent?.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                {/* Next Renewal */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Next Renewal</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        {stats.nextRenewal
                          ? new Date(stats.nextRenewal).toLocaleDateString()
                          : 'No active plan'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === 'subscriptions'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === 'invoices'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Invoices
              </button>
            </div>

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No active subscriptions</p>
                    <Link href="/">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{sub.planName}</h3>
                          <p className="text-sm text-gray-600">{sub.status.toUpperCase()}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            sub.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">₹{sub.monthlyAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Billing Cycle</p>
                          <p className="text-lg font-semibold text-gray-900 capitalize">{sub.billingCycle}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Days Remaining</p>
                          <p className="text-lg font-semibold text-gray-900">{Math.max(0, sub.daysRemaining)} days</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>Start: {new Date(sub.startDate).toLocaleDateString()}</p>
                        <p>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedSub(sub)
                            setShowChangeModal(true)
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Change Plan
                        </Button>
                        <Button
                          onClick={() => handleCancelSubscription(sub.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {invoices.length === 0 ? (
                  <div className="p-8 text-center">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No invoices yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoices.map((inv) => (
                          <tr key={inv.invoiceId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(inv.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ₹{inv.amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  inv.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleDownloadInvoice(inv.invoiceId)}
                                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
