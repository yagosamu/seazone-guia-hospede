export class ItineraryError extends Error {
  constructor(message: string, public readonly statusCode: number, public override readonly cause?: unknown) {
    super(message)
    this.name = 'ItineraryError'
  }
}
