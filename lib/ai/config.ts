import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// AI Service Configuration. Models/limits are env-overridable so upgrades
// don't require a deploy (audit M17 — the old hardcoded default was a
// March-2024 Haiku that has since been retired).
export const aiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Cost-effective model for most tasks
    maxTokens: Number(process.env.AI_MAX_TOKENS) || 2000,
    temperature: 0.7,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', // Fast and cost-effective
    maxTokens: Number(process.env.AI_MAX_TOKENS) || 2000,
    temperature: 0.7,
  }
}

// Initialize AI clients
export const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Determine which AI service to use (prefer OpenAI for most tasks)
export function getAvailableAIService(): 'openai' | 'anthropic' | null {
  if (openaiClient) return 'openai'
  if (anthropicClient) return 'anthropic'
  return null
}

// AI Service Types
export type AIProvider = 'openai' | 'anthropic'
export type AIRole = 'system' | 'user' | 'assistant'

export interface AIMessage {
  role: AIRole
  content: string
}

export interface AIResponse {
  content: string
  provider: AIProvider
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}