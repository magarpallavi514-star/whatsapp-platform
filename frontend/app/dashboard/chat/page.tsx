"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  phoneNumberId: string // WhatsApp Phone Number ID needed for sending messages
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
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedContactIdRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)
  const shouldScrollRef = useRef(false) // Track when to scroll
  const [autoRefresh, setAutoRefresh] = useState(true)

  // API base URL (update with your backend URL)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
  const API_KEY = "wpk_live_f0b8a01652eb0b9950484f3b4674bd800e9e3e9a216f200f34b0502a0591ac5d"

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Transform API response to match frontend interface
        const transformed = (data.conversations || []).map((conv: any) => ({
          id: conv.conversationId || conv._id,
          phone: conv.userPhone,
          phoneNumberId: conv.phoneNumberId, // Add phoneNumberId for sending messages
          name: conv.userName || conv.userProfileName,
          lastMessage: conv.lastMessagePreview,
          lastMessageTime: conv.lastMessageAt,
          unreadCount: conv.unreadCount || 0,
          profilePic: conv.userProfilePic
        }))
        
        // Smart update: only change conversations if there are actual differences
        setConversations(prev => {
          // If no previous conversations, just set the new ones
          if (prev.length === 0) return transformed
          
          // Check if there are any actual changes (new messages, different counts, etc.)
          const hasChanges = transformed.some((newConv: Contact) => {
            const oldConv = prev.find(c => c.id === newConv.id)
            if (!oldConv) return true // New conversation
            
            // Check for meaningful changes
            return oldConv.lastMessage !== newConv.lastMessage ||
                   oldConv.unreadCount !== newConv.unreadCount ||
                   oldConv.lastMessageTime !== newConv.lastMessageTime
          })
          
          // Also check if a conversation was removed
          const conversationRemoved = prev.some(oldConv => 
            !transformed.find((c: Contact) => c.id === oldConv.id)
          )
          
          // Only update if there are actual changes
          if (hasChanges || conversationRemoved || prev.length !== transformed.length) {
            return transformed
          }
          
          // No changes, keep current order
          return prev
        })
      } else {
        console.error("Failed to fetch conversations:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }, [API_URL, API_KEY])

  // Fetch messages for selected contact
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || isFetchingRef.current) return
    
    isFetchingRef.current = true
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        const fetchedMessages = data.messages || []
        console.log('📨 Fetched', fetchedMessages.length, 'messages')
        if (fetchedMessages.length > 0) {
          console.log('🕐 Last message timestamp:', fetchedMessages[fetchedMessages.length - 1].createdAt, 
            '→', new Date(fetchedMessages[fetchedMessages.length - 1].createdAt).toLocaleTimeString())
        }
        
        // Smart merge: preserve any messages we created locally (with correct timestamps)
        setMessages(prev => {
          // If this is initial load (no previous messages), just use fetched
          if (prev.length === 0) {
            return fetchedMessages
          }
          
          // Create map of existing messages to preserve their data
          const existingMap = new Map(prev.map(msg => [msg._id, msg]))
          
          // Merge: use existing message data if available, otherwise use fetched
          return fetchedMessages.map((fetchedMsg: Message) => {
            const existing = existingMap.get(fetchedMsg._id)
            if (existing) {
              // Keep the existing message (preserves our frontend timestamp)
              return existing
            }
            // New message from backend
            return fetchedMsg
          })
        })
        
        shouldScrollRef.current = true // Enable scroll for new chat load
        // Mark conversation as read
        markAsRead(conversationId)
      } else {
        console.error("Failed to fetch messages:", response.status)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [API_URL, API_KEY])

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(
        `${API_URL}/api/conversations/${encodeURIComponent(conversationId)}/read`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
          },
        }
      )
      // Update local state to clear unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ))
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }, [API_URL, API_KEY])

  // Send message
  const sendMessage = useCallback(async () => {
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
          phoneNumberId: selectedContact.phoneNumberId,
          recipientPhone: selectedContact.phone,
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Message sent:', data)
        
        // Add the sent message to the local state immediately (optimistic update)
        const currentTime = new Date().toISOString()
        console.log('📅 Creating message with timestamp:', currentTime, '→', new Date(currentTime).toLocaleTimeString())
        
        const newMsg: Message = {
          _id: data.data?.messageId || Date.now().toString(),
          messageType: "text",
          content: { text: newMessage.trim() },
          direction: "outbound",
          status: "sent",
          createdAt: currentTime,
        }
        
        setMessages(prev => [...prev, newMsg])
        setNewMessage("")
        shouldScrollRef.current = true // Enable scroll when sending
        
        // Move this conversation to top of list with updated last message
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv.id === selectedContact.id 
              ? { 
                  ...conv, 
                  lastMessage: newMessage.trim().substring(0, 50), 
                  lastMessageTime: new Date().toISOString() 
                }
              : conv
          )
          // Sort: move the updated conversation to position 0
          return updated.sort((a, b) => {
            if (a.id === selectedContact.id) return -1
            if (b.id === selectedContact.id) return 1
            return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
          })
        })
      } else {
        const error = await response.json()
        console.error('❌ Send failed:', error)
        alert(`Failed to send: ${error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }, [newMessage, selectedContact, isSending, API_URL, API_KEY])

  // Handle Enter key to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }

  // Auto-scroll to bottom only when loading new chat or sending message
  useEffect(() => {
    if (messages.length === 0 || !shouldScrollRef.current) return
    
    // Scroll to bottom instantly
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    shouldScrollRef.current = false // Reset flag
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll conversations list every 20 seconds to check for new messages in other chats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations()
    }, 20000) // Check every 20 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When contact is selected, load messages and update ref
  useEffect(() => {
    if (selectedContact) {
      selectedContactIdRef.current = selectedContact.id
      fetchMessages(selectedContact.id)
    } else {
      selectedContactIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id])

  // Poll ONLY for new incoming messages, never overwrite existing ones
  useEffect(() => {
    if (!selectedContact) return

    const pollInterval = setInterval(async () => {
      const currentId = selectedContactIdRef.current
      if (!currentId) return

      try {
        const response = await fetch(
          `${API_URL}/api/conversations/${encodeURIComponent(currentId)}/messages`,
          {
            headers: {
              "Authorization": `Bearer ${API_KEY}`,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          const newMessages = data.messages || []
          
          setMessages(prev => {
            // Only check if there are MORE messages (new incoming)
            if (newMessages.length > prev.length) {
              // Add only the new messages that don't exist
              const existingIds = new Set(prev.map(m => m._id))
              const trulyNewMessages = newMessages.filter((m: Message) => !existingIds.has(m._id))
              
              if (trulyNewMessages.length > 0 && trulyNewMessages[0].direction === "inbound") {
                // New inbound message - add it and update conversation
                const lastNew = trulyNewMessages[trulyNewMessages.length - 1]
                setConversations(convs => {
                  const updated = convs.map(conv => 
                    conv.id === currentId 
                      ? { 
                          ...conv, 
                          lastMessage: lastNew.content?.text?.substring(0, 50) || '[Media]',
                          lastMessageTime: lastNew.createdAt,
                          unreadCount: (conv.unreadCount || 0) + trulyNewMessages.length
                        }
                      : conv
                  )
                  return updated.sort((a, b) => {
                    if (a.id === currentId) return -1
                    if (b.id === currentId) return 1
                    return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
                  })
                })
                shouldScrollRef.current = true
                return [...prev, ...trulyNewMessages]
              }
            }
            // No new messages or no changes - keep existing
            return prev
          })
        }
      } catch (error) {
        console.error("Error polling for new messages:", error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(pollInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id, API_URL, API_KEY])

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Format date for separators
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === now.toDateString()) {
      return "TODAY"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "YESTERDAY"
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      }).toUpperCase()
    }
  }

  // Check if we need a date separator
  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true
    const currentDate = new Date(currentMsg.createdAt).toDateString()
    const prevDate = new Date(prevMsg.createdAt).toDateString()
    return currentDate !== prevDate
  }

  // Get status icon
  const getStatusIcon = (message: Message) => {
    if (message.direction !== "outbound") return null

    switch (message.status) {
      case "sent":
        return <Check className="h-4 w-4 text-[#667781]" />
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-[#667781]" />
      case "read":
        return <CheckCheck className="h-4 w-4 text-[#53bdeb]" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-[#667781]" />
    }
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    const content = message.content

    switch (message.messageType) {
      case "text":
        return <p className="text-[14.2px] leading-[19px] text-[#111b21] whitespace-pre-wrap break-words">{content.text}</p>

      case "image":
        return (
          <div>
            {content.mediaUrl ? (
              <img
                src={content.mediaUrl}
                alt="Image"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-95 transition"
                onClick={() => window.open(content.mediaUrl, "_blank")}
              />
            ) : (
              <div className="flex items-center gap-2 text-[#667781] py-2">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">Image</span>
              </div>
            )}
            {content.caption && <p className="mt-2 text-[14.2px] text-[#111b21]">{content.caption}</p>}
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
    <div className="h-[calc(100vh-4rem)] flex bg-[#f0f2f5]">
      {/* Conversations List */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
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
                className={`w-full p-3 flex items-center gap-3 hover:bg-[#f5f6f6] transition border-b border-gray-100 ${
                  selectedContact?.id === contact.id ? "bg-[#f0f2f5]" : "bg-white"
                }`}
              >
                {/* Avatar */}
                <div className="h-12 w-12 bg-[#dfe5e7] rounded-full flex items-center justify-center flex-shrink-0">
                  {contact.profilePic ? (
                    <img
                      src={contact.profilePic}
                      alt={contact.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[#54656f] font-medium text-lg">
                      {contact.name?.[0]?.toUpperCase() || contact.phone[0]}
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-medium text-[#111b21] truncate text-[17px]">
                      {contact.name || contact.phone}
                    </p>
                    {contact.lastMessageTime && (
                      <span className="text-xs text-[#667781] ml-2 flex-shrink-0">
                        {formatTime(contact.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#667781] truncate max-w-[200px]">
                      {contact.lastMessage || "No messages yet"}
                    </p>
                    {/* Unread Badge */}
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <div className="h-5 min-w-[20px] bg-[#25d366] rounded-full flex items-center justify-center px-1.5 ml-2">
                        <span className="text-xs font-semibold text-white">
                          {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
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
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#dfe5e7] rounded-full flex items-center justify-center">
                  {selectedContact.profilePic ? (
                    <img
                      src={selectedContact.profilePic}
                      alt={selectedContact.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[#54656f] font-medium">
                      {selectedContact.name?.[0]?.toUpperCase() ||
                        selectedContact.phone[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-[#111b21] text-[17px]">
                    {selectedContact.name || selectedContact.phone}
                  </h2>
                  <p className="text-xs text-[#667781]">
                    {selectedContact.phone !== selectedContact.name ? selectedContact.phone : 'Click here for contact info'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                  <Search className="h-5 w-5 text-[#54656f]" />
                </button>
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                  <MoreVertical className="h-5 w-5 text-[#54656f]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d9dbd5' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#efeae2'
              }}
            >
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
                messages.map((message, index) => (
                  <div key={message._id}>
                    {/* Date Separator */}
                    {shouldShowDateSeparator(message, index > 0 ? messages[index - 1] : null) && (
                      <div className="flex justify-center my-3">
                        <div className="bg-white px-3 py-1.5 rounded-md shadow-sm">
                          <span className="text-xs font-medium text-[#54656f]">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div
                      className={`flex ${
                        message.direction === "outbound" ? "justify-end" : "justify-start"
                      }`}
                    >
                    <div
                      className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                        message.direction === "outbound"
                          ? "bg-[#d9fdd3]"
                          : "bg-white"
                      }`}
                      style={{
                        borderRadius: message.direction === "outbound" 
                          ? "7.5px 7.5px 0px 7.5px" 
                          : "7.5px 7.5px 7.5px 0px"
                      }}
                    >
                      {renderMessageContent(message)}
                      <div
                        className={`flex items-center gap-1 mt-1 text-[11px] ${
                          message.direction === "outbound"
                            ? "text-[#667781] justify-end"
                            : "text-[#667781]"
                        }`}
                      >
                        <span>{formatTime(message.createdAt)}</span>
                        {message.direction === "outbound" && getStatusIcon(message)}
                      </div>
                    </div>
                  </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-[#f0f2f5] border-t border-gray-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition flex-shrink-0">
                  <Smile className="h-6 w-6 text-[#54656f]" />
                </button>
                
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition flex-shrink-0">
                  <Paperclip className="h-6 w-6 text-[#54656f]" />
                </button>

                <div className="flex-1 min-w-0 bg-white rounded-lg">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    rows={1}
                    className="w-full px-3 py-2.5 bg-white rounded-lg focus:outline-none resize-none text-[15px] text-[#111b21] placeholder:text-[#667781]"
                    style={{ maxHeight: '100px', overflow: 'auto' }}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className={`p-2 rounded-full transition flex-shrink-0 ${
                    newMessage.trim() && !isSending
                      ? 'bg-[#25d366] hover:bg-[#20bf5a]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isSending ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div 
            className="flex-1 flex items-center justify-center" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d9dbd5' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#efeae2'
            }}
          >
            <div className="text-center px-8">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-80 h-80 mb-6 relative">
                  <svg viewBox="0 0 303 172" width="360" height="360" fill="none">
                    <path d="M151.5 0C67.904 0 0 67.904 0 151.5S67.904 303 151.5 303 303 235.096 303 151.5 235.096 0 151.5 0z" fill="#F0F0F0"/>
                    <circle cx="151.5" cy="151.5" r="151.5" fill="url(#paint0_linear)"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="151.5" y1="0" x2="151.5" y2="303">
                        <stop stopColor="#EFFFDE"/>
                        <stop offset="1" stopColor="#D9FDD3" stopOpacity="0.8"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-[32px] font-light text-[#41525d] mb-5">
                WhatsApp Business
              </h3>
              <p className="text-[14px] text-[#667781] leading-relaxed max-w-md mx-auto">
                Send and receive messages from your customers. Select a chat from the left to start messaging.
              </p>
              <div className="mt-8 pt-8 border-t border-[#00000014]">
                <p className="text-[14px] text-[#667781] flex items-center justify-center gap-1">
                  <span className="inline-block w-3 h-3">🔒</span>
                  End-to-end encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
