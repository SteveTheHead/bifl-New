'use client'

import { useState } from 'react'
import { Sparkles, Droplets, Shield, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface CareStep {
  step: number
  title: string
  icon: 'clean' | 'condition' | 'protect'
  description: string
  products?: {
    name: string
    price?: string
  }[]
}

interface CareFrequency {
  frequency: string
  description: string
}

interface ProductCareMaintenanceProps {
  careData?: {
    frequency?: CareFrequency
    steps?: CareStep[]
    content?: string
  } | null
}

export function ProductCareMaintenance({ careData }: ProductCareMaintenanceProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // If no care data is provided, don't render anything
  if (!careData?.content && (!careData?.steps || careData.steps.length === 0)) {
    return null
  }

  // Parse content if it's a string (from database)
  const parsedContent = typeof careData.content === 'string'
    ? parseMarkdownContent(careData.content)
    : null

  const getIcon = (type: string) => {
    switch (type) {
      case 'clean':
        return <Droplets className="w-6 h-6" />
      case 'condition':
        return <Sparkles className="w-6 h-6" />
      case 'protect':
        return <Shield className="w-6 h-6" />
      default:
        return <Sparkles className="w-6 h-6" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'clean':
        return 'bg-blue-100 text-blue-600'
      case 'condition':
        return 'bg-amber-100 text-amber-600'
      case 'protect':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-brand-teal/10 text-brand-teal'
    }
  }

  return (
    <section
      className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      itemScope
      itemType="https://schema.org/HowTo"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center" aria-hidden="true">
          <Sparkles className="w-5 h-5 text-brand-teal" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brand-dark" itemProp="name">
            Product Care & Maintenance Guide
          </h2>
          {careData.frequency && (
            <p className="text-sm text-brand-gray flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span itemProp="totalTime">Recommended: {careData.frequency.frequency}</span>
              <span className="text-brand-gray/60">•</span>
              <span>{careData.frequency.description}</span>
            </p>
          )}
        </div>
      </div>

      {/* Compact 3-Column Grid with HowToStep schema */}
      {careData.steps && careData.steps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {careData.steps.map((step, index) => (
            <article
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200"
              itemProp="step"
              itemScope
              itemType="https://schema.org/HowToStep"
            >
              <meta itemProp="position" content={String(step.step)} />

              {/* Icon and Title */}
              <header className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${getIconColor(step.icon)} flex items-center justify-center`} aria-hidden="true">
                  {getIcon(step.icon)}
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-gray uppercase">Step {step.step}</span>
                  <h3 className="text-lg font-bold text-brand-dark" itemProp="name">{step.title}</h3>
                </div>
              </header>

              {/* Description */}
              <p className="text-sm text-brand-gray leading-relaxed mb-4" itemProp="text">
                {step.description}
              </p>

              {/* Products - HowToSupply */}
              {step.products && step.products.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-brand-gray uppercase mb-2">Recommended Products</p>
                  <ul className="space-y-1.5" role="list">
                    {step.products.map((product, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs"
                        itemProp="supply"
                        itemScope
                        itemType="https://schema.org/HowToSupply"
                      >
                        <span className="text-brand-dark" itemProp="name">{product.name}</span>
                        {product.price && (
                          <span className="font-semibold text-brand-teal" itemProp="estimatedCost">{product.price}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Parsed markdown content */}
      {parsedContent && (
        <div className="mt-8 prose prose-sm max-w-none text-brand-gray">
          {parsedContent}
        </div>
      )}

      {/* Raw content fallback */}
      {!careData.steps && careData.content && !parsedContent && (
        <div className="mt-8 prose prose-sm max-w-none text-brand-gray leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: careData.content }} />
        </div>
      )}
    </section>
  )
}

// Helper function to parse markdown-like content
function parseMarkdownContent(content: string): React.JSX.Element | null {
  if (!content) return null

  // Basic parsing for the markdown format we have
  const sections = content.split('\n\n')

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        // Handle headers
        if (section.startsWith('###')) {
          const text = section.replace(/^###\s*/, '').trim()
          return (
            <h3 key={index} className="text-lg font-bold text-brand-dark mt-6 mb-3">
              {text}
            </h3>
          )
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(section)) {
          const items = section.split('\n').filter(line => /^\d+\.\s/.test(line))
          return (
            <ol key={index} className="space-y-3 list-none">
              {items.map((item, idx) => {
                const match = item.match(/^\d+\.\s+\*\*(.+?):\*\*\s*(.+)$/)
                if (match) {
                  return (
                    <li key={idx} className="pl-6 relative">
                      <span className="absolute left-0 top-1 w-5 h-5 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-brand-dark">{match[1]}:</span>{' '}
                        <span className="text-brand-gray">{match[2]}</span>
                      </div>
                    </li>
                  )
                }
                return <li key={idx} className="text-brand-gray">{item}</li>
              })}
            </ol>
          )
        }

        // Handle regular paragraphs
        if (section.trim()) {
          return (
            <p key={index} className="text-brand-gray leading-relaxed">
              {section}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}