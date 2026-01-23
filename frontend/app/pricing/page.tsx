'use client'

import { Check, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { ErrorToast } from '@/components/ErrorToast'
import { API_URL } from '@/lib/config/api'

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string>("")
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/pricing/plans`)
      const data = await response.json()
      setPlans(data.data || [])
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      // Fallback plans
      setPlans([
        {
          planId: 'starter',
          name: 'Starter',
          description: 'Perfect for getting started',
          monthlyPrice: 2499,
          setupFee: 3000,
          isPopular: false,
          features: {
            included: [
              '1 WhatsApp Number',
              'Broadcast Messaging',
              'Basic Chatbot (Menu-driven)',
              'Live Chat Dashboard',
              '3 Team Agents',
              'Contact Management',
              'Basic Analytics',
              'Email Notifications',
              'Standard Support',
            ],
          },
        },
        {
          planId: 'pro',
          name: 'Pro',
          description: 'For scaling businesses',
          monthlyPrice: 4999,
          setupFee: 3000,
          isPopular: true,
          features: {
            included: [
              '3 WhatsApp Numbers',
              'Everything in Starter',
              'Advanced Chatbot (Logic-based)',
              'Campaign Automation',
              '10 Team Agents',
              'Scheduled Broadcasting',
              'Advanced Analytics & Reports',
              'SMS Gateway Integration',
              'Webhook Support',
              'Priority Support',
            ],
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = (planId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/register')
    } else {
      router.push(`/checkout?plan=${planId}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your business. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-green-600' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-green-600' : 'text-gray-600'}`}>
              Annual <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">Save 15%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {plans.map((plan) => (
                <div
                  key={plan.planId}
                  className={`rounded-xl border-2 p-8 relative ${
                    plan.isPopular
                      ? 'border-green-600 bg-green-50 shadow-xl'
                      : 'border-gray-200 bg-white hover:shadow-lg transition-shadow'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gray-900">
                        ₹{billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.monthlyPrice * 12 * 0.85)}
                      </span>
                      <span className="text-gray-600"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      One-time setup fee: <span className="font-semibold">₹{plan.setupFee?.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {billingCycle === 'annual' && '15% discount applied on annual billing'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8 space-y-3">
                    {plan.features?.included?.map((feature: string) => (
                      <div key={feature} className="flex gap-3 items-start">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetStarted(plan.planId)}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      plan.isPopular
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer a free trial?</h3>
              <p className="text-gray-700">
                Yes! We offer a 7-day free trial for all plans. No credit card required to get started.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-700">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-700">
                We accept all major credit cards, debit cards, and digital wallets through our Cashfree payment gateway.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-700">
                Yes. If you're not satisfied within 15 days, we offer a full refund (excluding setup fee). See our Refund Policy for details.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a contract lock-in period?</h3>
              <p className="text-gray-700">
                No contracts required. Cancel anytime. We're confident you'll love our service.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer custom plans?</h3>
              <p className="text-gray-700">
                For enterprise customers with 10,000+ messages/month, we offer custom plans. Contact our sales team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-3 text-sm text-gray-600">WhatsApp Numbers</td>
                  <td className="px-6 py-3 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-3 text-center text-sm font-semibold">3</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Team Members</td>
                  <td className="px-6 py-3 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /> 3</td>
                  <td className="px-6 py-3 text-center text-sm font-semibold">10</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-3 text-sm text-gray-600">API Access</td>
                  <td className="px-6 py-3 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-3 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Priority Support</td>
                  <td className="px-6 py-3 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-3 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start free today. No credit card required. Upgrade anytime.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
