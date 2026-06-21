import { anthropic, ANTHROPIC_MODEL } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt'

export class WelcomeGenerationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public override readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'WelcomeGenerationError'
  }
}

export async function generateWelcomeMessage(property: Property): Promise<string> {
  const startedAt = Date.now()
  try {
    const response = await anthropic().messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(property) }],
    })

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new WelcomeGenerationError('Resposta sem bloco de texto', 502)
    }

    const message = block.text.trim()
    if (!message) {
      throw new WelcomeGenerationError('Mensagem vazia', 502)
    }

    console.log(`[generate-welcome] completed in ${Date.now() - startedAt}ms`)
    return message
  } catch (err) {
    if (err instanceof WelcomeGenerationError) throw err
    throw new WelcomeGenerationError('Falha na chamada Anthropic para welcome', 502, err)
  }
}
