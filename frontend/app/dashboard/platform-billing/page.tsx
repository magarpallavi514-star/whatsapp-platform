"use client"

import { DollarSign, TrendingUp, CreditCard, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlatformBillingPage() {
  const stats = [
    { label: "Monthly Recurring Revenue", value: "₹2.4L", change: "+18%", trend: "up" },
    { label: "Annual Run Rate", value: "₹28.8L", change: "+22%", trend: "up" },
    { label: "Active Subscriptions", value: "22", change: "+3", trend: "up" },
    { label: "Churn Rate", value: "2.1%", change: "-0.5%", trend: "down" },
  ]

  const subscriptions = [
    { org: "Fashion Store Inc", plan: "Pro", amount: "₹3,200", status: "Active", nextBilling: "Feb 15, 2026", billingCycle: "Monthly" },
    { org: "TechHub Solutions", plan: "Enterprise", amount: "₹15,000", status: "Active", nextBilling: "Feb 20, 2026", billingCycle: "Yearly" },
    { org: "Pizza Paradise", plan: "Basic", amount: "₹1,500", status: "Active", nextBilling: "Feb 2, 2026", billingCycle: "Monthly" },
    { org: "Wellness Clinic", plan: "Pro", amount: "₹0", status: "Trial", nextBilling: "Jan 17, 2026", billingCycle: "Trial" },
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

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Organization</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Billing Cycle</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Next Billing</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{sub.org}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sub.plan === "Enterprise"
                        ? "bg-purple-100 text-purple-700"
                        : sub.plan === "Pro"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{sub.amount}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{sub.billingCycle}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sub.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{sub.nextBilling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
