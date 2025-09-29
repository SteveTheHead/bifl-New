import {
  openaiClient,
  anthropicClient,
  getAvailableAIService,
  aiConfig,
  AIMessage,
  AIResponse,
  AIProvider
} from './config'

export class AIService {
  private static instance: AIService
  private provider: AIProvider | null

  private constructor() {
    this.provider = getAvailableAIService()
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  public isAvailable(): boolean {
    return this.provider !== null
  }

  public getProvider(): AIProvider | null {
    return this.provider
  }

  public async generateText(
    messages: AIMessage[],
    options: {
      maxTokens?: number
      temperature?: number
      model?: string
    } = {}
  ): Promise<AIResponse> {
    if (!this.provider) {
      throw new Error('No AI service available. Please configure API keys.')
    }

    try {
      if (this.provider === 'openai' && openaiClient) {
        return await this.generateWithOpenAI(messages, options)
      } else if (this.provider === 'anthropic' && anthropicClient) {
        return await this.generateWithAnthropic(messages, options)
      } else {
        throw new Error('No AI client available')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  private async generateWithOpenAI(
    messages: AIMessage[],
    options: { maxTokens?: number; temperature?: number; model?: string }
  ): Promise<AIResponse> {
    if (!openaiClient) throw new Error('OpenAI client not available')

    const response = await openaiClient.chat.completions.create({
      model: options.model || aiConfig.openai.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: options.maxTokens || aiConfig.openai.maxTokens,
      temperature: options.temperature || aiConfig.openai.temperature,
    })

    const choice = response.choices[0]
    if (!choice?.message?.content) {
      throw new Error('No content in OpenAI response')
    }

    return {
      content: choice.message.content,
      provider: 'openai',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined
    }
  }

  private async generateWithAnthropic(
    messages: AIMessage[],
    options: { maxTokens?: number; temperature?: number; model?: string }
  ): Promise<AIResponse> {
    if (!anthropicClient) throw new Error('Anthropic client not available')

    // Separate system message from other messages
    const systemMessage = messages.find(msg => msg.role === 'system')
    const conversationMessages = messages.filter(msg => msg.role !== 'system')

    const response = await anthropicClient.messages.create({
      model: options.model || aiConfig.anthropic.model,
      system: systemMessage?.content || '',
      messages: conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      max_tokens: options.maxTokens || aiConfig.anthropic.maxTokens,
      temperature: options.temperature || aiConfig.anthropic.temperature,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic')
    }

    return {
      content: content.text,
      provider: 'anthropic',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    }
  }

  // Convenience method for simple text generation
  public async generateSimpleText(
    prompt: string,
    systemPrompt?: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    const messages: AIMessage[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    messages.push({ role: 'user', content: prompt })

    const response = await this.generateText(messages, options)
    return response.content
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()