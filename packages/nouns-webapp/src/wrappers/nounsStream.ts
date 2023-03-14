import { useContractFunction, useEthers } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch } from '@/hooks'
import streamABI from '@/libs/abi/stream.abi.json'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { StreamAbi } from '@/types/typechain'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCachedCall } from './contracts'

const abi = new utils.Interface(streamABI)

export const useStreamRemainingBalance = (streamAddress: string) => {
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'recipientBalance'

  const contract = new Contract(streamAddress, abi) as StreamAbi

  const cacheKey = `${contract.address}_${method}`
  const cachedData = fetchCache(cacheKey) as string
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  const { value: balance, error } =
    useCachedCall(
      contract &&
        !isFullyCached && {
          contract,
          method,
          args: [],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = balance && balance[0]?.toString()
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

export const useWithdrawTokens = (streamAddress: string) => {
  const { library } = useEthers()
  const { send: withdrawTokens, state: withdrawTokensState } =
    useContractFunction(new Contract(streamAddress, abi, library), 'withdraw')
  return { withdrawTokens, withdrawTokensState }
}

export const useElapsedTime = (streamAddress: string) => {
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'elapsedTime'

  const contract = new Contract(streamAddress, abi) as StreamAbi

  const cacheKey = `${contract.address}_${method}`
  const cachedData = fetchCache(cacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  const { value: elapsedTime, error } =
    useCachedCall(
      contract &&
        !isFullyCached && {
          contract,
          method,
          args: [],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = elapsedTime?.[0]?.toNumber()
  useEffect(() => void updateCache(cacheKey, result), [cacheKey, result])

  const dispatch = useAppDispatch()

  const [data, setData] = useState<number>()

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
