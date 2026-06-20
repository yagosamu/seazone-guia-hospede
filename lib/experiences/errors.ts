export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public override readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'GenerationError'
  }
}

export class TavilyError extends GenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, 502, cause)
    this.name = 'TavilyError'
  }
}

export class AnthropicError extends GenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, 502, cause)
    this.name = 'AnthropicError'
  }
}

export class ValidationError extends GenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, 502, cause)
    this.name = 'ValidationError'
  }
}

export class MaxIterationsError extends GenerationError {
  constructor() {
    super('Claude não chamou submit_guide dentro do limite de iterações', 504)
    this.name = 'MaxIterationsError'
  }
}
