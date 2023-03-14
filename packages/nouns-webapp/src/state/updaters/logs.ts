import { Log } from '@ethersproject/providers'
import { useBlockNumber } from '@usedapp/core'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useReadonlyProvider } from '@/hooks/useReadonlyProvider'
import {
  fetchedLogs,
  fetchedLogsError,
  fetchingLogs,
} from '@/state/slices/logs'
import { EventFilter, keyToFilter } from '@/utils/logParsing'

const MAX_BLOCKS_PER_CALL = 1_000_000

const LogFetcher = (): null => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.logs)
  const provider = useReadonlyProvider()

  const {
    cache,
    isCached,
    fetchCache,
    removeCache,
    updateCache,
    cacheDump,
    removeExpired,
  } = useLRUCache()

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

      if (isCached(cacheKey)) {
        const cachedValue = fetchCache(cacheKey) as {
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
      if (cache.size >= cache.maxSize) {
        cacheDump.length
        const leastRecentlyUsedKey = ((dump) => dump[dump.length - 1]?.[0])(
          cacheDump,
        )
        removeCache(leastRecentlyUsedKey)
      }

      updateCache(cacheKey, value)
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

    return () => void removeExpired()
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
