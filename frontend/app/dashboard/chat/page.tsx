"use client"

import { MessageSquare, Search, Send, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react"
import { useState } from "react"

export default function LiveChatPage() {
  const [selectedChat, setSelectedChat] = useState(1)

  const conversations = [
    { id: 1, name: "John Doe", phone: "+91 98765 43210", lastMessage: "Thank you for your help!", time: "2m ago", unread: 0, online: true },
    { id: 2, name: "Jane Smith", phone: "+91 98765 43211", lastMessage: "When will my order arrive?", time: "15m ago", unread: 2, online: true },
    { id: 3, name: "Mike Johnson", phone: "+91 98765 43212", lastMessage: "I need a refund", time: "1h ago", unread: 1, online: false },
    { id: 4, name: "Sarah Williams", phone: "+91 98765 43213", lastMessage: "Great service!", time: "2h ago", unread: 0, online: false },
  ]

  const messages = [
    { id: 1, sender: "customer", text: "Hi, I have a question about my order", time: "10:30 AM" },
    { id: 2, sender: "agent", text: "Hello! I'd be happy to help. What's your order number?", time: "10:31 AM" },
    { id: 3, sender: "customer", text: "It's #12345", time: "10:32 AM" },
    { id: 4, sender: "agent", text: "Let me check that for you. One moment please.", time: "10:32 AM" },
    { id: 5, sender: "agent", text: "Your order is currently being processed and will ship tomorrow.", time: "10:33 AM" },
    { id: 6, sender: "customer", text: "Thank you for your help!", time: "10:34 AM" },
  ]

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition ${
                selectedChat === conv.id ? "bg-green-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {conv.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.name}</p>
                    <p className="text-xs text-gray-500">{conv.phone}</p>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              <p className="text-xs text-gray-500 mt-1">{conv.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "agent"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === "agent" ? "text-green-100" : "text-gray-500"
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Smile className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
