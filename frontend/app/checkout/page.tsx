'use client'

import { AlertCircle, CheckCircle, Loader, MessageSquare, ArrowLeft, Zap, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { API_URL } from '@/lib/config/api'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'starter'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [allPlans, setAllPlans] = useState<any[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  // Fetch pricing plans from backend
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoadingPlans(true)
        const response = await fetch(`${API_URL}/pricing/plans/public`)
        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.length > 0) {
            setAllPlans(data.data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err)
      } finally {
        setIsLoadingPlans(false)
      }
    }
    fetchPricing()
  }, [])

  // Fallback plans if API fails
  const fallbackPlans = {
    starter: {
      name: 'Starter',
      monthlyPrice: 2499,
      setupFee: 3000,
      description: 'Perfect for getting started'
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 4999,
      setupFee: 3000,
      description: 'For scaling businesses'
    }
  }

  // Get plan from API or fallback
  const plan = allPlans.length > 0 
    ? (allPlans.find((p: any) => p.planId?.includes(planId) || p.name.toLowerCase() === planId.toLowerCase()) || allPlans[0])
    : fallbackPlans[planId as keyof typeof fallbackPlans] || fallbackPlans.starter

  useEffect(() => {
    console.log('📋 Checkout Info:', { planId, allPlans: allPlans.length, selectedPlan: plan?.name, planPrice: plan?.monthlyPrice });
    // Load Cashfree script
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/cashfree.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Create order from backend (backend will calculate amount dynamically for security)
      const response = await fetch(`${API_URL}/subscriptions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planId,
          paymentGateway: 'cashfree'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await response.json()

      // Initialize Cashfree checkout
      const cashfree = (window as any).Cashfree
      if (!cashfree) {
        throw new Error('Cashfree SDK not loaded')
      }

      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_self',
        onSuccess: (response: any) => {
          // Redirect to payment success page with order ID
          router.push(`/payment-success?orderId=${orderData.orderId}&status=success`)
        },
        onFailure: (response: any) => {
          setError('Payment failed. Please try again.')
        }
      }

      cashfree.checkout(checkoutOptions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg hidden sm:inline">Pixels</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Success Content */}
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. Redirecting to dashboard...
            </p>
            <div className="flex justify-center mb-4">
              <Loader className="h-6 w-6 text-green-600 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Pixels</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Minimal Header */}
      <div className="pt-6 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Powered by Cashfree</p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Product Details (2/3 width) */}
          <div className="md:col-span-2">
            <div className="space-y-8">
              {/* Plan Header with Badge */}
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{plan.name} Plan</h2>
                  {plan.name === 'Pro' && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      MOST POPULAR
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Monthly Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">₹{plan.monthlyPrice.toLocaleString()}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>

                  {plan.setupFee > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">One-time Setup</p>
                      <p className="text-lg font-semibold text-gray-900">₹{plan.setupFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Instant setup & activation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Enterprise-grade security</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">7-day money back guarantee</span>
                  </li>
                </ul>
              </div>

              {/* Payment Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">💡 Tip:</span> Use UPI for fastest processing (instant confirmation)
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (1/3 width) - STICKY */}
          <div className="md:col-span-1">
            <div className="sticky top-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              {/* Order Summary Header */}
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Order Summary</h3>

              {/* Line Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    {plan.name} Plan
                    <span className="block text-xs text-gray-500 mt-1">/month, billed monthly</span>
                  </span>
                  <span className="font-semibold text-gray-900">₹{plan.monthlyPrice.toLocaleString()}</span>
                </div>
                {plan.setupFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">One-time Setup Fee</span>
                    <span className="font-semibold text-gray-900">₹{plan.setupFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between mb-4">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{(plan.monthlyPrice + plan.setupFee).toLocaleString()}</span>
              </div>

              {/* Tax/Notices */}
              <div className="mb-6 pb-6 border-b border-gray-200 text-xs text-gray-500">
                <p>GST/Tax may apply based on your location</p>
              </div>

              {/* Coupon Code Input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Promo Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Total */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-semibold">Total Due Today</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">₹{(plan.monthlyPrice + plan.setupFee).toLocaleString()}</span>
                    <p className="text-xs text-gray-500 mt-1">Then ₹{plan.monthlyPrice.toLocaleString()}/mo</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-base mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowLeft className="h-5 w-5 transform rotate-180" />
                  </>
                )}
              </button>

              {/* Money Back Guarantee */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600">
                  <span className="block font-semibold text-gray-900 mb-1">✓ 7-Day Money-Back</span>
                  Not happy? Full refund, no questions.
                </p>
              </div>

              {/* Security Badge */}
              <p className="text-xs text-center text-gray-500 mt-4">
                🔒 Payments secured by <span className="font-semibold">Cashfree</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Common Questions</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">🔒 Is it secure?</h4>
              <p className="text-sm text-gray-600">
                100% secure. Cashfree is PCI-DSS certified with bank-level encryption.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">💰 Any hidden charges?</h4>
              <p className="text-sm text-gray-600">
                No. What you see is what you pay. GST may apply based on location.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">🚀 When do I get access?</h4>
              <p className="text-sm text-gray-600">
                Immediately after payment. Dashboard access within seconds of confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">© 2024 Pixels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
