"use client"

import { Calendar, Plus, Filter, TrendingUp, Target, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CampaignsPage() {
  const campaigns = [
    { 
      id: 1, 
      name: "Summer Sale 2026", 
      type: "Broadcast",
      status: "Completed", 
      startDate: "Jan 1, 2026",
      endDate: "Jan 3, 2026",
      reach: 5420,
      engagement: "87.5%",
      conversions: 842,
      roi: "340%"
    },
    { 
      id: 2, 
      name: "Product Launch Campaign", 
      type: "Drip",
      status: "Active", 
      startDate: "Jan 2, 2026",
      endDate: "Jan 10, 2026",
      reach: 3200,
      engagement: "92.1%",
      conversions: 567,
      roi: "285%"
    },
    { 
      id: 3, 
      name: "Customer Retention", 
      type: "Automated",
      status: "Active", 
      startDate: "Dec 15, 2025",
      endDate: "Ongoing",
      reach: 8940,
      engagement: "76.3%",
      conversions: 1234,
      roi: "420%"
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage and track your marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">17,560</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">2,643</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg ROI</p>
              <p className="text-2xl font-bold text-gray-900">348%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {campaign.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {campaign.startDate} - {campaign.endDate}
                </p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Reach</p>
                <p className="text-xl font-bold text-gray-900">{campaign.reach.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-xl font-bold text-gray-900">{campaign.engagement}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-xl font-bold text-gray-900">{campaign.conversions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ROI</p>
                <p className="text-xl font-bold text-green-600">{campaign.roi}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
