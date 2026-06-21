import { describe, expect, it } from 'vitest'
import {
  AnthropicError,
  GenerationError,
  MaxIterationsError,
  TavilyError,
  ValidationError,
} from '@/lib/experiences/errors'

describe('GenerationError hierarchy', () => {
  it('assigns 502 to upstream and validation errors', () => {
    expect(new TavilyError('failed').statusCode).toBe(502)
    expect(new AnthropicError('failed').statusCode).toBe(502)
    expect(new ValidationError('failed').statusCode).toBe(502)
    expect(new TavilyError('failed')).toBeInstanceOf(GenerationError)
  })

  it('assigns 504 when the agent exceeds its iteration budget', () => {
    expect(new MaxIterationsError().statusCode).toBe(504)
  })
})
