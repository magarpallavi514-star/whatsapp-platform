"use client"

import {
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  Clock,
  Shield,
  Sparkles,
  HeadphonesIcon,
  ChevronRight,
} from "lucide-react"
import { PlanAgreementModal } from "@/components/PlanAgreementModal"
import { BookDemoModal } from "@/components/BookDemoModal"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/config/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function LandingPage() {
  const router = useRouter()
  const [pricingPlans, setPricingPlans] = useState<any[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [selectedPlanName, setSelectedPlanName] = useState<string>("")

  const fallbackPlans = [
    {
      planId: "starter",
      name: "Starter",
      description: "Perfect for getting started",
      monthlyPrice: 2499,
      setupFee: 3000,
      isPopular: false,
      features: {
        included: [
          "1 WhatsApp Number",
          "Broadcast Messaging",
          "Basic Chatbot",
          "Live Chat Dashboard",
          "3 Team Agents",
          "Contact Management",
          "Basic Analytics",
          "Email Notifications",
          "Payment Link Support",
          "Standard Support",
        ],
        excluded: [
          "Advanced Chatbot Flows",
          "Campaign Automation",
          "Webhook Support",
        ],
      },
    },
    {
      planId: "pro",
      name: "Pro",
      description: "For scaling businesses",
      monthlyPrice: 4999,
      setupFee: 3000,
      isPopular: true,
      features: {
        included: [
          "3 WhatsApp Numbers",
          "Everything in Starter",
          "Advanced Chatbot",
          "Campaign Automation",
          "10 Team Agents",
          "Scheduled Broadcasting",
          "Advanced Analytics",
          "SMS Gateway Integration",
          "Webhook Support",
          "Priority Support 24/7",
          "Agent Routing & Tagging",
        ],
        excluded: [],
      },
    },
  ]

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoadingPlans(true)
        const res = await fetch(`${API_URL}/pricing/plans/public`)
        if (res.ok) {
          const data = await res.json()
          if (data?.data?.length) {
            setPricingPlans(data.data.map((p: any) => ({ ...p, setupFee: p.setupFee || 3000 })))
          }
        }
      } catch (e) {
        console.error("Failed to fetch pricing:", e)
      } finally {
        setIsLoadingPlans(false)
      }
    }
    fetchPricing()
  }, [])

  const plansToRender = pricingPlans.length ? pricingPlans : fallbackPlans

  const features = [
    {
      icon: Zap,
      title: "Instant Broadcasting",
      description: "Send promotional messages to thousands in seconds"
    },
    {
      icon: Sparkles,
      title: "Smart Automation",
      description: "AI-powered chatbots that handle customer conversations 24/7"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track every message, click, and conversion in real-time"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Multiple agents working together on one WhatsApp number"
    },
    {
      icon: Target,
      title: "Smart Segmentation",
      description: "Target specific audiences with personalized messages"
    },
    {
      icon: Clock,
      title: "Schedule Campaigns",
      description: "Plan campaigns weeks in advance with smart scheduling"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with GDPR & local laws"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Expert support team available around the clock"
    },
  ]

  const stats = [
    { number: "98%", label: "Message Open Rate" },
    { number: "10M+", label: "Messages Sent Daily" },
    { number: "500+", label: "Active Businesses" },
    { number: "24/7", label: "Customer Support" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 via-white to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-6">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                The WhatsApp Platform for Business
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn WhatsApp into <span className="text-green-600">Your Growth Engine</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Reach, engage, and convert customers directly on WhatsApp. Broadcast messages, automate replies, and manage teams—all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => setShowDemoModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                Book Demo <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                href="/pricing"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center justify-center gap-2 transition-all"
              >
                View Pricing <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for businesses that want to scale faster with WhatsApp
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl border border-gray-200 hover:border-green-600 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE REPLYSYS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose Replysys?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by entrepreneurs for entrepreneurs who want to scale faster
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Simple to Use",
                description: "No coding required. Set up campaigns in minutes, not weeks. Intuitive interface anyone can master.",
                icon: "⚡",
              },
              {
                title: "Transparent Pricing",
                description: "No hidden fees. What you see is what you pay. Only charged for messages you actually send.",
                icon: "💰",
              },
              {
                title: "Dedicated Support",
                description: "Get help when you need it. Expert team available 24/7 to answer questions and solve problems.",
                icon: "🤝",
              },
            ].map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{reason.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business. Scale up anytime.
            </p>
          </motion.div>

          {isLoadingPlans ? (
            <div className="text-center py-12">Loading plans...</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plansToRender.map((plan: any, idx: number) => (
                <motion.div
                  key={plan.planId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${
                    plan.isPopular
                      ? "border-green-600 shadow-2xl lg:scale-105 bg-gradient-to-br from-green-600 to-green-700"
                      : "border-gray-200 shadow-lg hover:shadow-xl bg-white"
                  }`}
                >
                  {/* Header */}
                  <div className={`p-8 ${plan.isPopular ? "text-white" : "bg-gray-50 text-gray-900"}`}>
                    {plan.isPopular && (
                      <div className="mb-4 inline-block bg-white text-green-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                        🌟 MOST POPULAR
                      </div>
                    )}
                    <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                    <p className={`mb-6 text-sm ${plan.isPopular ? "text-green-100" : "text-gray-600"}`}>
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-5xl font-bold">₹{plan.monthlyPrice.toLocaleString()}</span>
                        <span className={plan.isPopular ? "text-green-100" : "text-gray-600"}>/month</span>
                      </div>
                      <p className={`text-sm ${plan.isPopular ? "text-green-100" : "text-gray-600"}`}>
                        + ₹{(plan.setupFee || 3000).toLocaleString()} setup fee (one-time)
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPlanName(plan.name)
                        setShowAgreementModal(true)
                      }}
                      className={`w-full py-3 px-6 rounded-lg font-bold text-center transition-all ${
                        plan.isPopular
                          ? "bg-white text-green-600 hover:bg-gray-100"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      Get Started
                    </button>
                  </div>

                  {/* Features */}
                  <div className={`p-8 ${plan.isPopular ? "bg-white text-gray-900" : ""}`}>
                    <p className="font-semibold text-sm mb-5 text-gray-700 uppercase tracking-wide">What's Included</p>
                    <ul className="space-y-4 mb-8">
                      {plan.features?.included?.map((feature: string) => (
                        <li key={feature} className="flex gap-3 items-start">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.features?.excluded?.length > 0 && (
                      <>
                        <p className="font-semibold text-sm mb-4 text-gray-500 uppercase tracking-wide">Upgrade to Pro</p>
                        <ul className="space-y-3">
                          {plan.features.excluded.map((feature: string) => (
                            <li key={feature} className="flex gap-3 items-start opacity-50">
                              <span className="text-gray-400 mt-0.5">✕</span>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Want a custom plan?{" "}
              <a href="mailto:sales@replysys.com" className="text-green-600 font-bold hover:underline">
                Contact our sales team
              </a>
            </p>
            <p className="text-sm text-gray-500">
              All plans include 24/7 customer support. Messages charged at Meta's rates (approximately ₹0.15 per message)
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-green-100">
        <div className="max-w-4xl mx-auto text-center text-gray-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Join 500+ businesses already using Replysys to scale their WhatsApp marketing
            </p>
            <button
              onClick={() => setShowDemoModal(true)}
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2 transition-all shadow-lg"
            >
              Book Your Demo <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* PLAN AGREEMENT MODAL */}
      <PlanAgreementModal
        isOpen={showAgreementModal}
        planName={selectedPlanName}
        onClose={() => {
          setShowAgreementModal(false)
          setSelectedPlanName("")
        }}
        onConfirm={() => {
          window.location.href = `/checkout?plan=${encodeURIComponent(selectedPlanName)}`
        }}
      />

      {/* BOOK DEMO MODAL */}
      <BookDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />

      <Footer />
    </div>
  )
}
