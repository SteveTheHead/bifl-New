'use client'

import { useState, FormEvent } from 'react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const [contactName, setContactName] = useState<string>('')
  const [contactEmail, setContactEmail] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!feedbackType || !subject || !details) {
      setStatus('error')
      setMessage('Please fill in all required fields')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          subject,
          details,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thank you! Your feedback has been submitted successfully.')

        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          setFeedbackType('')
          setSubject('')
          setDetails('')
          setContactName('')
          setContactEmail('')
          setStatus('idle')
          setMessage('')
          onClose()
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to submit feedback. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-brand-dark">Help Us Improve</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-brand-gray mb-6">
            Our goal is to build the most trusted resource for durable goods, and your feedback is a critical part of that process.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Radio Buttons */}
            <div>
              <label className="block text-brand-dark font-semibold mb-3">
                What is your feedback about? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                  feedbackType === 'website_bug' ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:border-brand-teal'
                }`}>
                  <input
                    type="radio"
                    name="feedback_type"
                    value="website_bug"
                    checked={feedbackType === 'website_bug'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-brand-dark font-medium">Website Bug</span>
                </label>
                <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                  feedbackType === 'product_suggestion' ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:border-brand-teal'
                }`}>
                  <input
                    type="radio"
                    name="feedback_type"
                    value="product_suggestion"
                    checked={feedbackType === 'product_suggestion'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-brand-dark font-medium">Product Suggestion</span>
                </label>
                <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                  feedbackType === 'data_correction' ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:border-brand-teal'
                }`}>
                  <input
                    type="radio"
                    name="feedback_type"
                    value="data_correction"
                    checked={feedbackType === 'data_correction'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-brand-dark font-medium">Data Correction</span>
                </label>
                <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                  feedbackType === 'general_idea' ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:border-brand-teal'
                }`}>
                  <input
                    type="radio"
                    name="feedback_type"
                    value="general_idea"
                    checked={feedbackType === 'general_idea'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-brand-dark font-medium">General Idea</span>
                </label>
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-brand-dark font-semibold mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Incorrect warranty information for Brand X"
                disabled={status === 'loading' || status === 'success'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Details Textarea */}
            <div>
              <label className="block text-brand-dark font-semibold mb-2">
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide as much detail as possible. If suggesting a product, tell us why you think it's BIFL!"
                disabled={status === 'loading' || status === 'success'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            {/* Contact Info Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-brand-dark font-semibold mb-2">Contact Info (Optional)</h3>
              <p className="text-brand-gray text-sm mb-4">
                Provide your contact details if you'd like a response or are open to follow-up questions from our research team.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-dark font-medium mb-2 text-sm">Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-brand-dark font-medium mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Status messages */}
            {message && (
              <div className={`p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-brand-dark rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4A9D93' }}
              >
                {status === 'loading' ? 'Submitting...' : status === 'success' ? 'Submitted!' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
