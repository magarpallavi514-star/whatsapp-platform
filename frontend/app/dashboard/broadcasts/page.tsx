"use client"

import { Megaphone, Plus, Calendar, Users, Send, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BroadcastsPage() {
  const broadcasts = [
    { id: 1, name: "Summer Sale 2026", status: "Completed", sent: 5420, delivered: 5380, read: 4750, date: "Jan 3, 2026" },
    { id: 2, name: "Product Launch", status: "Active", sent: 3200, delivered: 3180, read: 2940, date: "Jan 4, 2026" },
    { id: 3, name: "Welcome Series", status: "Scheduled", sent: 0, delivered: 0, read: 0, date: "Jan 5, 2026" },
    { id: 4, name: "New Year Offer", status: "Draft", sent: 0, delivered: 0, read: 0, date: "-" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-600 mt-1">Send bulk messages to your contacts</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">8,620</p>
            </div>
            <Send className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">8,560</p>
            </div>
            <Megaphone className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">89.5%</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Broadcasts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Broadcasts</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sent</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Delivered</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Read</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((broadcast) => (
                  <tr key={broadcast.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{broadcast.name}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        broadcast.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : broadcast.status === "Active"
                          ? "bg-blue-100 text-blue-700"
                          : broadcast.status === "Scheduled"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {broadcast.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{broadcast.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{broadcast.sent.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{broadcast.delivered.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{broadcast.read.toLocaleString()}</td>
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
