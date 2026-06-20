type TavilyResult = {
  title: string
  url: string
  content: string
  score: number
}

type TavilyResponse = {
  query: string
  results: TavilyResult[]
}

type TavilySearchOptions = {
  maxResults?: number
  signal?: AbortSignal
}

const TAVILY_ENDPOINT = 'https://api.tavily.com/search'
const TAVILY_TIMEOUT_MS = 10_000

export async function tavilySearch(
  query: string,
  options: TavilySearchOptions = {},
): Promise<TavilyResponse> {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not set')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS)
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        max_results: options.maxResults ?? 8,
        include_answer: false,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Tavily request failed: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as TavilyResponse
  } finally {
    clearTimeout(timeout)
  }
}

export type { TavilyResponse, TavilyResult }
