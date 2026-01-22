'use client'

import { Users, Target, Zap, Globe, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'We prioritize customer success and satisfaction in everything we do'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly pushing boundaries to deliver cutting-edge solutions'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Built to serve businesses of all sizes, from startups to enterprises'
    },
    {
      icon: Award,
      title: 'Reliability',
      description: '99.9% uptime SLA with enterprise-grade infrastructure'
    }
  ]

  const team = [
    {
      name: 'Piyush Sharma',
      role: 'Founder & CEO',
      bio: 'Visionary leader with 8+ years in fintech and messaging platforms'
    },
    {
      name: 'Akash Verma',
      role: 'CTO',
      bio: 'Full-stack architect specializing in scalable WhatsApp integrations'
    },
    {
      name: 'Priya Desai',
      role: 'VP Sales',
      bio: 'Sales strategist who has closed 50+ enterprise deals'
    },
    {
      name: 'Rahul Kumar',
      role: 'Head of Support',
      bio: 'Customer success expert ensuring 98% satisfaction rating'
    }
  ]

  const timeline = [
    { year: '2023', event: 'PixelsWhatsApp founded' },
    { year: '2023', event: 'First 100 customers signed' },
    { year: '2024', event: 'Crossed ₹1Cr+ ARR' },
    { year: '2025', event: '500+ customers, ₹5Cr+ annual revenue' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About PixelsWhatsApp</h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering businesses with intelligent WhatsApp solutions since 2023
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-green-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg mb-4">
                To democratize WhatsApp Business API access, making it affordable and easy for businesses of all sizes to engage with customers through the world's most trusted messaging platform.
              </p>
              <p className="text-gray-700">
                We believe every business deserves world-class customer communication tools. Our mission is to remove barriers to entry and help entrepreneurs scale their operations efficiently.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg mb-4">
                To become the most trusted WhatsApp platform in Asia, serving 10,000+ businesses and processing 1 billion+ messages annually.
              </p>
              <p className="text-gray-700">
                We envision a future where meaningful customer communication is automated, personalized, and accessible to everyone—creating better experiences for both businesses and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">500+</p>
              <p className="text-gray-600 font-medium">Active Customers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">1B+</p>
              <p className="text-gray-600 font-medium">Messages Processed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">₹5Cr+</p>
              <p className="text-gray-600 font-medium">Annual Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">99.9%</p>
              <p className="text-gray-600 font-medium">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Journey</h2>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  {index < timeline.length - 1 && (
                    <div className="w-1 h-16 bg-green-200 mt-4"></div>
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-2xl font-bold text-green-600">{item.year}</p>
                  <p className="text-gray-700 text-lg">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Leadership Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our experienced team brings decades of combined expertise in WhatsApp integration, SaaS, and customer engagement
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <Users className="h-16 w-16 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-green-600 font-semibold mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Join Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Rapid Growth
              </h3>
              <p className="text-gray-700">
                We're scaling fast with 100%+ YoY growth. Join a team on a mission to transform Indian SaaS.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Great Culture
              </h3>
              <p className="text-gray-700">
                Remote-friendly, collaborative team with focus on continuous learning and innovation.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Global Impact
              </h3>
              <p className="text-gray-700">
                Our platform impacts millions of customers and businesses globally every single day.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Competitive Benefits
              </h3>
              <p className="text-gray-700">
                Competitive salary, stock options, health insurance, and professional development budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join 500+ businesses already using PixelsWhatsApp to drive customer engagement
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                View Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
          <p className="text-gray-600 text-lg mb-8">
            Have questions about our company or services? We'd love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-2">Email</p>
              <a href="mailto:hello@pixelswhatsapp.com" className="text-green-600 font-semibold hover:underline">
                hello@pixelswhatsapp.com
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Phone</p>
              <a href="tel:+919876543210" className="text-green-600 font-semibold hover:underline">
                +91 98765 43210
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Office</p>
              <p className="text-green-600 font-semibold">Bangalore, India</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
