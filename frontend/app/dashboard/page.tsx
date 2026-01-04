"use client"

import { MessageSquare, Megaphone, Users, FileText, Bot, Building2, Activity, DollarSign } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { authService, UserRole } from "@/lib/auth"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setUserRole(user?.role || null)
  }, [])

  const isSuperAdmin = userRole === UserRole.SUPERADMIN

  const stats = isSuperAdmin 
    ? [
        { name: "Total Organizations", value: "24", change: "+3 this month", changeType: "positive" },
        { name: "Platform Revenue", value: "₹2.4L", change: "+18%", changeType: "positive" },
        { name: "Total Users", value: "342", change: "+45", changeType: "positive" },
        { name: "System Uptime", value: "99.8%", change: "Healthy", changeType: "positive" },
      ]
    : [
        { name: "Total Messages", value: "45,231", change: "+12.5%", changeType: "positive" },
        { name: "Active Contacts", value: "8,492", change: "+8.2%", changeType: "positive" },
        { name: "Response Rate", value: "94.3%", change: "+2.1%", changeType: "positive" },
        { name: "Avg Response Time", value: "2.4m", change: "-18.3%", changeType: "positive" },
      ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSuperAdmin ? "Platform Dashboard" : "Dashboard"}
        </h1>
        <p className="text-gray-600">
          {isSuperAdmin 
            ? "Monitor all organizations and platform performance" 
            : "Welcome back! Here's what's happening with your WhatsApp campaigns."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <span className={`text-sm font-medium ${
                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "Broadcast sent", details: "Summer Sale Campaign", time: "2 hours ago" },
              { action: "New contact added", details: "+91 98765 43210", time: "4 hours ago" },
              { action: "Template approved", details: "Order Confirmation", time: "6 hours ago" },
              { action: "Chat message received", details: "From: John Doe", time: "8 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {isSuperAdmin ? (
              <>
                <Link href="/dashboard/organizations" className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <Building2 className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Manage Organizations</p>
                </Link>
                <Link href="/dashboard/system-health" className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <Activity className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">System Health</p>
                </Link>
                <Link href="/dashboard/platform-billing" className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <DollarSign className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Platform Billing</p>
                </Link>
                <Link href="/dashboard/analytics" className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <MessageSquare className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Platform Analytics</p>
                </Link>
              </>
            ) : (
              <>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <Megaphone className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">New Broadcast</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <Users className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Add Contact</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <FileText className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Create Template</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group">
                  <Bot className="h-8 w-8 text-gray-600 group-hover:text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Build Chatbot</p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
          <Link href="/dashboard/campaigns" className="text-sm text-green-600 hover:text-green-700 font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Delivered</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Read Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Summer Sale", status: "Completed", sent: "5,420", delivered: "5,380", rate: "87.5%" },
                { name: "Product Launch", status: "Active", sent: "3,200", delivered: "3,180", rate: "92.1%" },
                { name: "Welcome Series", status: "Scheduled", sent: "-", delivered: "-", rate: "-" },
              ].map((campaign, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : campaign.status === "Active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{campaign.sent}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{campaign.delivered}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{campaign.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
