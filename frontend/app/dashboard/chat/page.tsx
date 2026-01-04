"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Contact {
  id: string
  phone: string
  name?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  profilePic?: string
}

interface Message {
  _id: string
  waMessageId?: string
  recipientPhone?: string
  senderPhone?: string
  messageType: string
  content: any
  status: string
  direction: "inbound" | "outbound"
  createdAt: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // API base URL (update with your backend URL)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
  const API_KEY = "wpk_live_f0b8a01652eb0b9950484f3b4674bd800e9e3e9a216f200f34b0502a0591ac5d"

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      } else {
        console.error("Failed to fetch conversations:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  // Fetch messages for selected contact
  const fetchMessages = async (phone: string) => {
    if (!phone) return
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${encodeURIComponent(phone)}/messages`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error("Failed to fetch messages:", response.status)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          recipientPhone: selectedContact.phone,
          messageText: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage("")
        // Refresh messages
        await fetchMessages(selectedContact.phone)
      } else {
        const error = await response.json()
        alert(`Failed to send: ${error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  // Handle Enter key to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!selectedContact || !autoRefresh) return
    
    const interval = setInterval(() => {
      fetchMessages(selectedContact.phone)
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedContact, autoRefresh])

  // When contact is selected, load messages
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.phone)
    }
  }, [selectedContact])

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else if (hours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  // Get status icon
  const getStatusIcon = (message: Message) => {
    if (message.direction !== "outbound") return null

    switch (message.status) {
      case "sent":
        return <Check className="h-4 w-4 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-gray-400" />
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    const content = message.content

    switch (message.messageType) {
      case "text":
        return <p className="whitespace-pre-wrap break-words">{content.text}</p>

      case "image":
        return (
          <div>
            {content.mediaUrl ? (
              <img
                src={content.mediaUrl}
                alt="Image"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(content.mediaUrl, "_blank")}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <ImageIcon className="h-5 w-5" />
                <span>Image (downloading...)</span>
              </div>
            )}
            {content.caption && <p className="mt-2">{content.caption}</p>}
          </div>
        )

      case "video":
        return (
          <div>
            {content.mediaUrl ? (
              <div className="relative max-w-xs">
                <video
                  src={content.mediaUrl}
                  controls
                  className="rounded-lg w-full"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Play className="h-5 w-5" />
                <span>Video (downloading...)</span>
              </div>
            )}
            {content.caption && <p className="mt-2">{content.caption}</p>}
          </div>
        )

      case "document":
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-gray-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">{content.filename || "Document"}</p>
              {content.fileSize && (
                <p className="text-xs text-gray-500">
                  {(content.fileSize / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            {content.mediaUrl && (
              <a
                href={content.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Download
              </a>
            )}
          </div>
        )

      case "location":
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{content.name || "Location"}</p>
            {content.address && (
              <p className="text-sm text-gray-600">{content.address}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {content.latitude}, {content.longitude}
            </p>
          </div>
        )

      default:
        return <p className="text-gray-500 italic">Unsupported message type</p>
    }
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phone?.includes(searchQuery)
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start by sending a message</p>
            </div>
          ) : (
            filteredConversations.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                  selectedContact?.id === contact.id ? "bg-green-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {contact.profilePic ? (
                    <img
                      src={contact.profilePic}
                      alt={contact.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <span className="text-green-600 font-semibold text-lg">
                      {contact.name?.[0]?.toUpperCase() || contact.phone[0]}
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-gray-900 truncate">
                      {contact.name || contact.phone}
                    </p>
                    {contact.lastMessageTime && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(contact.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.lastMessage || "No messages yet"}
                  </p>
                </div>

                {/* Unread Badge */}
                {contact.unreadCount && contact.unreadCount > 0 && (
                  <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {contact.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {selectedContact.name?.[0]?.toUpperCase() ||
                      selectedContact.phone[0]}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedContact.name || selectedContact.phone}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.direction === "outbound" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-lg px-4 py-2 rounded-2xl ${
                        message.direction === "outbound"
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {renderMessageContent(message)}
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          message.direction === "outbound"
                            ? "text-green-100 justify-end"
                            : "text-gray-500"
                        }`}
                      >
                        <span>{formatTime(message.createdAt)}</span>
                        {getStatusIcon(message)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>

                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>

                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                >
                  {isSending ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a contact from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
