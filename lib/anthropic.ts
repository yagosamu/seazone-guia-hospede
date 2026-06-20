import Anthropic from '@anthropic-ai/sdk'

// claude-sonnet-4-6 balances quality and cost for multi-turn local curation.
export const ANTHROPIC_MODEL = 'claude-sonnet-4-6'
export const MAX_TOKENS_PER_TURN = 2500

let client: Anthropic | null = null

export function anthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  return client
}
