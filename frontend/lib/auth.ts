// User roles
export enum UserRole {
  SUPERADMIN = "superadmin",  // Platform owner - your team
  ADMIN = "admin",             // Organization owner - client
  MANAGER = "manager",         // Team lead - client's manager
  AGENT = "agent",             // Customer support - client's agent
  USER = "user",               // Read-only viewer
}

// User type
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phoneNumber?: string
  company?: string
  accountId?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

// Real authentication with backend API
export const authService = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isAuthenticated") === "true"
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    return JSON.parse(userStr)
  },

  // Login - Real API call
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('🔐 Login response:', { status: response.status, success: data.success, hasToken: !!data.token });

      if (response.ok && data.success && data.token) {
        const user: User = {
          id: data.user.accountId || '1',
          email: data.user.email,
          name: data.user.name,
          role: data.user.role === 'superadmin' ? UserRole.SUPERADMIN : 
                data.user.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
          accountId: data.user.accountId
        }

        // Store JWT token instead of session
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("token", data.token)
        
        console.log('✅ Token stored:', {
          isAuthenticated: localStorage.getItem("isAuthenticated"),
          hasToken: !!localStorage.getItem("token"),
          tokenLength: data.token.length
        });

        return { success: true, user }
      } else {
        console.log('❌ Login failed:', data.message);
        return { success: false, error: data.message || "Login failed" }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: "Login failed. Please try again." }
    }
  },

  // Get JWT token
  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("token")
    console.log('🔑 Getting token:', { hasToken: !!token, tokenLength: token?.length || 0 });
    return token
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
  },

  // Check if user has required role
  hasRole: (user: User | null, allowedRoles: UserRole[]): boolean => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  },
}

// Role-based permissions
export const permissions = {
  // Pages accessible by role (SuperAdmin has access to everything)
  canAccessBroadcasts: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessContacts: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessTemplates: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER],
  canAccessChatbot: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER],
  canAccessChat: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessAnalytics: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER],
  canAccessCampaigns: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER],
  canAccessSettings: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT, UserRole.USER],
  
  // SuperAdmin exclusive features
  canAccessPlatformSettings: [UserRole.SUPERADMIN],
  canManageOrganizations: [UserRole.SUPERADMIN],
  canViewAllClients: [UserRole.SUPERADMIN],
  canManageBilling: [UserRole.SUPERADMIN, UserRole.ADMIN],
  canManageTeam: [UserRole.SUPERADMIN, UserRole.ADMIN],
  canDeleteCampaigns: [UserRole.SUPERADMIN, UserRole.ADMIN],
  canExportData: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER],
}
