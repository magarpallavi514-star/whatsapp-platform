'use client'

import { Stethoscope, Heart, Shield, Users, CheckCircle, AlertCircle, Activity, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function HealthcareSolutionPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Healthcare Transformation with WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Enhance patient engagement, reduce no-shows, improve compliance, and build stronger doctor-patient relationships
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/checkout">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Stethoscope className="mr-2 h-5 w-5" />
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

      {/* Healthcare Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Healthcare Industry Challenges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">High No-Show Rates</h3>
              <p className="text-gray-700 mb-4">30-40% of patients don't show up for appointments, wasting clinic time and losing revenue.</p>
              <p className="text-sm text-red-600 font-semibold">💔 Revenue Loss: ₹30-50K per day per clinic</p>
            </div>

            <div className="p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
              <AlertCircle className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Poor Patient Communication</h3>
              <p className="text-gray-700 mb-4">Patients forget prescriptions, miss follow-ups, and don't adhere to medical advice.</p>
              <p className="text-sm text-orange-600 font-semibold">😞 Compliance Rate: Only 30-40%</p>
            </div>

            <div className="p-6 border-2 border-yellow-200 rounded-xl bg-yellow-50">
              <AlertCircle className="h-8 w-8 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manual Administrative Work</h3>
              <p className="text-gray-700 mb-4">Staff spending hours on call reminders, prescription orders, and follow-up messages.</p>
              <p className="text-sm text-yellow-600 font-semibold">⏱️ Admin Cost: ₹20-50K per month</p>
            </div>

            <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50">
              <AlertCircle className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Limited Patient Data Insights</h3>
              <p className="text-gray-700 mb-4">Hard to track patient health journey and predict who needs intervention.</p>
              <p className="text-sm text-purple-600 font-semibold">📉 Lost Follow-up Revenue: ₹10-20L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">WhatsApp Solutions for Healthcare</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solution 1: Appointment Reminders */}
            <div className="bg-white p-8 rounded-xl border-2 border-blue-200">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Automated Appointment Reminders</h3>
              <p className="text-gray-700 mb-6">
                Send appointment reminders 24 hours and 1 hour before appointment with instant reschedule options.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">45% No-Show Reduction</p>
                    <p className="text-sm text-gray-600">from 35% to 20%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹50-100K Daily Revenue Saved</p>
                    <p className="text-sm text-gray-600">from filled slots</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Self-Service Rescheduling</p>
                    <p className="text-sm text-gray-600">reduce staff workload</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-semibold">💙 ROI: 500%</p>
            </div>

            {/* Solution 2: Prescription Management */}
            <div className="bg-white p-8 rounded-xl border-2 border-blue-200">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Digital Prescriptions</h3>
              <p className="text-gray-700 mb-6">
                Send digital prescriptions instantly via WhatsApp with medicine details, dosage, and pharmacy ordering.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+60% Medication Compliance</p>
                    <p className="text-sm text-gray-600">clear delivery of dosage info</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Integrated Pharmacy Orders</p>
                    <p className="text-sm text-gray-600">1-click medicine delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">HIPAA-Compliant Records</p>
                    <p className="text-sm text-gray-600">encrypted patient data</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-semibold">💙 Cost Savings: ₹15-30K/month</p>
            </div>

            {/* Solution 3: Test Results & Follow-ups */}
            <div className="bg-white p-8 rounded-xl border-2 border-blue-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Lab Results & Follow-ups</h3>
              <p className="text-gray-700 mb-6">
                Instant lab result notifications with doctor interpretation and automatic follow-up scheduling.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+40% Follow-up Appointments</p>
                    <p className="text-sm text-gray-600">immediate result communication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">₹10-20L Additional Revenue</p>
                    <p className="text-sm text-gray-600">from follow-up consultations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Patient Peace of Mind</p>
                    <p className="text-sm text-gray-600">faster result delivery</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-semibold">💙 Revenue Increase: ₹20-40L/month</p>
            </div>

            {/* Solution 4: Patient Engagement */}
            <div className="bg-white p-8 rounded-xl border-2 border-blue-200">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Patient Education & Wellness</h3>
              <p className="text-gray-700 mb-6">
                Send health tips, prevention advice, and wellness reminders to keep patients engaged between visits.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">+50% Patient Retention</p>
                    <p className="text-sm text-gray-600">continuous engagement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Better Health Outcomes</p>
                    <p className="text-sm text-gray-600">improved patient compliance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">5-Star Ratings Increase</p>
                    <p className="text-sm text-gray-600">excellent patient satisfaction</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-semibold">💙 Revenue Retention: ₹5-15L/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Revenue Impact for Clinics</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-xl border-2 border-blue-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Revenue Impact (₹ Basis)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">No-Show Reduction</p>
                <p className="text-3xl font-bold text-blue-600">₹30-100K</p>
                <p className="text-xs text-gray-500 mt-2">45% fewer no-shows</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Follow-up Revenue</p>
                <p className="text-3xl font-bold text-blue-600">₹10-20L</p>
                <p className="text-xs text-gray-500 mt-2">+40% follow-ups</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Patient Retention</p>
                <p className="text-3xl font-bold text-blue-600">₹5-15L</p>
                <p className="text-xs text-gray-500 mt-2">+50% retention rate</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Cost Savings</p>
                <p className="text-3xl font-bold text-cyan-600">₹15-30K</p>
                <p className="text-xs text-gray-500 mt-2">admin automation</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Monthly Impact:</h4>
              <div className="bg-white p-6 rounded-lg border-2 border-blue-500">
                <p className="text-5xl font-bold text-blue-600">₹20-50L+</p>
                <p className="text-gray-600 mt-2">Additional revenue + cost savings per month</p>
                <p className="text-blue-600 font-semibold mt-3">For clinics with 500+ monthly patients</p>
              </div>
            </div>
          </div>

          {/* Specific Clinic Types */}
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Revenue by Clinic Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">General Practice</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current monthly revenue</span>
                  <span className="font-semibold">₹5-10L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp impact</span>
                  <span className="font-semibold text-blue-600">+₹3-8L</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total revenue</span>
                  <span className="font-bold text-blue-600">₹8-18L</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Specialty Clinic</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current monthly revenue</span>
                  <span className="font-semibold">₹15-25L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp impact</span>
                  <span className="font-semibold text-blue-600">+₹10-20L</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total revenue</span>
                  <span className="font-bold text-blue-600">₹25-45L</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Multi-Clinic Chain</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current monthly revenue</span>
                  <span className="font-semibold">₹50-100L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp impact</span>
                  <span className="font-semibold text-blue-600">+₹30-60L</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total revenue</span>
                  <span className="font-bold text-blue-600">₹80-160L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Real Healthcare Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Specialty Clinic Chain</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">CHALLENGE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• 35% patient no-show rate</li>
                    <li>• 4 staff members on reminder calls</li>
                    <li>• ₹50L monthly GMV</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">RESULTS (3 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• 20% no-show rate (45% reduction)</li>
                    <li>• 1 staff member needed for other work</li>
                    <li>• ₹75L monthly GMV (+50%)</li>
                    <li>• ₹25L+ additional revenue</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Diagnostic Lab & Clinic</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">CHALLENGE</p>
                  <ul className="text-gray-700 space-y-1 mt-2">
                    <li>• Low follow-up appointment rate</li>
                    <li>• Patients miss medication schedules</li>
                    <li>• ₹20L monthly GMV</li>
                  </ul>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold">RESULTS (6 MONTHS)</p>
                  <ul className="text-green-700 space-y-1 mt-2">
                    <li>• Follow-up rate increased 40%</li>
                    <li>• 60% medication compliance improvement</li>
                    <li>• ₹35L monthly GMV (+75%)</li>
                    <li>• ₹15L additional follow-up revenue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">HIPAA Compliant & Secure</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-300">
              <Lock className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Encrypted End-to-End</h3>
              <p className="text-gray-700">All patient data encrypted with enterprise-grade encryption. WhatsApp's security ensures privacy.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-300">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">HIPAA Compliance</h3>
              <p className="text-gray-700">100% HIPAA-compliant. Can send protected health information (PHI) securely via WhatsApp.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-300">
              <Activity className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit Logs</h3>
              <p className="text-gray-700">Complete audit trails of all communications for compliance and record-keeping purposes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Transform Your Healthcare Practice</h2>
          <p className="text-xl text-blue-100 mb-8">Join 500+ clinics earning ₹20-50L extra every month with WhatsApp</p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-blue-600">
                <Stethoscope className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-6">No credit card required. 7-day free trial with full features.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
