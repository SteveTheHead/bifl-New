'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Feedback {
  id: string
  feedback_type: string
  subject: string
  details: string
  contact_name: string | null
  contact_email: string | null
  status: 'new' | 'in_review' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export default function FeedbackAdminPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [statusFilter, typeFilter])

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('feedback_type', typeFilter)

      const response = await fetch(`/api/admin/feedback?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setFeedback(data.feedback || [])
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh feedback list
        fetchFeedback()
        // Close detail view
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return

    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFeedback()
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
    }
  }

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      in_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  const getTypeBadgeStyle = (type: string) => {
    const styles = {
      website_bug: 'bg-red-50 text-red-700',
      product_suggestion: 'bg-purple-50 text-purple-700',
      data_correction: 'bg-orange-50 text-orange-700',
      general_idea: 'bg-blue-50 text-blue-700',
    }
    return styles[type as keyof typeof styles] || ''
  }

  const formatFeedbackType = (type: string) => {
    const labels = {
      website_bug: 'Website Bug',
      product_suggestion: 'Product Suggestion',
      data_correction: 'Data Correction',
      general_idea: 'General Idea',
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-brand-dark">Feedback Management</h1>
              <p className="text-brand-gray mt-1">Review and manage user feedback submissions</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-brand-dark border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="all">All Types</option>
                <option value="website_bug">Website Bug</option>
                <option value="product_suggestion">Product Suggestion</option>
                <option value="data_correction">Data Correction</option>
                <option value="general_idea">General Idea</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-brand-dark">{feedback.length}</div>
            <div className="text-sm text-brand-gray">Total Feedback</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {feedback.filter(f => f.status === 'new').length}
            </div>
            <div className="text-sm text-brand-gray">New</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {feedback.filter(f => f.status === 'in_review').length}
            </div>
            <div className="text-sm text-brand-gray">In Review</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {feedback.filter(f => f.status === 'resolved').length}
            </div>
            <div className="text-sm text-brand-gray">Resolved</div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-brand-gray">Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className="p-12 text-center text-brand-gray">No feedback found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-brand-dark">{item.subject}</div>
                        <div className="text-sm text-brand-gray truncate max-w-xs">
                          {item.details.substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeBadgeStyle(item.feedback_type)}`}>
                          {formatFeedbackType(item.feedback_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeStyle(item.status)}`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-gray">
                        {item.contact_name || 'Anonymous'}
                        {item.contact_email && (
                          <div className="text-xs text-brand-gray">{item.contact_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="text-brand-teal hover:text-brand-teal/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-brand-dark">Feedback Details</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded ${getTypeBadgeStyle(selectedFeedback.feedback_type)}`}>
                  {formatFeedbackType(selectedFeedback.feedback_type)}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusBadgeStyle(selectedFeedback.status)}`}>
                  {selectedFeedback.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Subject</label>
                <p className="text-lg font-semibold text-brand-dark">{selectedFeedback.subject}</p>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Details</label>
                <p className="text-brand-dark whitespace-pre-wrap">{selectedFeedback.details}</p>
              </div>

              {/* Contact Info */}
              {(selectedFeedback.contact_name || selectedFeedback.contact_email) && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-brand-gray mb-2">Contact Information</label>
                  {selectedFeedback.contact_name && (
                    <p className="text-brand-dark">Name: {selectedFeedback.contact_name}</p>
                  )}
                  {selectedFeedback.contact_email && (
                    <p className="text-brand-dark">Email: {selectedFeedback.contact_email}</p>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="border-t border-gray-200 pt-4 text-sm text-brand-gray">
                <p>Submitted: {formatDate(selectedFeedback.created_at)}</p>
                <p>Last Updated: {formatDate(selectedFeedback.updated_at)}</p>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-brand-gray mb-3">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, 'new')}
                    disabled={selectedFeedback.status === 'new'}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as New
                  </button>
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, 'in_review')}
                    disabled={selectedFeedback.status === 'in_review'}
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as In Review
                  </button>
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, 'resolved')}
                    disabled={selectedFeedback.status === 'resolved'}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, 'closed')}
                    disabled={selectedFeedback.status === 'closed'}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Closed
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => deleteFeedback(selectedFeedback.id)}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
