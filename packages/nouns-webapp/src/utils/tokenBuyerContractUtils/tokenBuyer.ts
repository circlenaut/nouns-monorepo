import { Contract } from 'ethers'
import { Interface } from 'ethers/lib/utils'

import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch } from '@/hooks'
import tokenBuyerABI from '@/libs/abi/tokenBuyerABI.json'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { TokenBuyerABI } from '@/types/typechain/TokenBuyerABI'
import { useCachedCall } from '@/wrappers/contracts'
import { useCallback, useEffect, useMemo, useState } from 'react'

const abi = new Interface(tokenBuyerABI)
const BUFFER_BPS = 5_000

export const useEthNeeded = (
  address: string,
  additionalTokens: number,
  skip?: boolean,
) => {
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'getReceipt'

  const contract = new Contract(address, abi) as TokenBuyerABI

  const cacheKey = `${contract.address}_${method}_${additionalTokens}_${BUFFER_BPS}`
  const cachedData = fetchCache(cacheKey) as string
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  const { value: ethNeeded, error } =
    useCachedCall(
      contract &&
        !isFullyCached &&
        !skip && {
          contract: contract,
          method: 'ethNeeded',
          args: [additionalTokens, BUFFER_BPS],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = ethNeeded && ethNeeded[0]?.toString()
  useEffect(() => void updateCache(cacheKey, result), [cacheKey, result])

  const dispatch = useAppDispatch()

  const [data, setData] = useState<string>()

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

  useEffect(() => {
    const cachedTimeLeft = remainingCacheTime(cacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(cacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(cacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, cacheKey, isFullyCached, result])
  return data
}
