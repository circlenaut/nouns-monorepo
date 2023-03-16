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
import { isValidNameFormat } from './addressAndChainNameDisplayUtils'
import { lookupNNSOrENS } from './lookupNNSOrENS'

export const useReverseNameServiceLookUp = (
  address: string,
  skip?: boolean,
  cacheTTL?: number,
) => {
  const { library: provider } = useEthers()
  const { updateCache, fetchCache, remainingCacheTime, isCached, removeCache } =
    useLRUCache()

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

  const processCacheData = useCallback(
    async (_cacheKey: string, _address: string) => {


      const cachedTimeLeft = remainingCacheTime(_cacheKey)
      const cachedData = fetchCache(_cacheKey) as string
      const isFullyCached =
        isCached(_cacheKey) && (!!cachedData || cachedData === _address)
      if (isFullyCached || cachedTimeLeft > 0) {
        recordApiStat(RecordActions.FETCH)
        return cachedData
      }

      if (!provider) return
      try {
        // const result = await lookupNNSOrENS(provider, _address)
        const result = 'null'
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

  const [name, setName] = useState<string>()

  useEffect(() => {
    if (skip) return
    if (isValidNameFormat(address)) {
      setName(address)
      return
    }

    if (address && provider) {
      const cacheKey = `nsData_${address}`
      ;(async () => {
        const result = await processCacheData(cacheKey, address)
        console.error('result!!!!!!!', cacheKey,  result)
        if (!!result && result !== 'null') {
          setName(result)
        }
      })()
    }
    return () => {
      setName('')
    }
  }, [provider])

  if (isValidNameFormat(address)) return address

  return name
}
