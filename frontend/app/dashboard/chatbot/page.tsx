"use client"

import { Bot, Plus, Play, Pause, Edit, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatbotPage() {
  const bots = [
    { id: 1, name: "Customer Support Bot", status: "Active", interactions: 1234, successRate: "94%", lastActive: "Just now" },
    { id: 2, name: "Lead Qualification Bot", status: "Active", interactions: 856, successRate: "89%", lastActive: "5 mins ago" },
    { id: 3, name: "Order Status Bot", status: "Paused", interactions: 543, successRate: "97%", lastActive: "2 hours ago" },
    { id: 4, name: "FAQ Bot", status: "Draft", interactions: 0, successRate: "-", lastActive: "-" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot</h1>
          <p className="text-gray-600 mt-1">Build and manage your AI chatbots</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Bot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Bots</p>
          <p className="text-2xl font-bold text-gray-900">4</p>
          <p className="text-xs text-green-600 mt-1">2 active</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Interactions</p>
          <p className="text-2xl font-bold text-gray-900">2,633</p>
          <p className="text-xs text-green-600 mt-1">+24% this week</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Avg Success Rate</p>
          <p className="text-2xl font-bold text-gray-900">93.3%</p>
          <p className="text-xs text-green-600 mt-1">+2.1% improvement</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Automation Rate</p>
          <p className="text-2xl font-bold text-gray-900">78%</p>
          <p className="text-xs text-gray-600 mt-1">of conversations</p>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bot.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    bot.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : bot.status === "Paused"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {bot.status}
                  </span>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Interactions</p>
                <p className="text-xl font-bold text-gray-900">{bot.interactions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-gray-900">{bot.successRate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Last active: {bot.lastActive}</p>
              <div className="flex gap-2">
                {bot.status === "Active" ? (
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
