"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
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
  Music,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorToast } from "@/components/ErrorToast"
import { authService } from "@/lib/auth"
import { 
  initSocket, 
  getSocket, 
  closeSocket, 
  joinConversation, 
  leaveConversation,
  subscribeToConversations
} from "@/lib/socket"

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasWABA, setHasWABA] = useState<boolean | null>(null)
  const [checkingWABA, setCheckingWABA] = useState(true)
  const [showContactPanel, setShowContactPanel] = useState(true) // Control right panel visibility
  const [contactNotes, setContactNotes] = useState("") // Store contact notes
  const [contactLabels, setContactLabels] = useState<string[]>(["Hot Lead", "Interested"]) // Store contact labels
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]) // Store available phone numbers
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null) // Track selected phone number
  const [contactIsActive, setContactIsActive] = useState(false) // Track if contact is actively typing/online
  const [editingContact, setEditingContact] = useState(false) // Toggle edit mode for contact panel
  const [contactFormData, setContactFormData] = useState({ name: "", email: "", tags: "", notes: "" })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedContactIdRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)
  const shouldScrollRef = useRef(false) // Track when to scroll
  const [autoRefresh, setAutoRefresh] = useState(true)

  // API base URL (update with your backend URL)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"

  const getHeaders = () => {
    const token = authService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  }

  // Fetch conversations
  const fetchConversations = useCallback(async (phoneId?: string) => {
    try {
      // Use provided phoneId, or selected phone, or first available phone
      const idToUse = phoneId || selectedPhoneId || (phoneNumbers.length > 0 ? phoneNumbers[0].phoneNumberId : null)
      
      if (!idToUse) {
        console.warn("No phone number selected for conversation fetch")
        return
      }
      
      const response = await fetch(`${API_URL}/conversations?phoneNumberId=${idToUse}`, {
        headers: getHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        
        // Fetch saved contacts to sync names
        const contactsResponse = await fetch(`${API_URL}/contacts`, {
          headers: getHeaders(),
        })
        const contactsData = contactsResponse.ok ? await contactsResponse.json() : { contacts: [] }
        const contactsMap = new Map((contactsData.contacts || []).map((c: any) => [c.whatsappNumber || c.phone, c.name]))
        
        // Transform API response to match frontend interface
        const transformed = (data.conversations || []).map((conv: any) => {
          // First try to get name from saved contacts by phone number
          const savedContactName = contactsMap.get(conv.userPhone)
          
          return {
            id: conv.conversationId || conv._id,
            phone: conv.userPhone,
            phoneNumberId: conv.phoneNumberId,
            // PRIORITY: Saved contact name > Conversation name > Default
            name: savedContactName || conv.userName || conv.userProfileName || 'Unknown',
            lastMessage: conv.lastMessagePreview,
            lastMessageTime: conv.lastMessageAt,
            unreadCount: conv.unreadCount || 0,
            profilePic: conv.userProfilePic
          }
        })
        
        // Smart update: merge backend data with local state
        setConversations(prev => {
          // Always sort by latest message time
          const merged = transformed.sort((a: Contact, b: Contact) => {
            return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
          })
          
          // Quick equality check to avoid unnecessary re-renders
          if (merged.length === prev.length && merged.every((c: Contact, i: number) => 
            c.id === prev[i].id &&
            c.name === prev[i].name &&
            c.lastMessage === prev[i].lastMessage &&
            new Date(c.lastMessageTime || 0).getTime() === new Date(prev[i].lastMessageTime || 0).getTime() &&
            (c.unreadCount || 0) === (prev[i].unreadCount || 0)
          )) {
            return prev
          }
          
          return merged
        })
      } else {
        console.error("Failed to fetch conversations:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }, [API_URL, selectedPhoneId, phoneNumbers])

  // Fetch messages for selected contact
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || isFetchingRef.current) return
    
    isFetchingRef.current = true
    setIsLoading(true)
    try {
      // Load ALL messages (no hours limit) - backend loads up to 500 by default
      const response = await fetch(
        `${API_URL}/conversations/${encodeURIComponent(conversationId)}/messages?limit=500`,
        {
          headers: getHeaders(),
        }
      )
      if (response.ok) {
        const data = await response.json()
        const fetchedMessages = data.messages || []
        console.log('📨 Fetched', fetchedMessages.length, 'messages (all history)')
        if (fetchedMessages.length > 0) {
          console.log('🕐 First message:', new Date(fetchedMessages[0].createdAt).toLocaleString())
          console.log('🕐 Last message:', new Date(fetchedMessages[fetchedMessages.length - 1].createdAt).toLocaleString())
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
  }, [API_URL])

  // Save contact notes
  const saveContactNotes = useCallback(async () => {
    if (!selectedContact) return
    
    try {
      const response = await fetch(`${API_URL}/contacts/${selectedContact.id}/notes`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ notes: contactNotes }),
      })
      
      if (response.ok) {
        console.log("✅ Contact notes saved")
      } else {
        console.error("Failed to save notes:", response.status)
      }
    } catch (error) {
      console.error("Error saving notes:", error)
    }
  }, [selectedContact, contactNotes, API_URL])

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(
        `${API_URL}/conversations/${encodeURIComponent(conversationId)}/read`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      )
      // Update local state to clear unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ))
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }, [API_URL])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: getHeaders(),
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
        console.error('Response status:', response.status)
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        const errorMsg = error.message || error.error || "Unknown error"
        alert(`Failed to send: ${errorMsg} (${response.status})`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }, [newMessage, selectedContact, isSending, API_URL])

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedContact) return
    
    // Check file size (max 16MB for WhatsApp)
    if (file.size > 16 * 1024 * 1024) {
      alert("File size must be less than 16MB")
      return
    }
    
    setIsSending(true)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('phoneNumberId', selectedContact.phoneNumberId)
      formData.append('recipientPhone', selectedContact.phone)
      formData.append('campaign', 'manual')
      
      console.log('📤 Uploading media:', {
        filename: file.name,
        size: file.size,
        type: file.type
      })
      
      const response = await fetch(`${API_URL}/messages/send-media`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Media sent successfully:', result)
        
        // Add media message to chat - Detect file type properly
        let mediaType = 'document'
        if (file.type.startsWith('image/')) {
          mediaType = 'image'
        } else if (file.type.startsWith('video/')) {
          mediaType = 'video'
        } else if (file.type.startsWith('audio/')) {
          mediaType = 'audio'
        }
        
        const newMediaMessage: Message = {
          _id: result.data.messageId,
          content: {
            url: result.data.mediaUrl,
            filename: file.name,
            fileSize: file.size,
            caption: ''
          },
          direction: 'outbound',
          status: 'sent',
          createdAt: new Date().toISOString(),
          messageType: mediaType
        }
        
        setMessages((prev: Message[]) => [...prev, newMediaMessage])
        
        // Update conversation timestamp with media indicator
        const mediaLabel = mediaType === 'image' ? '🖼️ Photo' :
                          mediaType === 'video' ? '🎥 Video' :
                          mediaType === 'audio' ? '🎵 Audio' :
                          '📄 ' + file.name
        
        setConversations((prevContacts: Contact[]) => {
          return prevContacts.map((c: Contact) => {
            if (c.phone === selectedContact.phone) {
              return {
                ...c,
                lastMessage: mediaLabel,
                lastMessageTime: new Date().toISOString()
              }
            }
            return c
          }).sort((a: Contact, b: Contact) => {
            const timeA = new Date(a.lastMessageTime || 0).getTime()
            const timeB = new Date(b.lastMessageTime || 0).getTime()
            return timeB - timeA
          })
        })
        
      } else {
        console.error('❌ Failed to send media:', result.message)
        alert(`Failed to send media: ${result.message}`)
      }
      
    } catch (error) {
      console.error('❌ Media upload error:', error)
      alert('Failed to send media. Please try again.')
    } finally {
      setIsSending(false)
      setSelectedFile(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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
    checkWABAConnection()
  }, [])

  const checkWABAConnection = async () => {
    try {
      setCheckingWABA(true)
      const token = authService.getToken()
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/phone-numbers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        setHasWABA(false)
        setCheckingWABA(false)
        return
      }

      const data = await response.json()
      const hasPhones = data.phoneNumbers && data.phoneNumbers.length > 0
      setHasWABA(hasPhones)

      // Store phone numbers and set first as default
      if (hasPhones) {
        setPhoneNumbers(data.phoneNumbers)
        setSelectedPhoneId(data.phoneNumbers[0].phoneNumberId)
        // fetchConversations will be called by useEffect when selectedPhoneId changes
      }
    } catch (err) {
      console.error("Error checking WABA:", err)
      setHasWABA(false)
    } finally {
      setCheckingWABA(false)
    }
  }

  useEffect(() => {
    // Fetch conversations when selected phone ID changes
    if (selectedPhoneId) {
      fetchConversations(selectedPhoneId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhoneId])

  useEffect(() => {
    // Only fetch if we don't need to check WABA (already checked)
    if (checkingWABA || hasWABA === null) return
    
    if (hasWABA) {
      // Already called in checkWABAConnection if WABA exists
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWABA])

  // OLD: useEffect(() => {
  //   fetchConversations()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // Initialize Socket.io and listen for real-time updates
  useEffect(() => {
    // Initialize Socket.io connection
    const socket = initSocket();
    
    // Subscribe to all conversations for this user
    subscribeToConversations();
    
    // Handler for new messages
    const handleNewMessage = (data: any) => {
      const { conversationId, message } = data;
      console.log('💬 New message received:', conversationId, message);
      
      // ✅ DEBUG: Log ID matching for real-time sync troubleshooting
      console.log('%c🔍 CONVERSATION ID DEBUG', 'color: #ff6b6b; font-weight: bold', {
        broadcastConversationId: conversationId,
        selectedContactId: selectedContact?.id,
        selectedContactPhone: selectedContact?.phone,
        messageFrom: message.recipientPhone,
        messageType: message.messageType,
        match: conversationId === selectedContact?.id,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Update messages if we're viewing this conversation
      if (selectedContact?.id === conversationId) {
        console.log('%c✅ IDS MATCH - Adding message to view', 'color: #51cf66; font-weight: bold');
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        shouldScrollRef.current = true;
      } else {
        console.log('%c❌ IDS DO NOT MATCH - Message NOT added to current view', 'color: #ff6b6b; font-weight: bold');
      }
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: message.content?.text || '[Media]',
              lastMessageTime: message.createdAt,
              unreadCount: (conv.unreadCount || 0) + 1
            }
          : conv
      ).sort((a, b) => 
        new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
      ));
    };
    
    // Handler for conversation updates
    const handleConversationUpdate = (data: any) => {
      const { conversation } = data;
      console.log('📭 Conversation updated:', conversation);
      
      setConversations(prev => {
        const updated = prev.map(c => c.id === conversation.conversationId ? {
          ...c,
          lastMessage: conversation.lastMessagePreview,
          lastMessageTime: conversation.lastMessageAt,
          unreadCount: conversation.unreadCount || 0
        } : c);
        return updated.sort((a, b) => 
          new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
        );
      });
    };

    // Handler for tracking when contact becomes active (typing, reading, etc)
    const handleContactActive = (data: any) => {
      const { conversationId, isActive, lastActivityTime } = data;
      if (selectedContact?.id === conversationId) {
        console.log('🟢 Contact activity:', { isActive, lastActivityTime });
        setContactIsActive(isActive);
        
        // Auto-hide after 10 seconds of inactivity
        if (isActive) {
          setTimeout(() => setContactIsActive(false), 10000);
        }
      }
    };

    // Handler for typing indicator
    const handleTypingIndicator = (data: any) => {
      const { conversationId, isTyping: otherIsTyping } = data;
      if (selectedContact?.id === conversationId) {
        setIsTyping(otherIsTyping);
      }
    };
    
    // Remove old listeners to prevent duplicates
    socket.off('new_message', handleNewMessage);
    socket.off('conversation_update', handleConversationUpdate);
    socket.off('contact_active', handleContactActive);
    socket.off('typing_indicator', handleTypingIndicator);
    
    // Attach listeners
    socket.on('new_message', handleNewMessage);
    socket.on('conversation_update', handleConversationUpdate);
    socket.on('contact_active', handleContactActive);
    socket.on('typing_indicator', handleTypingIndicator);
    
    // Cleanup on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_update', handleConversationUpdate);
      socket.off('contact_active', handleContactActive);
      socket.off('typing_indicator', handleTypingIndicator);
    };
  }, [selectedContact?.id]);

  // Poll conversations list ONLY every 10 seconds (not per-conversation)
  // Messages have their own separate polling
  useEffect(() => {
    // Don't poll if no conversation selected yet
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      interval = setInterval(() => {
        fetchConversations()
      }, 10000) // Check every 10 seconds - reduced from 5 to avoid conflicts
    }
    
    startPolling()
    return () => {
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When contact is selected, load messages and join Socket.io room
  useEffect(() => {
    if (selectedContact) {
      selectedContactIdRef.current = selectedContact.id
      
      // Load full contact details from contacts list
      const loadFullContactDetails = async () => {
        try {
          // Try to fetch full contact data by phone number
          const contactsResponse = await fetch(`${API_URL}/contacts?search=${encodeURIComponent(selectedContact.phone)}`, {
            headers: getHeaders(),
          })
          
          if (contactsResponse.ok) {
            const contactsData = await contactsResponse.json()
            if (contactsData.contacts && contactsData.contacts.length > 0) {
              // Found matching contact - merge saved contact data with conversation data
              const savedContact = contactsData.contacts[0]
              setSelectedContact(prev => prev ? {
                ...prev,
                name: savedContact.name || prev.name, // Use saved name if available
                // Preserve conversation-specific fields
              } : null)
              
              // Load saved contact notes if available
              if (savedContact.notes) {
                setContactNotes(savedContact.notes)
              }
              if (savedContact.tags) {
                setContactLabels(Array.isArray(savedContact.tags) ? savedContact.tags : [])
              }
            }
          }
        } catch (error) {
          console.log('Could not load full contact details, using conversation data')
        }
      }
      
      loadFullContactDetails()
      fetchMessages(selectedContact.id)
      
      // Join Socket.io room for this conversation
      const socket = getSocket();
      if (socket) {
        joinConversation(selectedContact.id);
        console.log('📍 Joined conversation room:', selectedContact.id);
      }
    } else {
      // Leave Socket.io room when deselecting
      const prevContactId = selectedContactIdRef.current;
      const socket = getSocket();
      if (socket && prevContactId) {
        leaveConversation(prevContactId);
      }
      
      selectedContactIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id])

  // Poll ONLY for new incoming messages (not outbound), never overwrite existing ones
  useEffect(() => {
    if (!selectedContact) return

    let pollInterval: NodeJS.Timeout;
    let lastFetchTime = Date.now();
    
    const pollForNewMessages = async () => {
      const currentId = selectedContactIdRef.current
      if (!currentId) return

      try {
        const response = await fetch(
          `${API_URL}/conversations/${encodeURIComponent(currentId)}/messages`,
          {
            headers: getHeaders(),
          }
        )
        if (response.ok) {
          const data = await response.json()
          const newMessages = data.messages || []
          
          setMessages(prev => {
            // Don't replace if no messages fetched
            if (!newMessages || newMessages.length === 0) {
              return prev
            }
            
            // Only add truly new messages that weren't there before
            const existingIds = new Set(prev.map(m => m._id))
            const incomingNewMessages = newMessages.filter((m: Message) => {
              return !existingIds.has(m._id) && m.direction === "inbound"
            })
            
            if (incomingNewMessages.length > 0) {
              console.log(`📬 Found ${incomingNewMessages.length} new inbound messages`)
              shouldScrollRef.current = true
              return [...prev, ...incomingNewMessages]
            }
            
            // No new messages - keep existing state
            return prev
          })
        }
      } catch (error) {
        console.error("Error polling for new messages:", error)
      }
    }
    
    // Start polling after initial load
    pollInterval = setInterval(pollForNewMessages, 6000) // Check every 6 seconds for new incoming

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id, API_URL])

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
    const mediaUrl = content.url || content.mediaUrl || content.link // Support multiple field names

    switch (message.messageType) {
      case "text":
        return <p className="text-[14.2px] leading-[19px] text-[#111b21] whitespace-pre-wrap break-words">{content.text}</p>

      case "image":
        return (
          <div>
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt="Image"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-95 transition"
                onClick={() => window.open(mediaUrl, "_blank")}
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
            {mediaUrl ? (
              <div className="relative max-w-xs">
                <video
                  src={mediaUrl}
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

      case "audio":
        return (
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg min-w-[250px]">
            <Music className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {mediaUrl ? (
                <audio
                  src={mediaUrl}
                  controls
                  className="w-full h-8"
                />
              ) : (
                <p className="text-sm text-gray-500">Audio (downloading...)</p>
              )}
            </div>
          </div>
        )

      case "document":
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-full">
            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{content.filename || "Document"}</p>
              {content.fileSize && (
                <p className="text-xs text-gray-500">
                  {content.fileSize > 1024 * 1024 
                    ? (content.fileSize / (1024 * 1024)).toFixed(1) + ' MB'
                    : (content.fileSize / 1024).toFixed(1) + ' KB'
                  }
                </p>
              )}
            </div>
            {mediaUrl && (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition flex-shrink-0"
                title={`Download ${content.filename || 'document'}`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
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

  // Show blocking message if WABA not connected
  if (checkingWABA) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking WhatsApp connection...</p>
        </div>
      </div>
    )
  }

  if (hasWABA === false) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f0f2f5]">
        <div className="max-w-md">
          <div className="bg-white rounded-lg border border-red-200 p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-3">WhatsApp Business Account Not Connected</h2>
              <p className="text-red-700 mb-4">
                You must connect a WhatsApp Business Account (WABA) before using Live Chat.
              </p>
              <div className="bg-red-50 rounded p-4 mb-6 text-sm text-gray-700 text-left">
                <p className="font-semibold mb-3">To connect your WhatsApp account:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Go to <strong>Dashboard → Settings</strong></li>
                  <li>Click <strong>"Add Phone Number"</strong></li>
                  <li>Enter your <strong>Phone Number ID</strong>, <strong>WABA ID</strong>, and <strong>Access Token</strong></li>
                  <li>Click <strong>"Add"</strong> to complete setup</li>
                </ol>
              </div>
              <Link href="/dashboard/settings?tab=whatsapp">
                <button className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
                  Go to WhatsApp Setup
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-[#f0f2f5]">
      {/* LEFT PANEL - Conversations List (WATI Style) */}
      <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
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
                <div className="relative h-12 w-12 flex-shrink-0">
                  <div className="h-12 w-12 bg-[#dfe5e7] rounded-full flex items-center justify-center">
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
                  {/* Online status indicator - show green dot if last message was recent (within 5 min) */}
                  {contact.lastMessageTime && 
                   new Date().getTime() - new Date(contact.lastMessageTime).getTime() < 5 * 60 * 1000 && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#25d366] border-2 border-white rounded-full"></div>
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
                    <div className="flex items-center gap-1 text-sm text-[#667781] truncate max-w-[200px]">
                      {/* Show icon for media messages in conversation preview */}
                      {contact.lastMessage?.startsWith('[Media]') || contact.lastMessage?.startsWith('📎') ? (
                        <>
                          <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{contact.lastMessage.replace('[Media]', '').replace('📎', '') || 'Media'}</span>
                        </>
                      ) : contact.lastMessage?.includes('🖼️') || contact.lastMessage?.toLowerCase().includes('image') ? (
                        <>
                          <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">Photo</span>
                        </>
                      ) : contact.lastMessage?.includes('🎥') || contact.lastMessage?.toLowerCase().includes('video') ? (
                        <>
                          <Play className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">Video</span>
                        </>
                      ) : contact.lastMessage?.includes('🎵') || contact.lastMessage?.toLowerCase().includes('audio') ? (
                        <>
                          <Music className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">Audio</span>
                        </>
                      ) : contact.lastMessage?.includes('📄') || contact.lastMessage?.toLowerCase().includes('document') ? (
                        <>
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">Document</span>
                        </>
                      ) : (
                        <span className="truncate">{contact.lastMessage || "No messages yet"}</span>
                      )}
                    </div>
                    {/* Unread Badge */}
                    {(contact.unreadCount ?? 0) > 0 && (
                      <div className="h-5 min-w-[20px] bg-[#25d366] rounded-full flex items-center justify-center px-1.5 ml-2">
                        <span className="text-xs font-semibold text-white">
                          {(contact.unreadCount ?? 0) > 99 ? '99+' : (contact.unreadCount ?? 0)}
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

      {/* MIDDLE PANEL - Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContact ? (
          <>
            {/* Chat Header - WATI Style */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {selectedContact.profilePic ? (
                    <img
                      src={selectedContact.profilePic}
                      alt={selectedContact.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {selectedContact.name?.[0]?.toUpperCase() ||
                        selectedContact.phone[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">
                    {selectedContact.name || selectedContact.phone}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    {isTyping ? (
                      <p className="text-xs text-green-600 font-medium">Typing...</p>
                    ) : (
                      <p className="text-xs text-gray-500">Active now</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Search className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
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

            {/* Message Input - WATI Style */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                  <Smile className="h-6 w-6 text-gray-600" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                  title="Attach file (images, videos, documents, audio)"
                >
                  <Paperclip className="h-6 w-6 text-gray-600" />
                </button>

                <div className="flex-1 min-w-0 bg-gray-100 rounded-2xl px-4 py-2">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    rows={1}
                    className="w-full bg-gray-100 focus:outline-none resize-none text-[15px] text-gray-900 placeholder:text-gray-500"
                    style={{ maxHeight: '100px', overflow: 'auto' }}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className={`p-2 rounded-full transition flex-shrink-0 ${
                    newMessage.trim() && !isSending
                      ? 'bg-green-600 hover:bg-green-700'
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

      {/* RIGHT PANEL - Customer Context (CRM) - WATI Style */}
      {selectedContact && showContactPanel && (
        <div className="w-[380px] bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
          {/* Header with Close Button and Edit Toggle */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact Details</h3>
              <p className="text-xs text-gray-500">Customer information & history</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingContact(!editingContact)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-lg"
                title={editingContact ? "Save changes" : "Edit contact"}
              >
                {editingContact ? '💾' : '✏️'}
              </button>
              <button
                onClick={() => setShowContactPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Close contact panel"
              >
                <MoreVertical className="h-5 w-5 rotate-90" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
          {/* Customer Info Section */}
          <div className="p-4 border-b border-gray-100">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedContact.profilePic ? (
                  <img
                    src={selectedContact.profilePic}
                    alt={selectedContact.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {selectedContact.name?.[0]?.toUpperCase() || selectedContact.phone[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editingContact ? (
                  <input
                    type="text"
                    value={selectedContact.name || ''}
                    onChange={(e) => setSelectedContact({ ...selectedContact, name: e.target.value })}
                    placeholder="Contact name"
                    className="w-full text-lg font-semibold text-gray-900 border border-blue-300 rounded px-2 py-1 mb-2"
                  />
                ) : (
                  <h2 className="font-semibold text-gray-900 text-lg truncate">
                    {selectedContact.name || 'Unknown'}
                  </h2>
                )}
                <p className="text-sm text-gray-500 truncate">{selectedContact.phone}</p>
                <div className="flex items-center gap-1 mt-1">
                  {contactIsActive ? (
                    <>
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-semibold">Active now</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {selectedContact.lastMessageTime 
                          ? `Last active ${formatTime(selectedContact.lastMessageTime)}`
                          : 'Offline'
                        }
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 transition">
                📞 Call
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 transition">
                ⭐ Favorite
              </button>
            </div>
          </div>

          {/* Labels/Tags Section - INTERACTIVE */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Labels</p>
              {editingContact && (
                <input
                  type="text"
                  placeholder="Add label, press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      const newLabel = (e.target as HTMLInputElement).value.trim();
                      setContactLabels([...contactLabels, newLabel]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {contactLabels.map((label, idx) => (
                <button 
                  key={idx}
                  onClick={() => editingContact && setContactLabels(contactLabels.filter((_, i) => i !== idx))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition border ${
                    editingContact
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                  title={editingContact ? "Click to remove label" : ""}
                >
                  {label} {editingContact && '✕'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Fields Section - EDITABLE */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Custom Fields</p>
            <div className="space-y-3">
              {editingContact ? (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      defaultValue=""
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tags</label>
                    <input
                      type="text"
                      placeholder="e.g., VIP, Prospect"
                      defaultValue=""
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">Not provided</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tags</p>
                    <p className="text-sm font-medium text-gray-900">-</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Notes Section - EDITABLE */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Notes</p>
            {editingContact ? (
              <textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Add internal notes about this contact..."
                className="w-full h-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {contactNotes || 'No notes added'}
              </p>
            )}
          </div>

          {/* Conversation Status */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Status</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="h-2 w-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Reply Window Active (24h)</span>
              </div>
              <p className="text-xs text-gray-500">Last message 2 hours ago</p>
            </div>
          </div>

          {/* Agent Assignment */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Assigned Agent</p>
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
              <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-green-700">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Change
              </button>
            </div>
          </div>

          {/* Internal Notes Section - DYNAMIC */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Internal Notes</p>
            <textarea
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Add private notes (invisible to customer)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={4}
            />
            <button 
              onClick={saveContactNotes}
              className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition disabled:bg-gray-300"
              disabled={!contactNotes.trim()}
            >
              Save Note
            </button>
          </div>

          {/* Conversation History Timeline */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">History</p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 font-medium mt-0.5">Today</div>
                <div>
                  <p className="text-xs text-gray-600">Sent {messages.filter(m => m.direction === 'outbound').length} messages</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 font-medium mt-0.5">Received</div>
                <div>
                  <p className="text-xs text-gray-600">{messages.filter(m => m.direction === 'inbound').length} messages</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2">
            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              🔗 Share Contact
            </button>
            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              📋 View Full History
            </button>
            <button className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
              🚫 Block Contact
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Show Toggle Button when Panel is Closed */}
      {selectedContact && !showContactPanel && (
        <button
          onClick={() => setShowContactPanel(true)}
          className="fixed right-4 bottom-4 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition"
          title="Show contact details"
        >
          <MoreVertical className="h-5 w-5 -rotate-90" />
        </button>
      )}
    </div>
  )
}
