export class ApiValidationError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly fieldPath: string,
    public readonly received: unknown
  ) {
    super(
      `API validation failed at ${endpoint}: field '${fieldPath}' invalid, received: ${JSON.stringify(received)}`
    )
    this.name = 'ApiValidationError'
  }
}

export class ApiRateLimitError extends Error {
  constructor(public readonly source: 'coingecko' | 'binance') {
    super(`Rate limit hit on ${source}`)
    this.name = 'ApiRateLimitError'
  }
}

export class CoinNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Coin not found: ${id}`)
    this.name = 'CoinNotFoundError'
  }
}
