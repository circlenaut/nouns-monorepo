import { useBlockNumber } from '@usedapp/core'
import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLRUCache } from '@/contexts/cache'
import { setEthPrice } from '@/state/slices/application'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { getCoingeckoPrice } from '@/utils/coinGeckoPrice'
import { useAppDispatch, useAppSelector } from '.'

/**
 * Computes treasury usd value of treasury assets (ETH + Lido) at current ETH-USD exchange rate
 *
 * @returns USD value of treasury assets (ETH + Lido) at current exchange rate
 */
export const useTreasuryUSDValue = (
  ethBalance: BigNumber,
  currency = 'usd',
) => {
  const { updateCache, fetchCache, remainingCacheTime, isCached, removeCache } =
    useLRUCache()

  const cacheKey = `ethereum-${currency}`
  const cachedPrice = useMemo(() => fetchCache(cacheKey) as string, [cacheKey])

  const { etherPrice: currentEtherPrice } = useAppSelector(
    (state) => state.application,
  )
  // const isStored = useMemo(() => !!currentEtherPrice.currency && !!currentEtherPrice.rate, [currentEtherPrice])
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!fetchCache(cacheKey),
    [cacheKey],
  )

  const [latestEtherPrice, setLatestEtherPrice] = useState<string | undefined>(
    undefined,
  )
  const blockNo = useBlockNumber()

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

  useEffect(() => {
    const getPrice = async () => {
      const cachedTimeLeft = remainingCacheTime(cacheKey)
      if (isFullyCached || cachedTimeLeft > 0) {
        recordApiStat(RecordActions.FETCH)
        return
      }

      const result =
        getCoingeckoPrice && (await getCoingeckoPrice('ethereum', currency))
      if (!!result) {
        updateCache(cacheKey, result)
        setLatestEtherPrice(result)
        recordApiStat(RecordActions.UPDATE)
        recordApiStat(RecordActions.NETWORK_CALL)
        dispatch(setEthPrice({ currency: currency, rate: Number(result) }))
        return
      }
      if (cachedTimeLeft <= 0) {
        removeCache(cacheKey)
        recordApiStat(RecordActions.REMOVE)
        return
      }
      recordApiStat(RecordActions.MISS)
    }
    void getPrice()
  }, [dispatch, currency, blockNo, isFullyCached])

  return useMemo(() => {
    const treasuryBalanceETH = Number(
      ethers.utils.formatEther(ethBalance.toString() || '0'),
    )
    return (
      (Number(cachedPrice) ||
        currentEtherPrice.rate ||
        Number(latestEtherPrice)) * treasuryBalanceETH
    )
  }, [latestEtherPrice, currentEtherPrice, cachedPrice, ethBalance])
}
