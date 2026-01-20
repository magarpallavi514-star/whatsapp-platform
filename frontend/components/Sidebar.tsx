'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, MessageSquare, Users, Megaphone, FileText, Bot, Target, 
  BarChart3, Users2, CreditCard, Settings, ChevronDown, LogOut, Menu, X 
} from 'lucide-react'
import { authService, UserRole } from '@/lib/auth'
import { getSidebarItems } from '@/lib/rbac'
import { useState } from 'react'

const iconMap = {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  FileText,
  Bot,
  Target,
  BarChart3,
  Users2,
  CreditCard,
  Settings
}

export default function Sidebar() {
  const pathname = usePathname()
  const user = authService.getCurrentUser()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const items = getSidebarItems(user.role as UserRole)

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-gray-200"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white
        transform transition-transform duration-300 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
          <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">PixelsWhatsApp</span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="text-sm">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-gray-400 text-xs capitalize mt-1">{user.role}</p>
            <p className="text-gray-500 text-xs mt-2 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {items.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {Icon && <Icon size={20} />}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
