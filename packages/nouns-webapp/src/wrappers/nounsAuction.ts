import { WebSocketProvider } from '@ethersproject/providers'
import { NounsAuctionHouseABI, type NounsAuctionHouse } from '@nouns/sdk'
import { useEthers } from '@usedapp/core'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBN, Contract, utils } from 'ethers'

import { ContractAddresses } from '@/configs'
import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { AuctionState } from '@/state/slices/auction'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { isNounderNoun } from '@/utils/nounderNoun'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCachedCall } from './contracts'

export enum AuctionHouseContractFunction {
  auction = 'auction',
  duration = 'duration',
  minBidIncrementPercentage = 'minBidIncrementPercentage',
  nouns = 'nouns',
  createBid = 'createBid',
  settleCurrentAndCreateNewAuction = 'settleCurrentAndCreateNewAuction',
}

export interface Auction {
  amount: EthersBN
  bidder: string
  endTime: EthersBN
  startTime: EthersBN
  nounId: EthersBN
  settled: boolean
}

const abi = NounsAuctionHouseABI && new utils.Interface(NounsAuctionHouseABI)

export const useAuction = (
  auctionHouseProxyAddress: string,
  provider?: WebSocketProvider,
): Auction | undefined => {
  const { library } = useEthers()

  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'auction'

  const contract = new Contract(
    auctionHouseProxyAddress,
    abi,
    provider ?? library,
  ) as NounsAuctionHouse

  const cacheKey = `${contract.address}_${method}`
  const cachedData = fetchCache(cacheKey) as Auction
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  // console.debug(`Calling function 'auction' on contract ${contract.address}`);
  const { value: auction, error } =
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

  const result = auction
  useEffect(() => void updateCache(cacheKey, result), [cacheKey, result])

  const dispatch = useAppDispatch()

  const [data, setData] = useState<Auction>()

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

export const useAuctionMinBidIncPercentage = (addresses: ContractAddresses) => {
  const { library: provider } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'minBidIncrementPercentage'

  const contract = new Contract(
    addresses.nounsAuctionHouseProxy,
    abi,
    provider,
  ) as NounsAuctionHouse

  const cacheKey = `${contract.address}_${method}`
  const cachedData = fetchCache(cacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  const { value: minBidIncrement, error } =
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

  const result = minBidIncrement && minBidIncrement[0]
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

  if (!minBidIncrement) {
    return
  }

  return !!data ? new BigNumber(data) : new BigNumber(0)
}

/**
 * Computes timestamp after which a Noun could vote
 * @param nounId TokenId of Noun
 * @returns Unix timestamp after which Noun could vote
 */
export const useNounCanVoteTimestamp = (nounId: number) => {
  const nextNounId = nounId + 1

  const nextNounIdForQuery = isNounderNoun(EthersBN.from(nextNounId))
    ? nextNounId + 1
    : nextNounId

  const pastAuctions = useAppSelector(
    (state) => state.pastAuctions.pastAuctions,
  )

  const maybeNounCanVoteTimestamp = pastAuctions.find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (auction: AuctionState, i: number) => {
      const maybeNounId = auction.activeAuction?.nounId
      return maybeNounId
        ? EthersBN.from(maybeNounId).eq(EthersBN.from(nextNounIdForQuery))
        : false
    },
  )?.activeAuction?.startTime

  if (!maybeNounCanVoteTimestamp) {
    // This state only occurs during loading flashes
    return EthersBN.from(0)
  }

  return EthersBN.from(maybeNounCanVoteTimestamp)
}
