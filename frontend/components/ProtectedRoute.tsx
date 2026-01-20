"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService, UserRole } from "@/lib/auth"
import { canAccessRoute } from "@/lib/rbac"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      const user = authService.getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Check role-based access for specific routes
      const routePermissions: { [key: string]: UserRole[] } = {
        "/dashboard/broadcasts": permissions.canAccessBroadcasts,
        "/dashboard/contacts": permissions.canAccessContacts,
        "/dashboard/templates": permissions.canAccessTemplates,
        "/dashboard/chatbot": permissions.canAccessChatbot,
        "/dashboard/chat": permissions.canAccessChat,
        "/dashboard/analytics": permissions.canAccessAnalytics,
        "/dashboard/campaigns": permissions.canAccessCampaigns,
        "/dashboard/settings": permissions.canAccessSettings,
      }

      // Check if current route requires specific permissions
      const requiredRoles = routePermissions[pathname]
      if (requiredRoles && !authService.hasRole(user, requiredRoles)) {
        // Redirect to dashboard home if user doesn't have permission
        router.push("/dashboard")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
