export class RateLimiter {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly maxTokens: number,
    private readonly refillIntervalMs: number
  ) {
    this.tokens = maxTokens
    this.lastRefill = Date.now()
  }

  async acquire(): Promise<void> {
    this.refill()
    if (this.tokens > 0) {
      this.tokens--
      return
    }
    const waitMs = this.refillIntervalMs - (Date.now() - this.lastRefill)
    await new Promise(resolve => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens--
  }

  private refill(): void {
    const now = Date.now()
    if (now - this.lastRefill >= this.refillIntervalMs) {
      this.tokens = this.maxTokens
      this.lastRefill = now
    }
  }
}
