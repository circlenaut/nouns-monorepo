export interface EventFilter {
  address?: string
  topics?: Array<string | Array<string> | null>
  fromBlock?: number | null
}

export interface Log {
  topics: Array<string>
  transactionHash: string
  data: string
}

/**
 * Converts a filter to the corresponding string key
 * @param filter the filter to convert
 */
export const filterToKey = (filter: EventFilter): string => {
  return `${filter.address ?? ''}:${
    filter.topics
      ?.map((topic) =>
        topic ? (Array.isArray(topic) ? topic.join(';') : topic) : '\0',
      )
      ?.join('-') ?? ''
  }`
}

/**
 * Convert a filter key to the corresponding filter
 * @param key key to convert
 */
export const keyToFilter = (key: string): EventFilter => {
  const pcs = key.split(':')
  const address = pcs[0]
  const topics = pcs[1]?.split('-').map((topic) => {
    const parts = topic.split(';')
    if (parts.length === 1) return parts[0]
    return parts
  })

  return {
    address: address?.length === 0 ? undefined : address,
    topics:
      topics && topics.length > 0
        ? topics.map((topic) => topic || null)
        : undefined,
  }
}
