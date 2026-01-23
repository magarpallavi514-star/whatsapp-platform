"use client"

import {
  MessageSquare,
  ArrowRight,
  Check,
  Play,
  Sparkles,
  Megaphone,
  Bot,
  Send,
  Users,
  BarChart3,
  Target,
  FileText,
  CreditCard,
  Clock,
  Shield,
  HeadphonesIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ErrorToast } from "@/components/ErrorToast"
import { API_URL } from "@/lib/config/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function LandingPage() {
  const router = useRouter()
  const [pricingPlans, setPricingPlans] = useState<any[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string>("")  

  /* FALLBACK PLANS */
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
          "Basic Chatbot (Menu-driven)",
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
          "Advanced Chatbot (Logic-based)",
          "Campaign Automation",
          "10 Team Agents",
          "Scheduled Broadcasting",
          "Advanced Analytics & Reports",
          "SMS Gateway Integration",
          "Webhook Support",
          "Priority Support",
        ],
        excluded: [],
      },
    },
  ]

  /* FEATURES LIST */
  const features = [
    { icon: Megaphone, title: "Broadcast Messages", description: "Send promotional messages with 98% open rates" },
    { icon: Bot, title: "No-Code Chatbot", description: "Drag-and-drop automation flows" },
    { icon: Send, title: "Template Messages", description: "Send approved marketing templates" },
    { icon: Users, title: "Multi-Agent Chat", description: "Multiple agents on same number" },
    { icon: BarChart3, title: "Real-Time Analytics", description: "Track delivery & ROI" },
    { icon: Target, title: "Click-to-WhatsApp Ads", description: "Meta ads to WhatsApp" },
    { icon: FileText, title: "WhatsApp Forms", description: "Capture leads in chat" },
    { icon: CreditCard, title: "Payment Integration", description: "Accept payments" },
    { icon: Clock, title: "Campaign Scheduler", description: "Schedule months ahead" },
    { icon: Shield, title: "Official Green Tick", description: "Verified badge" },
    { icon: Sparkles, title: "Smart Retargeting", description: "Intelligent segmentation" },
    { icon: HeadphonesIcon, title: "24/7 Support", description: "Priority support" },
  ]

  /* AUTH CHECK */
  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  /* FETCH PRICING */
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoadingPlans(true)
        const res = await fetch(`${API_URL}/pricing/plans/public`)
        if (res.ok) {
          const data = await res.json()
          if (data?.data?.length) {
            setPricingPlans(
              data.data.map((p: any) => ({ ...p, setupFee: p.setupFee || 3000 }))
            )
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          5X Your Revenue with <span className="text-green-600">WhatsApp Marketing</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Broadcast, Automate, Engage & Sell with AI-powered WhatsApp platform
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Start for FREE <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200 hover:border-green-600">
                <feature.icon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {isLoadingPlans ? (
              <div className="col-span-2 text-center py-12">Loading plans...</div>
            ) : (
              plansToRender.map((plan: any) => (
                <motion.div
                  key={plan.planId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`p-8 rounded-xl border-2 ${
                    plan.isPopular
                      ? "border-green-600 bg-green-50 ring-2 ring-green-600 scale-105"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {plan.isPopular && (
                    <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">₹{plan.monthlyPrice.toLocaleString()}</span>
                    <span className="text-gray-600"> / month</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push("/auth/register")
                      } else {
                        router.push(`/checkout?plan=${plan.planId}`)
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-semibold mb-6 ${
                      plan.isPopular
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border-2 border-green-600 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    Get Started
                  </button>

                  <ul className="space-y-2">
                    {plan.features?.included?.map((feature: string) => (
                      <li key={feature} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
    {error && <ErrorToast message={error} onDismiss={() => setError("")} />}
  )
}
