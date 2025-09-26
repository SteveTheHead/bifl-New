import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// BIFL-specific utility functions
export function formatBiflScore(score: number): string {
  return `${score.toFixed(1)}/10`
}

export function getBiflScoreColor(score: number): string {
  if (score >= 8) return "text-green-600"
  if (score >= 6) return "text-yellow-600"
  if (score >= 4) return "text-orange-600"
  return "text-red-600"
}

export function getBiflScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional"
  if (score >= 8) return "Excellent"
  if (score >= 7) return "Very Good"
  if (score >= 6) return "Good"
  if (score >= 5) return "Fair"
  if (score >= 4) return "Below Average"
  return "Poor"
}

export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price)
}

export function formatLifespan(years: number): string {
  if (years >= 50) return "50+ years"
  if (years >= 20) return `${years}+ years`
  if (years >= 10) return `${years} years`
  return `${years} year${years > 1 ? 's' : ''}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
