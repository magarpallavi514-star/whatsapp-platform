'use client'

import { Plane, MapPin, CheckCircle, AlertCircle, Users, Zap, TrendingUp, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function TravelTourismSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-cyan-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Travel & Tourism Growth with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Increase bookings by 60%, reduce cancellations, improve customer satisfaction, and build loyalty with instant communication
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Plane className="mr-2 h-5 w-5" />
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

      {/* Travel Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Travel & Tourism Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Cancellation Rates</h3>
              <p className="text-gray-700 mb-4">25-30% of bookings cancelled last minute. No system to track at-risk bookings or send retention offers.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Revenue Loss: ₹30-100L per month</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Pre-Travel Communication</h3>
              <p className="text-gray-700 mb-4">Travelers don't get timely itineraries, documents, check-in info. Leads to confusion and complaints.</p>
              <p className="text-sm text-gray-600 font-semibold">😞 Satisfaction Score: 60-70%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limited Upsell Opportunities</h3>
              <p className="text-gray-700 mb-4">Can't recommend add-ons, activities, travel insurance. Miss additional revenue per booking.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Avg AOV: Low potential</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Repeat Booking Rate</h3>
              <p className="text-gray-700 mb-4">One-time customers don't come back. No personalized follow-up or recommendations after trip.</p>
              <p className="text-sm text-gray-600 font-semibold">⚠️ Repeat Rate: 10-15%</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for Travel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Booking Confirmations & Pre-Travel */}
            <div className="bg-white p-8 rounded-xl border-2 border-cyan-200">
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Booking Lifecycle</h3>
              <p className="text-gray-700 mb-6">
                Instant booking confirmation, pre-travel reminders, itinerary delivery, check-in instructions, and post-trip follow-up.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Cancellation Reduction</p>
                    <p className="text-sm text-gray-600">from 25-30% to 15-20%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹30-100L Monthly Revenue Saved</p>
                    <p className="text-sm text-gray-600">from cancellation reduction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">95% Satisfaction Score</p>
                    <p className="text-sm text-gray-600">timely communication</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-cyan-600 font-semibold">💚 ROI: 700%</p>
            </div>

            {/* Solution 2: Upsell & Cross-sell */}
            <div className="bg-white p-8 rounded-xl border-2 border-cyan-200">
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Upsell Offers</h3>
              <p className="text-gray-700 mb-6">
                Recommend activities, travel insurance, visa assistance, airport transfers based on destination and booking type.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+50% AOV Increase</p>
                    <p className="text-sm text-gray-600">from additional services</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹5-15L Additional Revenue</p>
                    <p className="text-sm text-gray-600">monthly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">30% Conversion on Upsells</p>
                    <p className="text-sm text-gray-600">vs 5-10% email</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-cyan-600 font-semibold">💚 Revenue Increase: ₹10-30L/month</p>
            </div>

            {/* Solution 3: Post-Trip Engagement */}
            <div className="bg-white p-8 rounded-xl border-2 border-cyan-200">
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Post-Trip Retention</h3>
              <p className="text-gray-700 mb-6">
                Send trip memories, collect reviews, suggest next vacation spots, loyalty rewards, and referral bonuses.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+50% Repeat Booking Rate</p>
                    <p className="text-sm text-gray-600">from 10-15% to 25-30%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+60% 5-Star Reviews</p>
                    <p className="text-sm text-gray-600">improve reputation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹10-25L Repeat Revenue</p>
                    <p className="text-sm text-gray-600">monthly</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-cyan-600 font-semibold">💚 Lifetime Value: +200%</p>
            </div>

            {/* Solution 4: Instant Support */}
            <div className="bg-white p-8 rounded-xl border-2 border-cyan-200">
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">On-Trip Support</h3>
              <p className="text-gray-700 mb-6">
                24/7 WhatsApp support during travels. Instant help for emergencies, itinerary changes, and local queries.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">2-Minute Response Time</p>
                    <p className="text-sm text-gray-600">vs email delays</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">99% Issue Resolution</p>
                    <p className="text-sm text-gray-600">during trip</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Reduces Support Costs</p>
                    <p className="text-sm text-gray-600">fewer phone calls</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-cyan-600 font-semibold">💚 Cost Savings: ₹5-10K/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for Travel</h2>
          
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-8 rounded-xl border-2 border-cyan-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Revenue Impact (Basis: 500 bookings/month)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cancellation Reduction</p>
                <p className="text-3xl font-bold text-cyan-600">₹30-100L</p>
                <p className="text-xs text-gray-500 mt-2">revenue saved</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Upsell Revenue</p>
                <p className="text-3xl font-bold text-cyan-600">₹5-15L</p>
                <p className="text-xs text-gray-500 mt-2">from add-ons</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Repeat Bookings</p>
                <p className="text-3xl font-bold text-cyan-600">₹10-25L</p>
                <p className="text-xs text-gray-500 mt-2">from retention</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cost Savings</p>
                <p className="text-3xl font-bold text-teal-600">₹5-10K</p>
                <p className="text-xs text-gray-500 mt-2">support automation</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Monthly Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-cyan-500">
                <p className="text-5xl font-bold text-cyan-600">₹45-155L+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per month</p>
                <p className="text-cyan-600 font-semibold mt-3">For travel companies with ₹50L monthly GMV</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Boost Your Travel Business</h2>
          <p className="text-xl text-cyan-100 mb-8">Join 150+ travel agencies earning ₹45-155L extra every month</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-cyan-600">
                <Plane className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-cyan-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
