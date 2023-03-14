import LRUCache from 'lru-cache'

import { CACHE_MAX_AGE, CACHE_MAX_ITEMS } from '@/configs/constants'

interface CruCacheFactoryProps {
  maxItems?: number
  maxAge?: number
}
export const lruCacheFactory = ({ maxItems, maxAge }: CruCacheFactoryProps) => {
  console.error(
    `Initiating LRU Cache storing a maximum of ${
      maxItems ?? CACHE_MAX_ITEMS
    } and max storage duration of ${maxAge ?? CACHE_MAX_AGE}`,
  )
  return new LRUCache({
    max: maxItems ?? CACHE_MAX_ITEMS,
    ttl: maxAge ?? CACHE_MAX_AGE,
  })
}
