"use client"

import { Building2, Plus, Search, MoreVertical, Users, TrendingUp, DollarSign, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrganizationsPage() {
  const organizations = [
    {
      id: 1,
      name: "Fashion Store Inc",
      adminEmail: "admin@fashionstore.com",
      adminName: "John Doe",
      plan: "Pro",
      status: "Active",
      users: 12,
      messages: 45230,
      revenue: "₹3,200",
      createdAt: "Dec 15, 2025",
    },
    {
      id: 2,
      name: "Pizza Paradise",
      adminEmail: "owner@pizzaparadise.com",
      adminName: "Maria Garcia",
      plan: "Basic",
      status: "Active",
      users: 5,
      messages: 12450,
      revenue: "₹1,500",
      createdAt: "Jan 2, 2026",
    },
    {
      id: 3,
      name: "TechHub Solutions",
      adminEmail: "admin@techhub.com",
      adminName: "Raj Kumar",
      plan: "Enterprise",
      status: "Active",
      users: 25,
      messages: 89340,
      revenue: "₹15,000",
      createdAt: "Nov 20, 2025",
    },
    {
      id: 4,
      name: "Wellness Clinic",
      adminEmail: "contact@wellnessclinic.com",
      adminName: "Dr. Sarah Johnson",
      plan: "Pro",
      status: "Trial",
      users: 8,
      messages: 3450,
      revenue: "₹0",
      createdAt: "Jan 3, 2026",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage all client organizations</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orgs</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">22</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">MRR</p>
              <p className="text-2xl font-bold text-gray-900">₹2.4L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Organizations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Admin</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Users</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Messages</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-500">{org.adminEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{org.adminName}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        org.plan === "Enterprise"
                          ? "bg-purple-100 text-purple-700"
                          : org.plan === "Pro"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        org.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{org.users}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{org.messages.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{org.revenue}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{org.createdAt}</td>
                    <td className="py-4 px-4">
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
