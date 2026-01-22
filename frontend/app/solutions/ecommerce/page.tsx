'use client'

import { ShoppingBag, TrendingUp, Users, MessageSquare, Zap, BarChart3, CheckCircle, AlertCircle, ArrowRight, Smartphone } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function EcommerceSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              E-Commerce Revolution with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform customer engagement, boost conversions, and increase AOV with direct WhatsApp communication
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <ShoppingBag className="mr-2 h-5 w-5" />
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

      {/* Industry Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Industry Challenges You Face</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Cart Abandonment</h3>
              <p className="text-gray-700 mb-4">70% of shopping carts are abandoned without purchase. Traditional email reminders have only 15-20% open rates.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Annual Loss: ₹2-5L per 1000 customers</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Customer Communication</h3>
              <p className="text-gray-700 mb-4">Customers want instant updates on orders. Email delays cause frustration and negative reviews.</p>
              <p className="text-sm text-gray-600 font-semibold">😞 Average Support Cost: ₹50-100 per ticket</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Customer Retention</h3>
              <p className="text-gray-700 mb-4">One-time buyers don't return. Personalized recommendations are hard to implement at scale.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Repeat Rate: Only 20-30%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inventory Mismanagement</h3>
              <p className="text-gray-700 mb-4">Customers order out-of-stock items. Manual stock updates lead to overselling and angry customers.</p>
              <p className="text-sm text-gray-600 font-semibold">⚠️ Chargeback Rate: 5-10%</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for E-Commerce</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Cart Recovery */}
            <div className="bg-white p-8 rounded-xl border-2 border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Automated Cart Recovery</h3>
              <p className="text-gray-700 mb-6">
                Send personalized WhatsApp messages to customers who abandoned their cart within 1 hour of abandonment.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">45% Open Rate</p>
                    <p className="text-sm text-gray-600">vs 15% for email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">25% Recovery Rate</p>
                    <p className="text-sm text-gray-600">from abandoned carts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹2-10L Monthly Revenue</p>
                    <p className="text-sm text-gray-600">from recovery campaigns</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-green-600 font-semibold">💚 ROI: 800%</p>
            </div>

            {/* Solution 2: Order Updates */}
            <div className="bg-white p-8 rounded-xl border-2 border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-Time Order Updates</h3>
              <p className="text-gray-700 mb-6">
                Automatic notifications for order confirmation, payment received, shipped, out for delivery, and delivered.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">60% Reduction in Support Calls</p>
                    <p className="text-sm text-gray-600">customers know order status</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+30% Customer Satisfaction</p>
                    <p className="text-sm text-gray-600">with order transparency</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Save ₹50-100 per Ticket</p>
                    <p className="text-sm text-gray-600">on customer support costs</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-green-600 font-semibold">💚 Cost Savings: 70%</p>
            </div>

            {/* Solution 3: Personalized Recommendations */}
            <div className="bg-white p-8 rounded-xl border-2 border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
              <p className="text-gray-700 mb-6">
                Send personalized product recommendations based on browsing history, purchase behavior, and similar customer profiles.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">35% Repeat Purchase Rate</p>
                    <p className="text-sm text-gray-600">from recommended products</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% AOV Growth</p>
                    <p className="text-sm text-gray-600">average order value</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">5x More Engagement</p>
                    <p className="text-sm text-gray-600">vs traditional email</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-green-600 font-semibold">💚 Revenue Increase: ₹5-15L/month</p>
            </div>

            {/* Solution 4: Flash Sales & Inventory */}
            <div className="bg-white p-8 rounded-xl border-2 border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Flash Sales & Inventory Updates</h3>
              <p className="text-gray-700 mb-6">
                Real-time inventory notifications, flash sale alerts, and stock-back-in-stock alerts with direct purchase links.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">70% Conversion on Flash Sales</p>
                    <p className="text-sm text-gray-600">create urgency effect</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">90% Stock Clearance Rate</p>
                    <p className="text-sm text-gray-600">for seasonal inventory</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Overselling Issues</p>
                    <p className="text-sm text-gray-600">real-time sync with system</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-green-600 font-semibold">💚 Additional Revenue: ₹10-30L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact - Real Numbers</h2>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border-2 border-green-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Revenue Increase (₹ Basis)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cart Recovery</p>
                <p className="text-3xl font-bold text-green-600">₹2-10L</p>
                <p className="text-xs text-gray-500 mt-2">25% recovery × avg order value</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Repeat Purchases</p>
                <p className="text-3xl font-bold text-green-600">₹5-15L</p>
                <p className="text-xs text-gray-500 mt-2">35% repeat × customer base</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Flash Sales</p>
                <p className="text-3xl font-bold text-green-600">₹10-30L</p>
                <p className="text-xs text-gray-500 mt-2">70% conversion on offers</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cost Savings</p>
                <p className="text-3xl font-bold text-blue-600">₹5-15L</p>
                <p className="text-xs text-gray-500 mt-2">70% reduction in support</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Monthly Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-green-500">
                <p className="text-5xl font-bold text-green-600">₹22-70L+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per month</p>
                <p className="text-green-600 font-semibold mt-3">For stores with ₹50L monthly GMV</p>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick ROI Calculation</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <p className="text-gray-700">Monthly Subscription (Starter)</p>
                <p className="font-semibold text-gray-900">₹2,499</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <p className="text-gray-700">Avg Revenue Generated (Conservative)</p>
                <p className="font-semibold text-gray-900">₹22L</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b bg-green-100 p-4 rounded">
                <p className="text-gray-900 font-semibold">Monthly ROI</p>
                <p className="font-bold text-green-600 text-2xl">88,000%</p>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Your subscription pays for itself in just 1 minute! 🚀
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Real-World Use Cases</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fashion E-Commerce Store</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• ₹50L monthly GMV, 45% cart abandonment</li>
                    <li>• 2 support staff handling 500+ calls/month</li>
                    <li>• 20% repeat customer rate</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (3 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• ₹85L monthly GMV (+70%)</li>
                    <li>• 1 support staff enough, 95% satisfaction</li>
                    <li>• 45% repeat customer rate</li>
                    <li>• ₹8L monthly from cart recovery alone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Marketplace/Multi-Vendor Store</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• 200+ sellers with varying support quality</li>
                    <li>• 30% return/cancellation rate (poor communication)</li>
                    <li>• Inconsistent inventory management</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (3 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• All sellers using automated updates</li>
                    <li>• 12% return rate (80% improvement)</li>
                    <li>• Real-time inventory sync</li>
                    <li>• Seller ratings up 2-3 stars average</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-orange-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Niche/B2B E-Commerce</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• Long sales cycles, 10-15 days average</li>
                    <li>• Email-based communication (slow)</li>
                    <li>• ₹20-30L monthly GMV</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (3 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• 5-7 day average sales cycle</li>
                    <li>• Real-time quote & negotiation on WhatsApp</li>
                    <li>• ₹50L+ monthly GMV (+80%)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-pink-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Commerce/D2C Brand</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">BEFORE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• Seasonal business, ₹30-50L GMV at peak</li>
                    <li>• No customer engagement between seasons</li>
                    <li>• 10% repeat rate</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">AFTER (6 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• Year-round engagement with customers</li>
                    <li>• Off-season revenue from recommendations</li>
                    <li>• 35% repeat rate (3.5x growth)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Get Started</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Signup & Setup (5 mins)</h3>
                  <p className="mt-2 text-gray-600">Create account, add WhatsApp number, verify with Meta</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Connect Your Store (15 mins)</h3>
                  <p className="mt-2 text-gray-600">API integration with Shopify, WooCommerce, or custom platform</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Enable Automations (10 mins)</h3>
                  <p className="mt-2 text-gray-600">Turn on cart recovery, order updates, and recommendations</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Start Earning (Immediately)</h3>
                  <p className="mt-2 text-gray-600">See revenue increase from day 1 with automated campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your E-Commerce?</h2>
          <p className="text-xl text-green-100 mb-8">Join 2,500+ e-commerce stores already earning ₹20-70L extra every month</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-green-600">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Your Free Trial Now
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo Call
            </button>
          </div>
          <p className="text-sm text-green-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
