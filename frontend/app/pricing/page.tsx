'use client'

import { Check, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PlanAgreementModal } from '@/components/PlanAgreementModal'
import { BookDemoModal } from '@/components/BookDemoModal'
import { API_URL } from '@/lib/config/api'

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [selectedPlanName, setSelectedPlanName] = useState<string>("")

  const fallbackPlans = [
    {
      planId: 'starter',
      name: 'Starter',
      description: 'Perfect for getting started',
      monthlyPrice: 2499,
      setupFee: 3000,
      isPopular: false,
      features: {
        included: [
          '1 WhatsApp Number',
          'Broadcast Messaging',
          'Basic Chatbot (Menu-driven)',
          'Live Chat Dashboard',
          '3 Team Agents',
          'Contact Management',
          'Basic Analytics',
          'Email Notifications',
          'Standard Support',
        ],
      },
    },
    {
      planId: 'pro',
      name: 'Pro',
      description: 'For scaling businesses',
      monthlyPrice: 4999,
      setupFee: 3000,
      isPopular: true,
      features: {
        included: [
          '3 WhatsApp Numbers',
          'Everything in Starter',
          'Advanced Chatbot (Logic-based)',
          'Campaign Automation',
          '10 Team Agents',
          'Scheduled Broadcasting',
          'Advanced Analytics & Reports',
          'Webhook Support',
          'Priority Support 24/7',
          'Agent Routing & Tagging',
        ],
      },
    },
  ]

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/pricing/plans/public`)
        const data = await response.json()
        setPlans(data.data || fallbackPlans)
      } catch (err) {
        console.error('Failed to fetch plans:', err)
        setPlans(fallbackPlans)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const plansToDisplay = isLoading ? fallbackPlans : (plans.length > 0 ? plans : fallbackPlans)

  const comparisonFeatures = [
    { name: 'WhatsApp Numbers', starter: '1', pro: '3' },
    { name: 'Team Agents', starter: '3', pro: '10' },
    { name: 'Broadcast Messages', starter: 'Limited', pro: 'Unlimited' },
    { name: 'Chatbot Type', starter: 'Basic (Menu)', pro: 'Advanced (Logic)' },
    { name: 'Campaign Automation', starter: '❌', pro: '✓' },
    { name: 'Scheduled Broadcasting', starter: '❌', pro: '✓' },
    { name: 'Advanced Analytics', starter: 'Basic', pro: 'Advanced' },
    { name: 'Webhook Support', starter: '❌', pro: '✓' },
    { name: 'API Access', starter: '❌', pro: 'Limited' },
    { name: 'Live Chat Dashboard', starter: '✓', pro: '✓' },
    { name: 'Contact Management', starter: '✓', pro: '✓' },
    { name: 'Email Notifications', starter: '✓', pro: '✓' },
    { name: 'Support Level', starter: 'Standard', pro: 'Priority 24/7' },
    { name: 'Agent Routing', starter: '❌', pro: '✓' },
  ]

  return (
    <div className='min-h-screen bg-white'>
      <Navbar />

      {/* HERO */}
      <section className='pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white'>
        <div className='max-w-5xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className='text-6xl font-bold text-gray-900 mb-6'>Transparent Pricing</h1>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              No hidden fees. No surprises. Just simple, straightforward pricing that scales with your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-8 mb-16'>
            {plansToDisplay.map((plan: any, idx: number) => (
              <motion.div
                key={plan.planId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  plan.isPopular
                    ? 'border-gray-300 shadow-2xl lg:scale-105 bg-white'
                    : 'border-gray-200 shadow-lg hover:shadow-xl bg-white'
                }`}
              >
                {/* Header */}
                <div className={`p-8 bg-gray-50 text-gray-900`}>
                  {plan.isPopular && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className='mb-4 inline-block bg-gray-200 text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide'
                    >
                      🌟 RECOMMENDED
                    </motion.div>
                  )}
                  <h3 className='text-3xl font-bold mb-2'>{plan.name}</h3>
                  <p className={`mb-6 text-sm text-gray-600`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className='mb-6'>
                    <div className='flex items-baseline gap-1 mb-2'>
                      <span className='text-5xl font-bold'>₹{plan.monthlyPrice.toLocaleString()}</span>
                      <span className={`text-gray-600`}>/month</span>
                    </div>
                    <p className={`text-sm text-gray-600`}>
                      + ₹{(plan.setupFee || 3000).toLocaleString()} setup (one-time)
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPlanName(plan.name)
                      setShowAgreementModal(true)
                    }}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-center transition-all bg-gray-200 text-gray-900 hover:bg-gray-300`}
                  >
                    Get Started
                  </motion.button>
                </div>

                {/* Features */}
                <div className={`p-8 ${plan.isPopular ? 'bg-white text-gray-900' : ''}`}>
                  <p className='font-semibold text-sm mb-6 text-gray-700 uppercase tracking-wide'>Included Features</p>
                  <motion.ul
                    initial='hidden'
                    whileInView='visible'
                    transition={{ staggerChildren: 0.05 }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                    className='space-y-4'
                  >
                    {plan.features?.included?.map((feature: string, i: number) => (
                      <motion.li
                        key={feature}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.3 }}
                        className='flex gap-3 items-start'
                      >
                        <Check className='h-5 w-5 text-green-600 flex-shrink-0 mt-0.5' />
                        <span className='text-gray-700'>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='bg-green-50 border border-green-200 rounded-xl p-6 mb-16'
          >
            <p className='text-green-900'>
              <strong>💡 Tip:</strong> Choose Pro if you need multiple numbers, advanced automation, and priority support. Start with Starter and upgrade anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* DETAILED COMPARISON TABLE */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>Detailed Comparison</h2>
            <p className='text-gray-600'>See exactly what's included in each plan</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='overflow-x-auto'
          >
            <table className='w-full'>
              <thead>
                <tr className='border-b-2 border-gray-300'>
                  <th className='text-left py-4 px-6 font-bold text-gray-900'>Feature</th>
                  <th className='text-center py-4 px-6 font-bold text-gray-900'>Starter</th>
                  <th className='text-center py-4 px-6 font-bold text-green-600'>Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className={i % 2 === 0 ? 'bg-white hover:bg-green-50' : 'bg-gray-100 hover:bg-green-50'}
                  >
                    <td className='py-4 px-6 font-medium text-gray-900'>{feature.name}</td>
                    <td className='text-center py-4 px-6 text-gray-700'>{feature.starter}</td>
                    <td className='text-center py-4 px-6 text-green-600 font-bold'>{feature.pro}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-3xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            className='space-y-4'
          >
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan anytime. Changes take effect on your next billing cycle.',
              },
              {
                q: 'Do you offer annual billing?',
                a: 'Currently, we bill monthly. Contact us if you need annual billing options.',
              },
              {
                q: 'How do I get started?',
                a: 'Book a demo with our team to understand your needs and get personalized guidance. We\'ll schedule a time that works for you.',
              },
              {
                q: 'What about message costs?',
                a: 'Messages are billed separately at Meta\'s rates (approximately ₹0.15 per message). The plan covers platform features only.',
              },
              {
                q: 'Can I get a custom plan?',
                a: 'Absolutely! For enterprises with special needs, book a demo or contact our sales team for a custom proposal.',
              },
              {
                q: 'What if I need help choosing?',
                a: 'Our team is happy to help! Contact us and we\'ll recommend the best plan for your use case.',
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
                className='group border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-green-600 hover:shadow-lg transition-all'
              >
                <summary className='flex items-center justify-between font-bold text-gray-900'>
                  {faq.q}
                  <motion.div
                    animate={{ rotate: 0 }}
                    className='group-open:rotate-90 transition-transform text-green-600'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </motion.div>
                </summary>
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className='text-gray-600 mt-4 leading-relaxed'
                >
                  {faq.a}
                </motion.p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700'>
        <div className='max-w-4xl mx-auto text-center text-white'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className='text-4xl font-bold mb-6'>Ready to grow your business?</h2>
            <p className='text-lg text-green-100 mb-8 max-w-2xl mx-auto'>
              Book a demo today and see how Replysys can transform your customer engagement.
            </p>
            <button
              onClick={() => setShowDemoModal(true)}
              className='bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2 transition-all shadow-lg'
            >
              Book Your Demo <ArrowRight className='h-5 w-5' />
            </button>
          </motion.div>
        </div>
      </section>

      {/* MODALS */}
      <PlanAgreementModal
        isOpen={showAgreementModal}
        planName={selectedPlanName}
        onClose={() => {
          setShowAgreementModal(false)
          setSelectedPlanName('')
        }}
        onConfirm={() => {
          window.location.href = `/checkout?plan=${encodeURIComponent(selectedPlanName)}`
        }}
      />

      <BookDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />

      <Footer />
    </div>
  )
}
