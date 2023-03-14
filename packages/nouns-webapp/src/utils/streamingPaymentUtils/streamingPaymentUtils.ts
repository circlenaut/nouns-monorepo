import { Contract, utils } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedCurrency } from '@/components/ProposalActionsModal/steps/TransferFundsDetailsStep'
import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { useCachedCall } from '@/wrappers/contracts'

import StreamFactoryABI from '@/libs/abi/streamFactory.abi.json'

interface UsePredictStreamAddressProps {
  msgSender?: string
  payer?: string
  recipient?: string
  tokenAmount?: string
  tokenAddress?: string
  startTime?: number
  endTime?: number
}

const abi = new utils.Interface(StreamFactoryABI)

export const usePredictStreamAddress = ({
  msgSender,
  payer,
  recipient,
  tokenAmount,
  tokenAddress,
  startTime,
  endTime,
}: UsePredictStreamAddressProps) => {
  const { contractAddresses } = useContractAddresses()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'quorumVotes'
  const args = [
    msgSender,
    payer,
    recipient,
    tokenAmount,
    tokenAddress,
    startTime,
    endTime,
  ]

  const contract = new Contract(contractAddresses.nounsStreamFactory ?? '', abi)

  const cacheKey = `${contract.address}_${method}_${args.join('_')}`
  const cachedData = fetchCache(cacheKey) as string
  const isFullyCached = useMemo(
    () => isCached(cacheKey) && !!cachedData,
    [cacheKey],
  )

  // console.debug(`Calling function 'auction' on contract ${contract.address}`);
  const { value: predictedAddress, error } =
    useCachedCall(
      contract &&
        !isFullyCached && {
          contract,
          method,
          args,
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = predictedAddress && predictedAddress[0].toString()
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
    console.warn('key', cacheKey, cachedTimeLeft)
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

export const formatTokenAmount = (
  amount?: string,
  currency?: SupportedCurrency,
) => {
  const amt = amount ?? '0'
  switch (currency) {
    case SupportedCurrency.USDC:
      return Math.round(parseFloat(amt) * 1_000_000).toString()
    case SupportedCurrency.WETH:
      return utils.parseEther(amt).toString()
    default:
      return amt
  }
}

export const getTokenAddressForCurrency = (currency?: SupportedCurrency) => {
  const { contractAddresses } = useContractAddresses()
  switch (currency) {
    case SupportedCurrency.USDC:
      return contractAddresses.usdcToken
    case SupportedCurrency.WETH:
      return contractAddresses.weth
    default:
      return ''
  }
}

export const parseStreamCreationCallData = (callData: string) => {
  const callDataArray = callData.split(',')

  if (!callDataArray || callDataArray.length < 6) {
    return {
      recipient: '',
      streamAddress: '',
      startTime: 0,
      endTime: 0,
      streamAmount: 0,
      tokenAddress: '',
    }
  }

  const streamAddress = callDataArray[6]
  const nonce = callDataArray[5]
  const startTime = parseInt(callDataArray[3])
  const endTime = parseInt(callDataArray[4])
  const streamAmount = parseInt(callDataArray[1])
  const recipient = callDataArray[0]
  const tokenAddress = callDataArray[2]
  return {
    recipient,
    streamAddress,
    startTime,
    endTime,
    streamAmount,
    tokenAddress,
    nonce,
  }
}
