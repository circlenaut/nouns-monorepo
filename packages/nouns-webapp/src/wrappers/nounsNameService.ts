import { useEthers } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import { NOUNS_NAME_SERVICE_CONTRACT } from '@/configs/constants'
import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch } from '@/hooks'
import nounsNameServiceABI from '@/libs/abi/nounsNameServiceABI.json'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { NounsNameServiceABI } from '@/types/typechain'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCachedCall } from './contracts'

const abi = nounsNameServiceABI && new utils.Interface(nounsNameServiceABI)

/**
 * Look up via either the Nouns Name Service(NNS) or ENS (using NNS contract to resolve NNS with ENS fallback)
 * More info on NNS here: https://nns.xyz/ or https://mirror.xyz/nnsregistry.eth
 * @param address  Address to resolve
 * @returns  NNS or ENS or null (if neither resolve)
 */

export const useNounsNameService = (
  address: string,
  skip?: boolean,
): string | null | undefined => {
  const { chainId, library: provider } = useEthers()

  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'resolve'

  const contractAddress =
    chainId &&
    NOUNS_NAME_SERVICE_CONTRACT[
      chainId.toString() as keyof typeof NOUNS_NAME_SERVICE_CONTRACT
    ]
  const contract =
    contractAddress &&
    (new Contract(contractAddress, abi, provider) as NounsNameServiceABI)

  const cacheKey = `${contractAddress}_${method}_${address}`
  const cachedData = fetchCache(cacheKey) as string
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  const { value: name, error } =
    useCachedCall(
      !skip &&
        contract &&
        address &&
        !isFullyCached && {
          contract,
          method,
          args: [address],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return null
  }

  const result = name && name[0]
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
