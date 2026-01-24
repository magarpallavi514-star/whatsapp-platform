'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import { API_URL } from '@/lib/config/api'
import { AlertCircle, CheckCircle, Clock, DollarSign, Loader } from 'lucide-react'

interface BillingData {
  accountId: string
  plan: string
  billingCycle: string
  status: string
  amount: number
  createdAt: string
}

interface PaymentResponse {
  success: boolean
  orderId?: string
  paymentSessionId?: string
  amount?: number
  currency?: string
  billingCycle?: string
  message?: string
  error?: string
}

const PLAN_PRICES = {
  starter: { monthly: 999, quarterly: 2847, annual: 9590 },
  pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
  enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
  custom: { monthly: 0, quarterly: 0, annual: 0 }
}

export default function BillingPage() {
  const router = useRouter()
  const user = authService.getCurrentUser()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Prepare billing data from user
    if (user.status === 'pending' && user.plan && user.billingCycle) {
      const planPrice = PLAN_PRICES[user.plan.toLowerCase() as keyof typeof PLAN_PRICES]
      const cycleAmount = planPrice[user.billingCycle.toLowerCase() as keyof typeof planPrice] || 0

      setBillingData({
        accountId: user.accountId || '',
        plan: user.plan,
        billingCycle: user.billingCycle,
        status: user.status,
        amount: cycleAmount,
        createdAt: new Date().toISOString()
      })
    }

    setLoading(false)
  }, [user, router])

  const handleRetryPayment = async () => {
    if (!billingData) return

    setRetrying(true)
    setError('')

    try {
      // Call subscription endpoint to create/update order for retry
      const response = await fetch(`${API_URL}/subscriptions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          plan: billingData.plan,
          billingCycle: billingData.billingCycle
        })
      })

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to create payment order'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Parse successful response
      let data: PaymentResponse
      try {
        data = await response.json()
      } catch (e) {
        console.error('Failed to parse response:', e)
        throw new Error('Invalid response from server. Please try again.')
      }

      if (!data.success || !data.paymentSessionId) {
        throw new Error(data.error || 'Invalid payment session response')
      }

      // Initialize Cashfree checkout
      const cashfree = (window as any).Cashfree
      if (!cashfree) {
        throw new Error('Payment gateway not available. Please refresh the page.')
      }

      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self',
        onSuccess: (response: any) => {
          // Payment successful - webhook will update account status
          router.push(`/payment-success?orderId=${data.orderId || ''}&status=success`)
        },
        onFailure: (response: any) => {
          setError('Payment failed. Please try again.')
          setRetrying(false)
        }
      }

      cashfree.checkout(checkoutOptions)
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process payment')
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (user?.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success State */}
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Completed</h2>
            <p className="text-gray-600 mb-6">
              Your account is active and all features are unlocked. Thank you for your business!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!billingData || user?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Pending Payment</h2>
            <p className="text-gray-600 mb-6">
              Your account is already active. Go back to the dashboard to get started.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Payment Pending Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-1">Payment Pending</h3>
              <p className="text-orange-800">
                Your account is waiting for payment confirmation. Complete your payment below to unlock all features.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">Payment Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

          {/* Plan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Selected Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {billingData.plan}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Billing Cycle</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {billingData.billingCycle}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Amount Due</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{billingData.amount.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <p className="text-lg font-semibold text-orange-600 capitalize">
                {billingData.status}
              </p>
            </div>
          </div>

          {/* Features That Will Be Unlocked */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Unlocked After Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'WhatsApp Connection',
                'Contact Management',
                'Broadcast Messages',
                'Campaigns',
                'Chatbot Setup',
                'Message Templates'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retrying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Complete Payment Now
              </>
            )}
          </button>

          {/* Additional Info */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Your payment is secured by Cashfree Payment Gateway. <br />
            You can view your transaction history in the Transactions section.
          </p>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 mb-4">
            If you encounter any issues with payment, please check:
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>Your internet connection</li>
            <li>Your payment method has sufficient funds</li>
            <li>Contact your bank if payment is declined</li>
            <li>Email support@pixelswhatsapp.com for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
