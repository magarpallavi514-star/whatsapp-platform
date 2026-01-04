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
}

// Mock authentication - Replace with actual API calls
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

  // Login
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Mock login - Replace with actual API call
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data based on email
      const role = email.includes("superadmin") ? UserRole.SUPERADMIN
                 : email.includes("admin") ? UserRole.ADMIN 
                 : email.includes("manager") ? UserRole.MANAGER
                 : email.includes("agent") ? UserRole.AGENT
                 : UserRole.USER

      const user: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        role,
      }

      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(user))

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
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
