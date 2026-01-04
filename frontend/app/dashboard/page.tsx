"use client"

import { 
  MessageSquare, LayoutDashboard, Send, Users, BarChart3, Settings, 
  Bell, Search, ChevronDown, Menu, X, Megaphone, Bot, Calendar,
  FileText, CreditCard, HelpCircle, LogOut, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", current: true },
    { name: "Broadcasts", icon: Megaphone, href: "/dashboard/broadcasts", current: false },
    { name: "Contacts", icon: Users, href: "/dashboard/contacts", current: false },
    { name: "Templates", icon: FileText, href: "/dashboard/templates", current: false },
    { name: "Chatbot", icon: Bot, href: "/dashboard/chatbot", current: false },
    { name: "Live Chat", icon: MessageSquare, href: "/dashboard/chat", current: false },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics", current: false },
    { name: "Campaigns", icon: Calendar, href: "/dashboard/campaigns", current: false },
  ]

  const stats = [
    { name: "Total Messages", value: "45,231", change: "+12.5%", changeType: "positive" },
    { name: "Active Contacts", value: "8,492", change: "+8.2%", changeType: "positive" },
    { name: "Response Rate", value: "94.3%", change: "+2.1%", changeType: "positive" },
    { name: "Avg Response Time", value: "2.4m", change: "-18.3%", changeType: "positive" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">PixelsWhatsApp</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    item.current
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gray-900 border-r border-gray-800">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">PixelsWhatsApp</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  item.current
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your WhatsApp campaigns.</p>
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
        </main>
      </div>
    </div>
  )
}
