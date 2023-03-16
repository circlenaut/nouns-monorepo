import { useEthers } from '@usedapp/core'
import { useCallback, useEffect, useState } from 'react'

import { useLRUCache } from '@/contexts/cache'
import { fetchEthersError } from '@/errors/ethers'
import { useAppDispatch } from '@/hooks'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { lookupNNSOrENS } from '@/utils/lookupNNSOrENS'

interface CacheAddressesProp {
  addresses: string[] | undefined
  cacheTTL?: number
}

const cacheNameServiceAddresses = ({
  addresses,
  cacheTTL = 30000,
}: CacheAddressesProp) => {
  const { library: provider } = useEthers()
  const { updateCache, fetchCache, remainingCacheTime, isCached, removeCache } =
    useLRUCache()

  const [cachedNames, setCachedNames] = useState<string[]>()

  // Pre-fetch ENS  of delegates (with 30min TTL)
  // This makes hover cards load more smoothly

  const dispatch = useAppDispatch()

  const recordApiStat = useCallback(
    (cacheAction: RecordActions) => {
      switch (cacheAction) {
        case RecordActions.UPDATE:
          return void dispatch(recordCacheUpdate(1))
        case RecordActions.FETCH:
          return void dispatch(recordCacheFetch(1))
        case RecordActions.REMOVE:
          return void dispatch(recordCacheRemoval(1))
        case RecordActions.MISS:
          return void dispatch(recordCacheMiss(1))
        case RecordActions.NETWORK_CALL:
          return void dispatch(recordNetworkCall(1))
      }
    },
    [dispatch],
  )

  const processDelegateData = useCallback(
    async (_cacheKey: string, _address: string) => {
      if (!provider) return

      const cachedTimeLeft = remainingCacheTime(_cacheKey)
      const cachedData = fetchCache(_cacheKey) as string
      const isFullyCached =
        isCached(_cacheKey) && (!!cachedData || cachedData === _address)
      if (isFullyCached || cachedTimeLeft > 0) {
        recordApiStat(RecordActions.FETCH)
        return cachedData
      }
      try {
        const result = await lookupNNSOrENS(provider, _address)
        if (!!result || result === null) {
          updateCache(_cacheKey, result ?? 'null', cacheTTL)
          recordApiStat(RecordActions.UPDATE)
          recordApiStat(RecordActions.NETWORK_CALL)
          return result
        }
        if (!!cachedData && cachedTimeLeft <= 0) {
          removeCache(_cacheKey)
          recordApiStat(RecordActions.REMOVE)
          return cachedData
        }
        recordApiStat(RecordActions.MISS)
      } catch (error) {
        fetchEthersError(error)
      }
    },
    [dispatch, provider],
  )

  useEffect(() => {
    if (!addresses) {
      return
    }
    if (!provider) return
    ;(async () => {
      const result = await Promise.all(
        addresses.map(async (address) => {
          const cacheKey = `nsData_${address}`
          return processDelegateData(cacheKey, address)
        }),
      )
      const filteredResult = result.filter(
        (value) => value !== null && value !== undefined,
      ) as string[]
      setCachedNames(filteredResult)
    })()
  }, [provider])

  return cachedNames
}

export default cacheNameServiceAddresses
