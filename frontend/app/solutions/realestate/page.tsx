'use client'

import { Home, TrendingUp, MapPin, CheckCircle, AlertCircle, Users, DollarSign, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function RealEstateSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real Estate Sales Acceleration with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Close deals faster, qualify leads instantly, and manage 100+ property inquiries with zero delays
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Home className="mr-2 h-5 w-5" />
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

      {/* Real Estate Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Real Estate Industry Pain Points</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Slow Lead Response</h3>
              <p className="text-gray-700 mb-4">Leads contact multiple agents. First response in 24+ hours loses 80% of leads to competitors.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Lost Deals: 10-20 per month per agent</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manual Document Management</h3>
              <p className="text-gray-700 mb-4">Contracts, agreements, and papers exchanged via email. Document versions get confused, causing delays.</p>
              <p className="text-sm text-gray-600 font-semibold">⏱️ Deal Closure Time: 45-90 days</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scheduling Nightmare</h3>
              <p className="text-gray-700 mb-4">Back-and-forth calls to schedule site visits. Many prospects don't show up for appointments.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Show-up Rate: Only 40-50%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Lead Qualification</h3>
              <p className="text-gray-700 mb-4">Hard to pre-qualify buyers. Agents waste time on unserious leads instead of hot prospects.</p>
              <p className="text-sm text-gray-600 font-semibold">👥 Serious Buyers: Only 5-10%</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for Real Estate</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Instant Lead Response */}
            <div className="bg-white p-8 rounded-xl border-2 border-amber-200">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Lead Response</h3>
              <p className="text-gray-700 mb-6">
                Respond to property inquiries within 60 seconds via WhatsApp with automated property details and images.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">80% of First Responses Win</p>
                    <p className="text-sm text-gray-600">immediate reply advantage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+15-20 Hot Leads/Month</p>
                    <p className="text-sm text-gray-600">per agent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹50L+ Deal Value from Quick Response</p>
                    <p className="text-sm text-gray-600">monthly</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-600 font-semibold">💛 ROI: 2000%+</p>
            </div>

            {/* Solution 2: Property Showcase */}
            <div className="bg-white p-8 rounded-xl border-2 border-amber-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Virtual Property Showcase</h3>
              <p className="text-gray-700 mb-6">
                Share 360° virtual tours, floor plans, locality videos, and high-res photos directly in WhatsApp.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">65% Schedule Site Visits</p>
                    <p className="text-sm text-gray-600">from virtual tour interested buyers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Pre-Qualified Buyers Only</p>
                    <p className="text-sm text-gray-600">save time on serious prospects</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">30% Faster Decision Making</p>
                    <p className="text-sm text-gray-600">buyers more confident</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-600 font-semibold">💛 Deal Cycle: 30 vs 60 days</p>
            </div>

            {/* Solution 3: Document Management */}
            <div className="bg-white p-8 rounded-xl border-2 border-amber-200">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure Document Exchange</h3>
              <p className="text-gray-700 mb-6">
                Send contracts, agreements, and legal documents securely with e-signature integration and version tracking.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">50% Faster Document Turnaround</p>
                    <p className="text-sm text-gray-600">from signature to deal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Version Confusion</p>
                    <p className="text-sm text-gray-600">single source of truth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Deal Closure: 30 vs 45-90 days</p>
                    <p className="text-sm text-gray-600">fast-track closing process</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-600 font-semibold">💛 Cost Savings: ₹10-20K/deal</p>
            </div>

            {/* Solution 4: Automated Scheduling */}
            <div className="bg-white p-8 rounded-xl border-2 border-amber-200">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Self-Service Site Scheduling</h3>
              <p className="text-gray-700 mb-6">
                Buyers self-schedule property visits with automated reminders and confirmation.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">85% Show-up Rate</p>
                    <p className="text-sm text-gray-600">from 40-50% currently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Manual Scheduling</p>
                    <p className="text-sm text-gray-600">automated calendar sync</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Agent Time Saved: 20+ hours/month</p>
                    <p className="text-sm text-gray-600">per agent</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-600 font-semibold">💛 Productivity: +40%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for Real Estate</h2>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-xl border-2 border-amber-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Additional Deal Closures Per Month</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Faster Response</p>
                <p className="text-3xl font-bold text-amber-600">+3-5 Deals</p>
                <p className="text-xs text-gray-500 mt-2">instant WhatsApp response</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Virtual Tour Closes</p>
                <p className="text-3xl font-bold text-amber-600">+2-4 Deals</p>
                <p className="text-xs text-gray-500 mt-2">65% site visit conversion</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Faster Documentation</p>
                <p className="text-3xl font-bold text-amber-600">+1-3 Deals</p>
                <p className="text-xs text-gray-500 mt-2">50% faster closing</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Additional Revenue Per Agent Per Month:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-amber-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-600 mb-2">Conservative (5% commission, ₹50L avg property)</p>
                    <p className="text-4xl font-bold text-amber-600">₹2.5-4L</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Aggressive (5% commission, ₹100L avg property)</p>
                    <p className="text-4xl font-bold text-amber-600">₹5-10L</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-6">From 6-12 additional deal closures</p>
              </div>
            </div>
          </div>

          {/* ROI Calculation */}
          <div className="bg-green-50 p-8 rounded-xl border-2 border-green-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">ROI for Real Estate Agent</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <p className="text-gray-700">Monthly Subscription</p>
                <p className="font-semibold text-gray-900">₹2,499</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <p className="text-gray-700">Additional Monthly Commission (Conservative)</p>
                <p className="font-semibold text-gray-900">₹2.5L</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b bg-green-100 p-4 rounded">
                <p className="text-gray-900 font-semibold">ROI</p>
                <p className="font-bold text-amber-600 text-2xl">100,000%</p>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Subscription pays for itself in 1 minute of additional commission! 🚀
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Real Estate Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Residential Real Estate Broker</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• 8 deals/month per agent</li>
                    <li>• 24+ hours response time</li>
                    <li>• 45-90 day deal cycle</li>
                    <li>• Agent earning: ₹15-20L/month</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (3 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• 14-16 deals/month per agent</li>
                    <li>• 60-second response time</li>
                    <li>• 30-45 day deal cycle</li>
                    <li>• Agent earning: ₹22-30L/month</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Commercial Real Estate Team</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• 3-5 commercial deals/month</li>
                    <li>• Email back-and-forth</li>
                    <li>• 60-90 day sales cycle</li>
                    <li>• Team earning: ₹50-75L/month</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (6 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• 8-10 commercial deals/month</li>
                    <li>• WhatsApp instant communication</li>
                    <li>• 30-45 day sales cycle</li>
                    <li>• Team earning: ₹100-150L/month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Close Deals Faster with WhatsApp</h2>
          <p className="text-xl text-amber-100 mb-8">Join 1,200+ real estate agents earning ₹5-10L extra every month</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-amber-600">
                <Home className="mr-2 h-5 w-5" />
                Start Your Free Trial Now
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-amber-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
