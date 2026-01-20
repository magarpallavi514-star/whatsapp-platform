'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Pixels<span className="text-green-600">WhatsApp</span>
            </span>
          </Link>

          {/* Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-green-600 transition">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-600 hover:text-green-600 transition">
              Pricing
            </Link>
            <Link href="/#faq" className="text-sm text-gray-600 hover:text-green-600 transition">
              FAQ
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
