'use client'

import { useState } from 'react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('🎉 Thanks for subscribing! Check your email for confirmation.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-brand-teal to-brand-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Stay in the Loop
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Get notified when new products earn BIFL certification, exclusive community insights,
            durability tips, and special deals on quality products that last.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-6 py-4 rounded-lg text-brand-dark placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 bg-white shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="bg-brand-dark text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-dark/90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
              >
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>

            {/* Status messages */}
            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-500/20 text-white border border-green-300/30'
                  : 'bg-red-500/20 text-white border border-red-300/30'
              }`}>
                {message}
              </div>
            )}

            <p className="text-white/80 text-sm mt-6">
              No spam, ever. Unsubscribe anytime. Join 1,000+ quality-conscious shoppers.
            </p>
          </form>

          {/* Social proof badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-10 border-t border-white/20">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/90 text-sm">Weekly updates</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/90 text-sm">Exclusive deals</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/90 text-sm">Expert insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
