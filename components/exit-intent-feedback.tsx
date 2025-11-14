'use client'

import { useState, useEffect } from 'react'
import { FeedbackModal } from './feedback-modal'

const COOKIE_NAME = 'feedback_shown'
const DAYS_UNTIL_SHOW_AGAIN = 30

export function ExitIntentFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false)

  useEffect(() => {
    // Check if feedback was already shown in the last 30 days
    const checkCookie = () => {
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === COOKIE_NAME) {
          return true
        }
      }
      return false
    }

    const hasSeenRecently = checkCookie()
    if (hasSeenRecently) {
      return // Don't set up exit intent if user has seen it recently
    }

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving from the top of the viewport
      if (e.clientY <= 0 && !hasBeenTriggered) {
        setHasBeenTriggered(true)
        setIsModalOpen(true)
        setCookie()
      }
    }

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasBeenTriggered])

  const setCookie = () => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + DAYS_UNTIL_SHOW_AGAIN)
    document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`
  }

  const handleClose = () => {
    setIsModalOpen(false)
    // Cookie is already set when modal is shown
  }

  return (
    <FeedbackModal
      isOpen={isModalOpen}
      onClose={handleClose}
    />
  )
}
