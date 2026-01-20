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
    ? allPlans.find((p: any) => p.name.toLowerCase() === planId.toLowerCase()) || allPlans[0]
    : fallbackPlans[planId as keyof typeof fallbackPlans] || fallbackPlans.starter

  useEffect(() => {
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

      const totalAmount = plan.monthlyPrice + plan.setupFee

      // Create order from backend
      const response = await fetch(`${API_URL}/subscriptions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planId,
          amount: totalAmount,
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

      {/* Header */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-lg text-gray-600">Secure payment powered by Cashfree</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Plan Details */}
            <div className="bg-white border-2 border-green-600 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Monthly Fee</span>
                  <span className="font-semibold">₹{plan.monthlyPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>One-time Setup Fee</span>
                  <span className="font-semibold">₹{plan.setupFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total Today</span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{(plan.monthlyPrice + plan.setupFee).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Then ₹{plan.monthlyPrice.toLocaleString()} per month. Cancel anytime.
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">What's Included</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Instant setup & activation</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Enterprise-grade security</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 text-sm">
                  <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>7-day money back guarantee</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Payment Option
                </label>
                <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 flex items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cashfree Payments</p>
                    <p className="text-sm text-gray-600">UPI, Credit Card, Debit Card, Net Banking, Wallets</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Payment Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{(plan.monthlyPrice + plan.setupFee).toLocaleString()}
                    <ArrowLeft className="h-5 w-5 transform rotate-180" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secured by Cashfree. Your payment information is encrypted.
              </p>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">🔒 100% Secure:</span> All payments are processed through Cashfree's secure payment gateway with SSL encryption.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Questions?</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is this secure?</h4>
              <p className="text-gray-600 text-sm">
                Yes. We use Cashfree, India's most trusted payment gateway. All transactions are encrypted with bank-level security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I get a refund?</h4>
              <p className="text-gray-600 text-sm">
                Yes. We offer a 7-day money-back guarantee if you're not satisfied. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept UPI, Credit Cards, Debit Cards, Net Banking, and Digital Wallets through Cashfree.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">When does my subscription start?</h4>
              <p className="text-gray-600 text-sm">
                Immediately after payment verification. You'll get access to your dashboard within seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 Pixels WhatsApp Platform. All rights reserved.</p>
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
