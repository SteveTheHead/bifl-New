'use client'

import { useState } from 'react'
import { FeedbackModal } from './feedback-modal'

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-6 py-3 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
        style={{ backgroundColor: '#4A9D93' }}
        aria-label="Send feedback"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>Send Feedback</span>
      </button>

      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
