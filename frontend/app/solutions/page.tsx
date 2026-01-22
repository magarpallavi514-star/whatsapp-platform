'use client'

import { ShoppingBag, Stethoscope, Home, BookOpen, UtensilsCrossed, CreditCard, Plane, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function SolutionsPage() {
  const industries = [
    {
      icon: ShoppingBag,
      name: 'E-Commerce',
      description: 'Boost sales with personalized customer engagement',
      highlight: '₹22-70L+ monthly additional revenue',
      link: '/solutions/ecommerce',
      color: 'blue',
      benefits: ['40% cart recovery', '+35% repeat orders', '70% conversion on flash sales']
    },
    {
      icon: Stethoscope,
      name: 'Healthcare',
      description: 'Improve patient engagement and clinic operations',
      highlight: '₹20-50L+ monthly additional revenue',
      link: '/solutions/healthcare',
      color: 'blue',
      benefits: ['45% no-show reduction', '+40% follow-ups', '98% patient satisfaction']
    },
    {
      icon: Home,
      name: 'Real Estate',
      description: 'Drive sales with instant property inquiries',
      highlight: '₹2.5-10L+ per agent monthly',
      link: '/solutions/realestate',
      color: 'amber',
      benefits: ['80% instant responses', '65% site visit scheduling', '50% faster deal cycles']
    },
    {
      icon: BookOpen,
      name: 'Education',
      description: 'Enhance student engagement and revenues',
      highlight: '₹1-2Cr+ annual additional revenue',
      link: '/solutions/education',
      color: 'purple',
      benefits: ['75% fee collection', '+50-100 new admissions', '+25% student retention']
    },
    {
      icon: UtensilsCrossed,
      name: 'Food & Beverage',
      description: 'Drive orders and boost customer loyalty',
      highlight: '₹45-115L+ monthly additional revenue',
      link: '/solutions/food-beverage',
      color: 'orange',
      benefits: ['85% show-up rate', '+40% repeat orders', '60% conversion on deals']
    },
    {
      icon: CreditCard,
      name: 'Financial Services',
      description: 'Improve customer engagement and compliance',
      highlight: '₹1-3Cr+ annual additional revenue',
      link: '/solutions/financial-services',
      color: 'indigo',
      benefits: ['70% support cost reduction', '+35% loan conversion', '40% on-time payments']
    },
    {
      icon: Plane,
      name: 'Travel & Tourism',
      description: 'Increase bookings and reduce cancellations',
      highlight: '₹45-155L+ monthly additional revenue',
      link: '/solutions/travel-tourism',
      color: 'cyan',
      benefits: ['40% cancellation reduction', '+50% repeat bookings', '+50% AOV increase']
    },
    {
      icon: Zap,
      name: 'SaaS & Tech',
      description: 'Improve onboarding and reduce churn',
      highlight: '₹1.5-3Cr+ annual additional revenue',
      link: '/solutions/saas-tech',
      color: 'emerald',
      benefits: ['50% churn reduction', '+40% expansion revenue', '90% support resolution']
    }
  ]

  const getColorClasses = (color: string) => {
    // All colors use the same theme: White, Green, Dark
    return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', lightBg: 'bg-green-100' }
  }

  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Industry-Specific Solutions
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              WhatsApp solutions tailored for your industry. Choose your sector to see how we can transform your business.
            </p>
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => {
              const colors = getColorClasses(industry.color)
              const IconComponent = industry.icon
              
              return (
                <Link key={industry.name} href={industry.link}>
                  <div className={`h-full ${colors.bg} border-2 ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}>
                    <div className={`h-12 w-12 ${colors.lightBg} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{industry.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{industry.description}</p>
                    
                    <div className={`${colors.lightBg} rounded-lg p-3 mb-4`}>
                      <p className={`text-sm font-semibold ${colors.text}`}>{industry.highlight}</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {industry.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${colors.text}`}></div>
                          <p className="text-xs text-gray-700">{benefit}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm`}>
                      Learn More <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Cross-Industry Success Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Customers Using Pixels</p>
              <p className="text-4xl font-bold text-gray-900">2,500+</p>
              <p className="text-sm text-gray-500 mt-4">Across all industries</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Avg Revenue Increase</p>
              <p className="text-4xl font-bold text-green-600">+45%</p>
              <p className="text-sm text-gray-500 mt-4">Monthly GMV improvement</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Avg Cost Savings</p>
              <p className="text-4xl font-bold text-blue-600">₹30-50L</p>
              <p className="text-sm text-gray-500 mt-4">Per customer annually</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Customer Satisfaction</p>
              <p className="text-4xl font-bold text-purple-600">4.8/5</p>
              <p className="text-sm text-gray-500 mt-4">Average rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works for Your Industry</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Choose Your Industry</h3>
                <p className="mt-2 text-gray-600">Select your industry from the grid above to explore industry-specific features and benefits.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">See Real ROI Numbers</h3>
                <p className="mt-2 text-gray-600">View detailed revenue impact, success stories, and metrics from businesses similar to yours.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Start Your Free Trial</h3>
                <p className="mt-2 text-gray-600">Get 7 days free access with all features. No credit card required. Set up takes just 5 minutes.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Scale & Earn</h3>
                <p className="mt-2 text-gray-600">Deploy across your business. Most customers see ROI within 2-3 weeks of using Pixels.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8">Pick your industry above and start your free 7-day trial today</p>
          <Link href="/checkout">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Get Started for Free
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-6">No credit card required. Full feature access for 7 days.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
