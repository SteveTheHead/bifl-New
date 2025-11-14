'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Mail, CheckCircle, XCircle, Calendar } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  subscribed: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

export default function AdminSubscribers() {
  const router = useRouter()
  const [session, setSession] = useState<{name?: string; email?: string; isAdmin?: boolean} | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [counts, setCounts] = useState({ total: 0, subscribed: 0, unsubscribed: 0 })
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all')

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session')
      const data = await response.json()

      if (data.isAuthenticated && data.user?.isAdmin) {
        setSession(data.user)
        setLoading(false)
      } else {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/auth/signin')
    }
  }, [router])

  const fetchSubscribers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subscribers')
      const data = await response.json()
      setSubscribers(data.subscribers || [])
      if (data.counts) {
        setCounts(data.counts)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (!loading && session?.isAdmin) {
      fetchSubscribers()
    }
  }, [loading, session, fetchSubscribers])

  const filteredSubscribers = subscribers.filter(sub => {
    if (filter === 'all') return true
    if (filter === 'subscribed') return sub.subscribed
    if (filter === 'unsubscribed') return !sub.subscribed
    return true
  })

  const downloadCSV = () => {
    // Prepare CSV data
    const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At', 'Created At']
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      sub.subscribed ? 'Subscribed' : 'Unsubscribed',
      new Date(sub.subscribed_at).toLocaleString(),
      sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : 'N/A',
      new Date(sub.created_at).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark mx-auto"></div>
          <p className="mt-4 text-brand-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-brand-dark hover:text-brand-darker mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">Newsletter Subscribers</h1>
              <p className="text-brand-gray mt-1">Manage and export newsletter subscribers</p>
            </div>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray">Total Subscribers</p>
                <p className="text-3xl font-bold text-brand-dark mt-2">{counts.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.subscribed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray">Unsubscribed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{counts.unsubscribed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'subscribed', label: 'Active', count: counts.subscribed },
              { key: 'unsubscribed', label: 'Unsubscribed', count: counts.unsubscribed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  filter === tab.key
                    ? 'text-brand-dark border-b-2 border-brand-dark'
                    : 'text-brand-gray hover:text-brand-dark'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key
                    ? 'bg-brand-dark text-white'
                    : 'bg-gray-100 text-brand-gray'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-brand-gray">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-brand-dark">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {subscriber.subscribed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unsubscribed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                        {subscriber.unsubscribed_at ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(subscriber.unsubscribed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-brand-gray">
          Showing {filteredSubscribers.length} of {counts.total} total subscribers
        </div>
      </div>
    </div>
  )
}
