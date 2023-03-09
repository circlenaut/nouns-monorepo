import { Log } from '@ethersproject/providers'
import { useBlockNumber } from '@usedapp/core'
import LRUCache from 'lru-cache'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { useReadonlyProvider } from '@/hooks/useReadonlyProvider'
import {
  fetchedLogs,
  fetchedLogsError,
  fetchingLogs,
} from '@/state/slices/logs'
import { EventFilter, keyToFilter } from '@/utils/logParsing'

const MAX_BLOCKS_PER_CALL = 1_000_000
const CACHE_MAX_AGE = 1000 * 60 * 5 // cache for 5 minutes
const CACHE_MAX_ITEMS = 1000 // store at most 500 objects

const cache = new LRUCache({ max: CACHE_MAX_ITEMS, ttl: CACHE_MAX_AGE })

const LogFetcher = (): null => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.logs)
  const provider = useReadonlyProvider()

  const blockNumber = useBlockNumber()

  const prevFilters = useRef<EventFilter[]>([])

  const filters = useCallback(() => {
    if (typeof blockNumber !== 'number') {
      return []
    }

    return Object.keys(state)
      .filter((key) => {
        const { fetchingBlockNumber, results, listeners = 0 } = state[key] || {}

        return (
          listeners !== 0 &&
          (!fetchingBlockNumber || fetchingBlockNumber < blockNumber) &&
          (!results?.blockNumber || results.blockNumber < blockNumber)
        )
      })
      .map(keyToFilter)
  }, [blockNumber, state])

  const filtersNeedFetch = useMemo(
    () => filters().filter((filter) => !prevFilters.current.includes(filter)),
    [filters, prevFilters],
  )

  const handleLogsFetchedCached = useCallback(
    (filter: EventFilter, results: PromiseSettledResult<Log[]>[]) => {
      const cacheKey = JSON.stringify(filter)

      if (cache.has(cacheKey)) {
        const cachedValue = cache.get(cacheKey) as {
          blockNumber: number
          logs: Log[]
        }
        // return cached value
        dispatch(
          fetchedLogs({
            filter,
            results: cachedValue,
          }),
        )
        return
      }

      if (!blockNumber) {
        return
      }

      const value = {
        logs: results.flatMap((result) =>
          result.status === 'fulfilled' ? result.value : [],
        ),
        blockNumber,
      }

      dispatch(fetchedLogs({ filter, results: value }))

      // cache the value
      if (cache.size >= CACHE_MAX_ITEMS) {
        const leastRecentlyUsedKey = cache.purgeStale()
        cache.delete(leastRecentlyUsedKey)
      }

      cache.set(cacheKey, value)
    },
    [dispatch, blockNumber],
  )

  useEffect(() => {
    if (
      !provider ||
      typeof blockNumber !== 'number' ||
      filtersNeedFetch.length === 0
    ) {
      return
    }

    if (
      prevFilters.current.every((prevFilter) =>
        filtersNeedFetch.includes(prevFilter),
      )
    ) {
      return
    }

    dispatch(fetchingLogs({ filters: filtersNeedFetch, blockNumber }))

    const promises = filtersNeedFetch.map((filter) => {
      const numRanges = Math.ceil(
        (blockNumber - (filter.fromBlock ?? 0) + 1) / MAX_BLOCKS_PER_CALL,
      )
      const ranges = Array(numRanges)
        .fill(null)
        .map((_, i) => {
          const fromBlock = (filter.fromBlock ?? 0) + i * MAX_BLOCKS_PER_CALL
          const toBlock = Math.min(
            fromBlock + MAX_BLOCKS_PER_CALL - 1,
            blockNumber,
          )
          return { fromBlock, toBlock }
        })

      return Promise.allSettled(
        ranges.map((range) => provider.getLogs({ ...filter, ...range })),
      )
        .then((results) => {
          handleLogsFetchedCached(filter, results)
        })
        .catch((error) => {
          console.error('Failed to get logs', filter, error)
          dispatch(fetchedLogsError({ filter, blockNumber }))
        })
    })

    Promise.all(promises).then(() => {
      prevFilters.current = filtersNeedFetch
    })

    return () => cache.clear()
  }, [
    blockNumber,
    dispatch,
    filtersNeedFetch,
    handleLogsFetchedCached,
    prevFilters,
    provider,
  ])

  return null
}

export default LogFetcher
