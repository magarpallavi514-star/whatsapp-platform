"use client"

import { Users, Plus, Upload, Download, Search, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactsPage() {
  const contacts = [
    { id: 1, name: "John Doe", phone: "+91 98765 43210", email: "john@example.com", tags: ["Customer", "Premium"], lastContact: "2 hours ago" },
    { id: 2, name: "Jane Smith", phone: "+91 98765 43211", email: "jane@example.com", tags: ["Lead"], lastContact: "1 day ago" },
    { id: 3, name: "Mike Johnson", phone: "+91 98765 43212", email: "mike@example.com", tags: ["Customer"], lastContact: "3 days ago" },
    { id: 4, name: "Sarah Williams", phone: "+91 98765 43213", email: "sarah@example.com", tags: ["Premium", "VIP"], lastContact: "5 days ago" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp contacts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Contacts</p>
          <p className="text-2xl font-bold text-gray-900">8,492</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Active Contacts</p>
          <p className="text-2xl font-bold text-gray-900">6,234</p>
          <p className="text-xs text-green-600 mt-1">+8% from last month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">New This Month</p>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <p className="text-xs text-green-600 mt-1">+18% from last month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Groups</p>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-xs text-gray-600 mt-1">Active segments</p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Contacts</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tags</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{contact.phone}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{contact.email}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {contact.tags.map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{contact.lastContact}</td>
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
