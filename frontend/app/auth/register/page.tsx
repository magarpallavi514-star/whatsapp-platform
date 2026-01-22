'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader, ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { API_URL } from '@/lib/config/api'
import { authService } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    selectedPlan: '' // Add plan selection
  })

  // 🔐 SESSION GUARD: Check if user is already logged in
  useEffect(() => {
    const checkAuthentication = async () => {
      // Small delay to ensure localStorage is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user has valid session
      const isAuthenticated = authService.isAuthenticated()
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")
      
      console.log('🔍 Auth Check on /auth/register:', {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0
      })
      
      if (isAuthenticated && token) {
        // User is already logged in - redirect to dashboard
        console.log("✅ Session found - Redirecting to dashboard")
        router.push("/dashboard")
        return
      } else {
        // User is not logged in - allow access to register page
        console.log("❌ No session found - Showing register page")
        setIsCheckingAuth(false)
      }
    }

    checkAuthentication()
  }, [router])

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-gray-600 font-medium">Checking your session...</p>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null) // Clear error when user types
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (!formData.selectedPlan) {
      setError('Please select a plan (Starter or Pro)')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          selectedPlan: formData.selectedPlan // Include selected plan
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        return
      }

      // Registration successful
      setSuccess(true)
      
      // Store user data and token
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('isAuthenticated', 'true')
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      }

      // Redirect to checkout with selected plan
      setTimeout(() => {
        const redirectUrl = data.redirectTo || `/checkout?plan=${formData.selectedPlan}`
        router.push(redirectUrl)
      }, 1500)
    } catch (err) {
      console.error('Registration error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - Add padding for navbar */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Get started with WhatsApp Platform</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-900 font-medium">Account created!</p>
                <p className="text-green-800 text-sm">Redirecting to pricing...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-900 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 bg-white text-gray-900"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 bg-white text-gray-900"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 bg-white text-gray-900"
              />
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Starter Plan */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, selectedPlan: 'starter' }))}
                  disabled={loading || success}
                  className={`p-4 rounded-lg border-2 transition font-medium text-sm ${
                    formData.selectedPlan === 'starter'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  } disabled:opacity-50`}
                >
                  <div className="font-bold text-base">Starter</div>
                  <div className="text-xs mt-1">₹2,499/month</div>
                </button>

                {/* Pro Plan */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, selectedPlan: 'pro' }))}
                  disabled={loading || success}
                  className={`p-4 rounded-lg border-2 transition font-medium text-sm ${
                    formData.selectedPlan === 'pro'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  } disabled:opacity-50`}
                >
                  <div className="font-bold text-base">Pro</div>
                  <div className="text-xs mt-1">₹4,999/month</div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : success ? 'Redirecting...' : 'Continue to Payment'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-green-600 hover:text-green-700 font-medium transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
