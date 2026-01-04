"use client"

import { 
  MessageSquare, LayoutDashboard, Send, Users, BarChart3, Settings, 
  Bell, Search, ChevronDown, Menu, X, Megaphone, Bot, Calendar,
  FileText, LogOut, User, ChevronLeft, ChevronRight, Building2, 
  Activity, DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authService, User as UserType, UserRole } from "@/lib/auth"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT, UserRole.USER] },
    
    // SuperAdmin exclusive pages
    { name: "Organizations", icon: Building2, href: "/dashboard/organizations", roles: [UserRole.SUPERADMIN], superAdminOnly: true },
    { name: "System Health", icon: Activity, href: "/dashboard/system-health", roles: [UserRole.SUPERADMIN], superAdminOnly: true },
    { name: "Platform Billing", icon: DollarSign, href: "/dashboard/platform-billing", roles: [UserRole.SUPERADMIN], superAdminOnly: true },
    
    // Regular pages
    { name: "Broadcasts", icon: Megaphone, href: "/dashboard/broadcasts", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] },
    { name: "Contacts", icon: Users, href: "/dashboard/contacts", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] },
    { name: "Templates", icon: FileText, href: "/dashboard/templates", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] },
    { name: "Chatbot", icon: Bot, href: "/dashboard/chatbot", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] },
    { name: "Live Chat", icon: MessageSquare, href: "/dashboard/chat", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] },
    { name: "Campaigns", icon: Calendar, href: "/dashboard/campaigns", roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] },
  ]

  // Filter navigation based on user role
  const filteredNavigation = user 
    ? navigation.filter(item => item.roles.includes(user.role))
    : navigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">PixelsWhatsApp</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      }`}>
        <div className="flex flex-col flex-1 min-h-0 bg-gray-900 border-r border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            {!sidebarCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">PixelsWhatsApp</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/" className="mx-auto">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                } ${sidebarCollapsed ? "justify-center" : ""} ${
                  (item as any).superAdminOnly ? "border-t border-gray-800 mt-2 pt-3" : ""
                }`}
                title={sidebarCollapsed ? item.name : ""}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
                {!sidebarCollapsed && (item as any).superAdminOnly && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-purple-500 text-white rounded">SA</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            {user && !sidebarCollapsed && (
              <div className="mb-3 px-3 py-2 bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            )}
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition mb-1 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Settings" : ""}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition mb-1 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Logout" : ""}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            {/* Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      }`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main>{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
