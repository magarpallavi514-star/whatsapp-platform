'use client'

import { Zap, Users, TrendingUp, CheckCircle, AlertCircle, Code, Rocket, ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function SaaSTechSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              SaaS & Tech Growth with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Improve onboarding, reduce churn, accelerate customer support, and increase lifetime value with instant communication
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Rocket className="mr-2 h-5 w-5" />
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

      {/* SaaS Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">SaaS & Tech Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High Onboarding Churn</h3>
              <p className="text-gray-700 mb-4">30-40% of new customers churn within first 30 days. Poor onboarding experience drives users away.</p>
              <p className="text-sm text-gray-600 font-semibold">💔 Lost Customer LTV: ₹50-500K per customer</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Slow Support Response</h3>
              <p className="text-gray-700 mb-4">Customers wait hours/days for support tickets. Fast-growing companies can't scale support fast enough.</p>
              <p className="text-sm text-gray-600 font-semibold">😞 Support Cost: ₹500-2000 per ticket</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low Feature Adoption</h3>
              <p className="text-gray-700 mb-4">Customers only use 30% of features. No proactive education leads to underutilization and churn.</p>
              <p className="text-sm text-gray-600 font-semibold">📉 Expansion Revenue: Limited</p>
            </div>

            <div className="p-6 border-2 border-gray-200 rounded-xl bg-white">
              <AlertCircle className="h-8 w-8 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weak Customer Engagement</h3>
              <p className="text-gray-700 mb-4">Communication limited to email. No real-time feedback or urgent issue escalation.</p>
              <p className="text-sm text-gray-600 font-semibold">⚠️ NPS Score: 30-40</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for SaaS/Tech</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Smart Onboarding */}
            <div className="bg-white p-8 rounded-xl border-2 border-emerald-200">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Intelligent Onboarding Flow</h3>
              <p className="text-gray-700 mb-6">
                Guided onboarding tutorials, feature walkthroughs, best practices, and help via WhatsApp. Meet users where they are.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">-50% 30-Day Churn</p>
                    <p className="text-sm text-gray-600">from 30-40% to 15-20%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+₹5-20L Revenue Retention</p>
                    <p className="text-sm text-gray-600">monthly per 100 customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">3x Faster Time-to-Value</p>
                    <p className="text-sm text-gray-600">immediate guidance</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-semibold">💚 ROI: 5000%+</p>
            </div>

            {/* Solution 2: Instant Support */}
            <div className="bg-white p-8 rounded-xl border-2 border-emerald-200">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Customer Support</h3>
              <p className="text-gray-700 mb-6">
                Real-time WhatsApp support with integrated ticketing. Customers get answers within minutes, not hours.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">90% Issues Resolved on WhatsApp</p>
                    <p className="text-sm text-gray-600">without ticket escalation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">-60% Support Cost</p>
                    <p className="text-sm text-gray-600">fewer phone calls & tickets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+50% Customer Satisfaction</p>
                    <p className="text-sm text-gray-600">instant response</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-semibold">💚 Cost Savings: ₹20-50L/month</p>
            </div>

            {/* Solution 3: Feature Adoption */}
            <div className="bg-white p-8 rounded-xl border-2 border-emerald-200">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Proactive Feature Education</h3>
              <p className="text-gray-700 mb-6">
                Send tips on new features, best practices, and advanced use cases to increase product adoption and engagement.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+60% Feature Adoption Rate</p>
                    <p className="text-sm text-gray-600">from 30% to 50%+</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Expansion Revenue</p>
                    <p className="text-sm text-gray-600">upsell advanced features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹10-30L Monthly Expansion MRR</p>
                    <p className="text-sm text-gray-600">per 100 customers</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-semibold">💚 LTV Increase: +200%</p>
            </div>

            {/* Solution 4: Churn Prevention */}
            <div className="bg-white p-8 rounded-xl border-2 border-emerald-200">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Churn Prevention</h3>
              <p className="text-gray-700 mb-6">
                Identify at-risk customers from inactivity, send win-back campaigns, special offers, and success stories via WhatsApp.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+35% Churn Prevention Rate</p>
                    <p className="text-sm text-gray-600">win back at-risk customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹20-50L Saved Monthly</p>
                    <p className="text-sm text-gray-600">from prevented churn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+60 NPS Points Increase</p>
                    <p className="text-sm text-gray-600">proactive engagement</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-semibold">💚 Revenue Retention: ₹1Cr+/year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for SaaS/Tech</h2>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-xl border-2 border-emerald-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Annual Revenue Impact (Basis: 500 active customers, ₹10K MRR avg)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Churn Prevention</p>
                <p className="text-3xl font-bold text-emerald-600">₹60-100L</p>
                <p className="text-xs text-gray-500 mt-2">yearly</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Expansion Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">₹40-100L</p>
                <p className="text-xs text-gray-500 mt-2">yearly</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Support Cost Savings</p>
                <p className="text-3xl font-bold text-emerald-600">₹50-100L</p>
                <p className="text-xs text-gray-500 mt-2">yearly</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Faster Growth</p>
                <p className="text-3xl font-bold text-green-600">+30%</p>
                <p className="text-xs text-gray-500 mt-2">ARR growth</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Annual Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-emerald-500">
                <p className="text-5xl font-bold text-emerald-600">₹1.5-3Cr+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per year</p>
                <p className="text-emerald-600 font-semibold mt-3">For SaaS with ₹5Cr+ ARR</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Scale Your SaaS Business</h2>
          <p className="text-xl text-emerald-100 mb-8">Join 100+ SaaS companies improving retention and doubling ARR growth</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-emerald-600">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-emerald-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
