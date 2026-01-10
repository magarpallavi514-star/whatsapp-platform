"use client"

import { Megaphone, Plus, Calendar, Users, Send, MoreVertical, Loader, Edit, Trash2, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { authService } from "@/lib/auth"

interface Broadcast {
  id: string
  name: string
  status: string
  sent: number
  delivered: number
  read: number
  date: string
}

export default function BroadcastsPage() {
  const user = authService.getCurrentUser()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [stats, setStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    readRate: 0,
    scheduled: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user?.accountId) return

    let isMounted = true

    const fetchBroadcasts = async () => {
      try {
        setLoading(true)
        setError("")
        const token = localStorage.getItem("token")
        
        // Fetch broadcasts - first try to get all broadcasts for the account
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        )

        const data = await response.json()
        
        if (!isMounted) return

        // Check if response is successful, regardless of HTTP status
        if (data.success || (data.data && !response.ok === false)) {
          const broadcastsList: Broadcast[] = (data.data?.broadcasts || []).map((broadcast: any) => ({
            id: broadcast._id,
            name: broadcast.name,
            status: broadcast.status,
            sent: broadcast.stats?.sent || 0,
            delivered: broadcast.stats?.delivered || broadcast.stats?.sent || 0,
            read: broadcast.stats?.read || 0,
            date: new Date(broadcast.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }))

          setBroadcasts(broadcastsList)

          // Calculate stats
          const totalSent = broadcastsList.reduce((sum: number, b: Broadcast) => sum + b.sent, 0)
          const totalDelivered = broadcastsList.reduce((sum: number, b: Broadcast) => sum + b.delivered, 0)
          const scheduledCount = broadcastsList.filter((b: Broadcast) => b.status === 'scheduled').length
          const readRateValue = totalSent > 0 ? parseFloat(((totalDelivered / totalSent) * 100).toFixed(1)) : 0

          setStats({
            totalSent,
            totalDelivered,
            readRate: readRateValue,
            scheduled: scheduledCount
          })
        } else if (!response.ok) {
          // Only treat as error if HTTP response is not OK
          throw new Error(data.error || data.message || "Failed to fetch broadcasts")
        }
      } catch (err) {
        console.error("Error fetching broadcasts:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load broadcasts")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Fetch once on mount
    fetchBroadcasts()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [user?.accountId, refreshKey])

  const handleSendBroadcast = async (broadcastId: string) => {
    setActionLoading(broadcastId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasts/${broadcastId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )
      const data = await response.json()
      if (data.success) {
        // Close menu and wait a moment before refreshing
        setOpenMenu(null)
        // Trigger refresh after 2 seconds to allow backend to update stats
        setTimeout(() => {
          setRefreshKey(prev => prev + 1)
        }, 2000)
      } else {
        alert(data.error || "Failed to send broadcast")
      }
    } catch (err) {
      alert("Error sending broadcast: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteBroadcast = async (broadcastId: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return
    
    setActionLoading(broadcastId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasts/${broadcastId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )
      const data = await response.json()
      if (data.success) {
        setBroadcasts(broadcasts.filter(b => b.id !== broadcastId))
        setOpenMenu(null)
      } else {
        alert(data.error || "Failed to delete broadcast")
      }
    } catch (err) {
      alert("Error deleting broadcast: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-600 mt-1">Send bulk messages to your contacts</p>
        </div>
        <Link href="/dashboard/broadcasts/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
            </div>
            <Send className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDelivered.toLocaleString()}</p>
            </div>
            <Megaphone className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.readRate}%</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Broadcasts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Broadcasts</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Loading broadcasts...</span>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No broadcasts yet</p>
              <Link href="/dashboard/broadcasts/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Broadcast
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-visible">
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
                          broadcast.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : broadcast.status === "running"
                            ? "bg-blue-100 text-blue-700"
                            : broadcast.status === "scheduled"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{broadcast.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{broadcast.sent.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{broadcast.delivered.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{broadcast.read.toLocaleString()}</td>
                      <td className="py-4 px-4 relative">
                        <div className="relative z-50">
                          <button 
                            onClick={() => setOpenMenu(openMenu === broadcast.id ? null : broadcast.id)}
                            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {openMenu === broadcast.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
                              {broadcast.status === "draft" && (
                                <>
                                  <Link 
                                    href={`/dashboard/broadcasts/edit/${broadcast.id}`}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                  </Link>
                                  <button
                                    onClick={() => handleSendBroadcast(broadcast.id)}
                                    disabled={actionLoading === broadcast.id}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-green-600 disabled:opacity-50"
                                  >
                                    {actionLoading === broadcast.id ? (
                                      <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    <span>{actionLoading === broadcast.id ? "Sending..." : "Send Now"}</span>
                                  </button>
                                </>
                              )}
                              
                              {broadcast.status === "completed" && (
                                <button
                                  onClick={() => handleSendBroadcast(broadcast.id)}
                                  disabled={actionLoading === broadcast.id}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-green-600 disabled:opacity-50"
                                >
                                  {actionLoading === broadcast.id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  <span>{actionLoading === broadcast.id ? "Sending..." : "Send Again"}</span>
                                </button>
                              )}

                              {broadcast.status === "scheduled" && (
                                <button
                                  onClick={() => handleSendBroadcast(broadcast.id)}
                                  disabled={actionLoading === broadcast.id}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-blue-600 disabled:opacity-50"
                                >
                                  {actionLoading === broadcast.id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Clock className="h-4 w-4" />
                                  )}
                                  <span>{actionLoading === broadcast.id ? "Sending..." : "Send Now"}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteBroadcast(broadcast.id)}
                                disabled={actionLoading === broadcast.id}
                                className="block w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                              >
                                {actionLoading === broadcast.id ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span>{actionLoading === broadcast.id ? "Deleting..." : "Delete"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
