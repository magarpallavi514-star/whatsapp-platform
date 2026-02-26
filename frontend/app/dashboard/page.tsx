"use client"

import { MessageSquare, Megaphone, Users, FileText, Bot, Building2, Activity, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ErrorToast } from "@/components/ErrorToast"
import { CompletePaymentCard } from "@/components/CompletePaymentCard"
import { PendingPaymentReminder } from "@/components/PendingPaymentReminder"
import { authService, UserRole } from "@/lib/auth"
import { API_URL } from "@/lib/config/api"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [dashboardActivity, setDashboardActivity] = useState<any[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setUserRole(currentUser?.role || null)
    
    // Fetch subscription status and stats
    fetchSubscription()
    fetchDashboardStats()
    fetchDashboardActivity()
  }, [])

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_URL}/subscriptions/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchDashboardActivity = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_URL}/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardActivity(data.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch dashboard activity:", err)
    }
  }

  const isSuperAdmin = userRole === UserRole.SUPERADMIN

  const handlePaymentComplete = () => {
    // Refresh user data and subscription
    fetchSubscription()
    // Optionally reload the entire page to update sidebar and profile
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Complete Payment Card for Pending Clients */}
        {!isSuperAdmin && user && (
          <CompletePaymentCard 
            user={user} 
            subscription={subscription}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {/* Header Section - Mobile Optimized */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {isSuperAdmin ? "Platform Overview" : "Your Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {isSuperAdmin 
              ? "Key metrics and platform performance at a glance" 
              : "Monitor your WhatsApp business metrics"}
          </p>
        </div>

        {/* Subscription Status Card - Mobile Optimized */}
        {!isSuperAdmin && !loadingSubscription && subscription && (
          <div className={`mb-6 sm:mb-8 rounded-lg p-3 sm:p-6 border ${
            subscription.status === 'active' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {subscription.status === 'active' ? (
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {subscription.planId?.name || 'Premium Plan'} • {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                    {subscription.status === 'active' 
                      ? `Next billing on ${new Date(subscription.renewalDate).toLocaleDateString()}`
                      : 'Your subscription is inactive'}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/billing">
                <button className="px-3 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap flex-shrink-0">
                  Manage Billing
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Metrics Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {loadingStats ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Loading metrics...</p>
            </div>
          ) : dashboardStats ? (
            (isSuperAdmin ? (
              [
                { 
                  name: "Organizations", 
                  value: dashboardStats.stats?.totalOrganizations || "0", 
                  icon: Building2,
                  color: "blue"
                },
                { 
                  name: "Active Accounts", 
                  value: dashboardStats.stats?.totalAccounts || "0", 
                  icon: Users,
                  color: "green"
                },
                { 
                  name: "Total Revenue", 
                  value: `₹${(dashboardStats.stats?.totalRevenue || 0).toLocaleString()}`, 
                  icon: DollarSign,
                  color: "emerald"
                },
                { 
                  name: "System Health", 
                  value: dashboardStats.stats?.systemUptime || "99.8%", 
                  icon: Activity,
                  color: "purple"
                },
              ]
            ) : (
              [
                { 
                  name: "Contacts", 
                  value: dashboardStats.stats?.totalContacts || "0", 
                  icon: Users,
                  color: "blue"
                },
                { 
                  name: "Messages Sent", 
                  value: dashboardStats.stats?.totalMessages || "0", 
                  icon: MessageSquare,
                  color: "green"
                },
                { 
                  name: "Response Rate", 
                  value: `${dashboardStats.stats?.responseRate || "0"}%`, 
                  icon: CheckCircle,
                  color: "emerald"
                },
                { 
                  name: "Avg Response Time", 
                  value: `${dashboardStats.stats?.avgResponseTime || "0"}m`, 
                  icon: Clock,
                  color: "orange"
                },
              ]
            )).map((stat) => {
              const Icon = stat.icon
              const colorStyles = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                green: "bg-green-50 text-green-600 border-green-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                purple: "bg-purple-50 text-purple-600 border-purple-100",
                orange: "bg-orange-50 text-orange-600 border-orange-100",
              }
              return (
                <div key={stat.name} className={`bg-white rounded-lg border p-3 sm:p-6 ${colorStyles[stat.color as keyof typeof colorStyles]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                      <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">{stat.value}</p>
                    </div>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-20 flex-shrink-0" />
                  </div>
                </div>
              )
            })
          ) : (
            (isSuperAdmin 
              ? [
                  { name: "Organizations", value: "2", icon: Building2, color: "blue" },
                  { name: "Active Accounts", value: "2", icon: Users, color: "green" },
                  { name: "Total Revenue", value: "₹9,246", icon: DollarSign, color: "emerald" },
                  { name: "System Health", value: "99.8%", icon: Activity, color: "purple" },
                ]
              : [
                  { name: "Contacts", value: "0", icon: Users, color: "blue" },
                  { name: "Messages Sent", value: "0", icon: MessageSquare, color: "green" },
                  { name: "Response Rate", value: "0%", icon: CheckCircle, color: "emerald" },
                  { name: "Avg Response Time", value: "0m", icon: Clock, color: "orange" },
                ]
            ).map((stat) => {
              const Icon = stat.icon
              const colorStyles = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                green: "bg-green-50 text-green-600 border-green-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                purple: "bg-purple-50 text-purple-600 border-purple-100",
                orange: "bg-orange-50 text-orange-600 border-orange-100",
              }
              return (
                <div key={stat.name} className={`bg-white rounded-lg border p-3 sm:p-6 ${colorStyles[stat.color as keyof typeof colorStyles]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                      <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">{stat.value}</p>
                    </div>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-20 flex-shrink-0" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Content Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity - Left Side (Larger) */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link href={isSuperAdmin ? "/dashboard/transactions" : "/dashboard/messages"} className="text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 whitespace-nowrap">
                View All →
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {dashboardActivity && dashboardActivity.length > 0 ? (
                dashboardActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-4 pb-3 sm:pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{activity.action}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1 sm:line-clamp-none">{activity.details}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 whitespace-nowrap ml-2 sm:ml-4">
                      {new Date(activity.time).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Shortcuts Section - Right Side */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Shortcuts</h2>
            <div className="space-y-2">
              {isSuperAdmin ? (
                <>
                  <Link href="/dashboard/organizations" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Organizations</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/invoices" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-green-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Invoices</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/transactions" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Transactions</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/system-health" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-purple-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">System Health</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/broadcasts" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-orange-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Broadcasts</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/messages" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Messages</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/campaigns" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-green-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Campaigns</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/contacts" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Contacts</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/templates" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-purple-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Templates</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                  <Link href="/dashboard/live-chat" className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-600 transition group">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-orange-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Live Chat</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
