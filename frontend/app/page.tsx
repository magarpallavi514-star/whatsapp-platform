"use client"

import { 
  MessageSquare, ArrowRight, Check, Play, Sparkles, Megaphone, Bot, Send, 
  Users, BarChart3, Target, FileText, CreditCard, Clock, Shield, 
  HeadphonesIcon, CheckCircle2, Zap, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const features = [
    {
      icon: Megaphone,
      title: "Broadcast Messages",
      description: "Send promotional messages, offers, and updates to unlimited customers with 98% open rates"
    },
    {
      icon: Bot,
      title: "No-Code Chatbot",
      description: "Build intelligent chatbot flows in minutes with drag-and-drop builder. Automate support & sales"
    },
    {
      icon: Send,
      title: "Template Messages",
      description: "Create and send approved template messages for marketing, utility, and authentication"
    },
    {
      icon: Users,
      title: "Multi-Agent Chat",
      description: "Multiple team members on same WhatsApp number with smart routing and agent transfer"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track delivery, read, and click rates in real-time. Monitor ROI on every campaign"
    },
    {
      icon: Target,
      title: "Click-to-WhatsApp Ads",
      description: "Run Facebook & Instagram ads that land on WhatsApp. 5X your lead generation instantly"
    },
    {
      icon: FileText,
      title: "WhatsApp Forms",
      description: "Capture leads and collect information directly in WhatsApp chats with interactive forms"
    },
    {
      icon: CreditCard,
      title: "Payment Integration",
      description: "Accept payments seamlessly on WhatsApp with Razorpay, PayU, and WhatsApp Pay"
    },
    {
      icon: Clock,
      title: "Campaign Scheduler",
      description: "Schedule broadcasts up to 2 months ahead. Set it and forget it with automated campaigns"
    },
    {
      icon: Shield,
      title: "Official Green Tick",
      description: "Get verified green tick badge. Free WhatsApp Business API with zero setup fees"
    },
    {
      icon: Sparkles,
      title: "Smart Retargeting",
      description: "Segment audience by behavior, tags, and attributes. Retarget with precision messaging"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Live Support",
      description: "Dedicated support team available via WhatsApp, phone, and email. Priority assistance"
    }
  ]

  const pricingPlans = [
    {
      name: "Free Forever",
      price: "₹0",
      period: "Forever",
      description: "Get started with WhatsApp API",
      features: [
        "Free WhatsApp Business API",
        "Free Green Tick Application",
        "₹50 Free Conversation Credits",
        "Unlimited Service Conversations",
        "Click to WhatsApp Ads Manager",
        "Upload & Manage Contacts",
        "Create Template Messages",
        "Live Chat Dashboard"
      ],
      cta: "Start for FREE",
      popular: false
    },
    {
      name: "Basic",
      price: billingCycle === 'monthly' ? "₹1,500" : "₹1,350",
      period: "per month",
      description: "Everything you need to get started",
      features: [
        "All Free Forever Features",
        "1 Owner + 5 FREE Agents",
        "Broadcasting & Retargeting",
        "Multi-Agent Live Chat",
        "Template Message APIs",
        "Marketplace Integrations",
        "2400 Messages/min",
        "Shopify & WooCommerce"
      ],
      pricing: {
        marketing: "₹1.09/msg",
        utility: "₹0.145/msg",
        authentication: "₹0.145/msg"
      },
      cta: "Get Started",
      popular: true
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "₹3,200" : "₹2,880",
      period: "per month",
      description: "For growing businesses",
      features: [
        "All Basic Plan Features",
        "Upto 100 Tags",
        "Upto 20 Custom Attributes",
        "Campaign Scheduler",
        "Campaign Click Tracking",
        "Smart Agent Routing",
        "Campaign Budget Analytics",
        "CSV Campaign Scheduler"
      ],
      pricing: {
        marketing: "₹1.09/msg",
        utility: "₹0.145/msg",
        authentication: "₹0.145/msg"
      },
      cta: "Get Started",
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Contact Sales",
      description: "For 5 Lac+ messages per month",
      features: [
        "All Pro Plan Features",
        "Unlimited Tags & Attributes",
        "Downloadable Reports",
        "Dedicated Account Manager",
        "Priority Customer Support",
        "Webhooks Integration",
        "Higher Messaging Speed",
        "Custom SLA"
      ],
      pricing: {
        marketing: "Custom pricing",
        utility: "₹0.145/msg",
        authentication: "₹0.145/msg"
      },
      cta: "Contact Sales",
      popular: false
    }
  ]

  const faqs = [
    {
      q: "What is WhatsApp Business API?",
      a: "WhatsApp Business API allows businesses to send notifications, respond to customers, and automate conversations at scale on WhatsApp."
    },
    {
      q: "How long does setup take?",
      a: "You can get your WhatsApp Business API approved and start sending messages within 10 minutes. We handle all the setup for you."
    },
    {
      q: "What are service conversations?",
      a: "Service conversations are user-initiated messages. When customers message you first, you can reply for free within 24 hours. Unlimited and FREE!"
    },
    {
      q: "Can I use my existing number?",
      a: "Yes! You can use your existing business number or get a new virtual number from us for ₹199/month."
    },
    {
      q: "Is there a setup fee?",
      a: "No! We provide FREE WhatsApp Business API with zero setup fees. You only pay for the messages you send."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pixels<span className="text-green-600">WhatsApp</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-gray-600 hover:text-green-600 transition">Features</Link>
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-green-600 transition">Pricing</Link>
              <Link href="#faq" className="text-sm text-gray-600 hover:text-green-600 transition">FAQ</Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Trusted by 1000+ Businesses across India
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                5X Your Revenue with{" "}
                <span className="text-green-600">WhatsApp Marketing</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Broadcast, Automate, Engage, Sell - do everything with the AI-powered WhatsApp Marketing & Engagement Platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-base h-12 px-8">
                  Start for FREE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-base h-12 px-8">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Setup in 10 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Free Green Tick</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Open Rates" },
              { value: "45-60%", label: "Click Rates" },
              { value: "2.6Bn+", label: "Active Users" },
              { value: "7%", label: "Engagement Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Advanced Features that Drive Conversions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to engage customers, automate workflows, and grow your business on WhatsApp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group"
              >
                <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose a plan that works for your business. Scale as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                  billingCycle === 'yearly'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly <span className="text-green-600 ml-1">(Save 10%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-green-600 text-white ring-4 ring-green-600 ring-offset-2'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-700 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-green-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.popular ? 'text-green-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                {plan.pricing && (
                  <div className={`mb-6 p-3 rounded-lg ${plan.popular ? 'bg-green-700' : 'bg-gray-50'}`}>
                    <div className="text-xs space-y-1">
                      <div>Marketing: {plan.pricing.marketing}</div>
                      <div>Utility: {plan.pricing.utility}</div>
                      <div>Auth: {plan.pricing.authentication}</div>
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? 'bg-white text-green-600 hover:bg-gray-100'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-green-100' : 'text-green-600'
                      }`} />
                      <span className={`text-sm ${plan.popular ? 'text-green-50' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              💡 <strong>Service Conversations are FREE!</strong> Reply to customer messages within 24 hours at no cost.
            </p>
            <p className="text-sm text-gray-500">
              All plans include unlimited free service conversations, free WhatsApp Business API, and free Green Tick verification.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Customer Engagement?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join 1000+ businesses using Pixels WhatsApp Platform to grow faster. Get started in 10 minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-base h-12 px-8">
                Start for FREE
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-base h-12 px-8">
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">PixelsWhatsApp</span>
              </div>
              <p className="text-sm text-gray-400">
                Transform your customer engagement with the power of WhatsApp Business API.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">API Docs</Link></li>
                <li><Link href="#" className="hover:text-white transition">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition">Support</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Pixels WhatsApp Platform. Made with ♥️ in India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
