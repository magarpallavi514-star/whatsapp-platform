'use client'

import { UtensilsCrossed, ShoppingCart, TrendingUp, CheckCircle, AlertCircle, Users, Zap, ArrowRight, Smartphone } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function FoodBeverageSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              F&B Revolution with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Increase order volume by 40%, reduce no-shows, build loyalty, and boost repeat orders with direct WhatsApp communication
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <UtensilsCrossed className="mr-2 h-5 w-5" />
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

      {/* F&B Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Food & Beverage Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High No-Show Rate</h3>
              <p className="text-gray-700 mb-4">40% of reservations don't show up. Tables remain empty, causing revenue loss and food waste.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Revenue Loss: ₹20-50K per day</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Order Frequency</h3>
              <p className="text-gray-700 mb-4">One-time customers don't return. No system to remind or incentivize repeat orders.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Repeat Customer Rate: 15-20%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Accuracy Issues</h3>
              <p className="text-gray-700 mb-4">Customers complain about wrong orders. No clear communication about custom requests.</p>
              <p className="text-sm text-gray-600 font-semibold">😞 Complaint Rate: 10-15%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limited Customer Data</h3>
              <p className="text-gray-700 mb-4">Can't identify best customers or personalize offers. No loyalty program integration.</p>
              <p className="text-sm text-gray-600 font-semibold">⚠️ Untapped Revenue: ₹10-20L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for F&B</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Reservation Reminders */}
            <div className="bg-white p-8 rounded-xl border-2 border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Reservation Reminders</h3>
              <p className="text-gray-700 mb-6">
                Send automated reminders 24 hours and 1 hour before reservation with easy cancellation/rescheduling.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">85% Show-up Rate</p>
                    <p className="text-sm text-gray-600">from 60% currently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹20-50K Daily Revenue Saved</p>
                    <p className="text-sm text-gray-600">from filled reservations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Self-Service Rescheduling</p>
                    <p className="text-sm text-gray-600">reduce phone calls</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-orange-600 font-semibold">🧡 ROI: 400%</p>
            </div>

            {/* Solution 2: Order Updates */}
            <div className="bg-white p-8 rounded-xl border-2 border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-Time Order Updates</h3>
              <p className="text-gray-700 mb-6">
                Order confirmed, being prepared, ready for pickup, out for delivery notifications with delivery tracking.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">70% Complaint Reduction</p>
                    <p className="text-sm text-gray-600">customers know where order is</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Customer Satisfaction</p>
                    <p className="text-sm text-gray-600">transparent communication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Wrong Orders</p>
                    <p className="text-sm text-gray-600">clear order confirmation</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-orange-600 font-semibold">🧡 Cost Savings: ₹5-10K/month</p>
            </div>

            {/* Solution 3: Loyalty & Personalization */}
            <div className="bg-white p-8 rounded-xl border-2 border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Offers & Loyalty</h3>
              <p className="text-gray-700 mb-6">
                Send personalized menu recommendations, special offers, birthday deals based on customer preferences and history.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Repeat Order Rate</p>
                    <p className="text-sm text-gray-600">from 15-20% currently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹10-25L Additional Monthly Revenue</p>
                    <p className="text-sm text-gray-600">from repeat customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+25% AOV Growth</p>
                    <p className="text-sm text-gray-600">via personalized recommendations</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-orange-600 font-semibold">🧡 Revenue Increase: ₹20-50L/month</p>
            </div>

            {/* Solution 4: Flash Deals & Promotions */}
            <div className="bg-white p-8 rounded-xl border-2 border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Time-Limited Offers & Deals</h3>
              <p className="text-gray-700 mb-6">
                Send flash lunch deals, happy hour specials, low-stock alerts to drive off-peak orders and table bookings.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">60% Conversion on Deals</p>
                    <p className="text-sm text-gray-600">creates urgency</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Fill 50% More Tables Off-Peak</p>
                    <p className="text-sm text-gray-600">optimize seating</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹15-30L Peak Revenue</p>
                    <p className="text-sm text-gray-600">monthly uplift</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-orange-600 font-semibold">🧡 Revenue Increase: ₹30-60L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for F&B Business</h2>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-xl border-2 border-orange-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Revenue Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">No-Show Reduction</p>
                <p className="text-3xl font-bold text-orange-600">₹20-50K</p>
                <p className="text-xs text-gray-500 mt-2">per day saved</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Repeat Orders</p>
                <p className="text-3xl font-bold text-orange-600">₹10-25L</p>
                <p className="text-xs text-gray-500 mt-2">from loyalty</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Flash Deals</p>
                <p className="text-3xl font-bold text-orange-600">₹15-30L</p>
                <p className="text-xs text-gray-500 mt-2">off-peak revenue</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cost Savings</p>
                <p className="text-3xl font-bold text-red-600">₹5-10K</p>
                <p className="text-xs text-gray-500 mt-2">complaint handling</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Monthly Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
                <p className="text-5xl font-bold text-orange-600">₹45-115L+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per month</p>
                <p className="text-orange-600 font-semibold mt-3">For restaurants with ₹50L monthly GMV</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Boost Your F&B Business Today</h2>
          <p className="text-xl text-orange-100 mb-8">Join 500+ restaurants earning ₹45-115L extra every month</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-orange-600">
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-orange-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
