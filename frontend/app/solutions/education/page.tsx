'use client'

import { BookOpen, Users, TrendingUp, CheckCircle, AlertCircle, MessageSquare, BarChart3, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function EducationSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Education Transformation with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Increase parent engagement, reduce fee defaults, improve admission conversions, and build stronger student-institution relationships
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <BookOpen className="mr-2 h-5 w-5" />
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

      {/* Education Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Education Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Fee Collection</h3>
              <p className="text-gray-700 mb-4">15-20% fee defaults per term. Students drop out due to non-payment reminders that don't reach parents.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Revenue Loss: ₹50-100L per term</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Parent Communication</h3>
              <p className="text-gray-700 mb-4">Parents don't know about exam dates, results, or student performance. Blame institution for lack of updates.</p>
              <p className="text-sm text-gray-600 font-semibold">😞 Parent Satisfaction: 30-40%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Admission Conversion</h3>
              <p className="text-gray-700 mb-4">Admission inquiries don't convert. Leads go to competitors because there's no follow-up system.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Conversion Rate: 5-10%</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manual Administrative Burden</h3>
              <p className="text-gray-700 mb-4">Staff sends repetitive messages manually. No automation for announcements, reminders, or notifications.</p>
              <p className="text-sm text-gray-600 font-semibold">⏱️ Admin Time: 40-60 hours/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for Education</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Smart Fee Reminders */}
            <div className="bg-white p-8 rounded-xl border-2 border-purple-200">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Fee Reminders</h3>
              <p className="text-gray-700 mb-6">
                Automated payment reminders 15 days, 7 days, and 1 day before due date with instant payment links.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">75% On-Time Fee Collection</p>
                    <p className="text-sm text-gray-600">from 80-85% currently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹50-100L Revenue Recovery</p>
                    <p className="text-sm text-gray-600">per term</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Manual Effort</p>
                    <p className="text-sm text-gray-600">fully automated</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-purple-600 font-semibold">💜 ROI: 600%</p>
            </div>

            {/* Solution 2: Parent Engagement */}
            <div className="bg-white p-8 rounded-xl border-2 border-purple-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Parent Engagement</h3>
              <p className="text-gray-700 mb-6">
                Send real-time updates on exam dates, results, student attendance, and performance to parents.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+80% Parent Engagement</p>
                    <p className="text-sm text-gray-600">instant updates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Parent Satisfaction</p>
                    <p className="text-sm text-gray-600">better communication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Better Student Support</p>
                    <p className="text-sm text-gray-600">parents help intervene early</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-purple-600 font-semibold">💜 Retention Rate: +25%</p>
            </div>

            {/* Solution 3: Admission Conversion */}
            <div className="bg-white p-8 rounded-xl border-2 border-purple-200">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Admission Funnel Automation</h3>
              <p className="text-gray-700 mb-6">
                Auto-respond to inquiry, share curriculum, send campus tour video, schedule visit, and follow up.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+3x Admission Inquiries Converted</p>
                    <p className="text-sm text-gray-600">from 5-10% to 30-40%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹20-50L+ Admission Revenue</p>
                    <p className="text-sm text-gray-600">per academic year</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">1-Hour Response Time</p>
                    <p className="text-sm text-gray-600">beat competitors to inquiries</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-purple-600 font-semibold">💜 New Admissions: +50-100 per year</p>
            </div>

            {/* Solution 4: Class Announcements */}
            <div className="bg-white p-8 rounded-xl border-2 border-purple-200">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Class Updates</h3>
              <p className="text-gray-700 mb-6">
                Send class announcements, assignments, exam dates, and important notices to students and parents.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">100% Message Delivery</p>
                    <p className="text-sm text-gray-600">vs 10% email open rate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Zero Missed Announcements</p>
                    <p className="text-sm text-gray-600">WhatsApp read receipts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">20-40 hours Time Saved</p>
                    <p className="text-sm text-gray-600">per staff per month</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-purple-600 font-semibold">💜 Cost Savings: ₹10-20K/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for Educational Institutions</h2>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Revenue Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Fee Collection</p>
                <p className="text-3xl font-bold text-purple-600">₹50-100L</p>
                <p className="text-xs text-gray-500 mt-2">per term recovery</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">New Admissions</p>
                <p className="text-3xl font-bold text-purple-600">₹20-50L</p>
                <p className="text-xs text-gray-500 mt-2">per year from conversions</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Retention</p>
                <p className="text-3xl font-bold text-purple-600">+25%</p>
                <p className="text-xs text-gray-500 mt-2">student retention</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cost Savings</p>
                <p className="text-3xl font-bold text-pink-600">₹10-20K</p>
                <p className="text-xs text-gray-500 mt-2">admin automation</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Annual Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-purple-500">
                <p className="text-5xl font-bold text-purple-600">₹1-2Cr+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per year</p>
                <p className="text-purple-600 font-semibold mt-3">For institutions with 1000+ students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Transform Your Institution</h2>
          <p className="text-xl text-purple-100 mb-8">Join 300+ schools & colleges improving communication and revenue</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-purple-600">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
