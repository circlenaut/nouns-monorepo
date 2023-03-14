// Borrowed from: https://github.com/TrueFiEng/useDApp/blob/master/packages/coingecko/src/api/simplePrice.ts

export const getCoingeckoSimplePriceUri = (baseId: string, quoteId: string) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${baseId}&vs_currencies=${quoteId}`

export const fetchCoingeckoPrice =
  (fetchFunction: typeof fetch) => async (base: string, quote: string) => {
    try {
      const baseId = base.toLowerCase()
      const quoteId = quote.toLowerCase()
      const url = getCoingeckoSimplePriceUri(baseId, quoteId)
      const data = await fetchFunction(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await data.json()
      const price = result[baseId][quoteId]
      return price ? price + '' : undefined
    } catch (_) {
      return undefined
    }
  }

const fetchFunction =
  typeof window !== 'undefined' ? window.fetch?.bind(window) : undefined

export const getCoingeckoPrice = fetchFunction
  ? fetchCoingeckoPrice(fetchFunction)
  : undefined
