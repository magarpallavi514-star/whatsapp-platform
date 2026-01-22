'use client'

import { CreditCard, Shield, TrendingUp, CheckCircle, AlertCircle, Users, Lock, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function FinancialServicesSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Financial Services Transformation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Improve customer engagement, reduce support costs, increase compliance, and accelerate loan approvals with WhatsApp
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <button className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Services Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Financial Services Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Support Costs</h3>
              <p className="text-gray-700 mb-4">Customers call for account status, transactions, loan updates. Manual support drains resources.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Support Cost: ₹200-500/customer/year</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Slow Loan Processing</h3>
              <p className="text-gray-700 mb-4">Loan applications stuck in manual review. No proactive communication about application status.</p>
              <p className="text-sm text-gray-600 font-semibold">⏱️ Approval Time: 10-15 days</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Document Collection</h3>
              <p className="text-gray-700 mb-4">Back-and-forth for document submission. Missing docs cause delays and lost deals.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Conversion Rate: 40-50%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance & Communication Gap</h3>
              <p className="text-gray-700 mb-4">Limited audit trail. Customer disputes over communication create compliance issues.</p>
              <p className="text-sm text-gray-600 font-semibold">⚠️ Dispute Rate: 5-10%</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for Finance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Instant Customer Support */}
            <div className="bg-white p-8 rounded-xl border-2 border-indigo-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Customer Support</h3>
              <p className="text-gray-700 mb-6">
                24/7 WhatsApp support for account queries, transaction info, balance checks, and general support.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">70% Support Call Reduction</p>
                    <p className="text-sm text-gray-600">instant WhatsApp responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹50-100 Cost/Customer Saved</p>
                    <p className="text-sm text-gray-600">annually</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">95% Satisfaction Rate</p>
                    <p className="text-sm text-gray-600">instant service</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-indigo-600 font-semibold">💜 Cost Savings: ₹50-100L/year</p>
            </div>

            {/* Solution 2: Loan Status Updates */}
            <div className="bg-white p-8 rounded-xl border-2 border-indigo-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Proactive Loan Updates</h3>
              <p className="text-gray-700 mb-6">
                Real-time notifications on application status, document received, verification complete, approval, and disbursal.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+35% Conversion Rate</p>
                    <p className="text-sm text-gray-600">from 40-50% to 60-70%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">3-5 Days Faster Approval</p>
                    <p className="text-sm text-gray-600">via instant communication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹10-30L Additional Loan Volume</p>
                    <p className="text-sm text-gray-600">monthly</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-indigo-600 font-semibold">💜 ROI: 800%</p>
            </div>

            {/* Solution 3: Document Collection */}
            <div className="bg-white p-8 rounded-xl border-2 border-indigo-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure Document Exchange</h3>
              <p className="text-gray-700 mb-6">
                Collect all documents securely via WhatsApp with encrypted storage and audit trails for compliance.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">50% Faster Document Collection</p>
                    <p className="text-sm text-gray-600">no back-and-forth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">90% Document Completion Rate</p>
                    <p className="text-sm text-gray-600">vs 60% currently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">100% Compliant Audit Trail</p>
                    <p className="text-sm text-gray-600">for RBI/regulatory</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-indigo-600 font-semibold">💜 Compliance Score: +25%</p>
            </div>

            {/* Solution 4: Payment Reminders */}
            <div className="bg-white p-8 rounded-xl border-2 border-indigo-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Payment Due Reminders</h3>
              <p className="text-gray-700 mb-6">
                Smart reminders 15, 7, 1 day before payment due with automatic late fee calculations.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% On-Time Payment Rate</p>
                    <p className="text-sm text-gray-600">from 60% to 85-90%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹20-50L EMI Collection Boost</p>
                    <p className="text-sm text-gray-600">monthly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">50% NPA Reduction</p>
                    <p className="text-sm text-gray-600">proactive reminders</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-indigo-600 font-semibold">💜 Revenue Impact: ₹50-150L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for Financial Services</h2>
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-xl border-2 border-indigo-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Impact (Basis: 10,000 Customers)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Support Cost Savings</p>
                <p className="text-3xl font-bold text-indigo-600">₹50-100L</p>
                <p className="text-xs text-gray-500 mt-2">annually</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Additional Loan Volume</p>
                <p className="text-3xl font-bold text-indigo-600">₹10-30L</p>
                <p className="text-xs text-gray-500 mt-2">monthly</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">EMI Collection Boost</p>
                <p className="text-3xl font-bold text-indigo-600">₹20-50L</p>
                <p className="text-xs text-gray-500 mt-2">monthly</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">NPA Reduction</p>
                <p className="text-3xl font-bold text-blue-600">50%</p>
                <p className="text-xs text-gray-500 mt-2">write-offs saved</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Annual Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-indigo-500">
                <p className="text-5xl font-bold text-indigo-600">₹1-3Cr+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per year</p>
                <p className="text-indigo-600 font-semibold mt-3">For NBFC/Bank with 10,000+ customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Transform Your Financial Services</h2>
          <p className="text-xl text-indigo-100 mb-8">Join 200+ financial institutions improving customer experience and revenues</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-indigo-600">
                <CreditCard className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-indigo-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
