'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Cookie/analytics consent. Deny-by-default and global: GA4 + Microsoft Clarity
 * do not load until the visitor explicitly accepts. The choice is persisted in
 * localStorage so the banner only shows until a decision is made.
 */

export type ConsentValue = 'granted' | 'denied'
type ConsentState = ConsentValue | null // null = no decision yet

const STORAGE_KEY = 'bifl-analytics-consent'

interface ConsentContextType {
  consent: ConsentState
  /** true once localStorage has been read (avoids SSR/first-paint flicker) */
  ready: boolean
  setConsent: (value: ConsentValue) => void
}

const ConsentContext = createContext<ConsentContextType>({
  consent: null,
  ready: false,
  setConsent: () => {},
})

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'granted' || stored === 'denied') {
        setConsentState(stored)
      }
    } catch {
      // localStorage unavailable (private mode etc.) — treat as undecided
    }
    setReady(true)
  }, [])

  const setConsent = useCallback((value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // ignore persistence failure; state still updates for this session
    }
    setConsentState(value)
  }, [])

  return (
    <ConsentContext.Provider value={{ consent, ready, setConsent }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  return useContext(ConsentContext)
}
