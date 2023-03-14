import { useQueryClient } from '@tanstack/react-query'
import { useContractFunction } from '@usedapp/core'
import { connectContractToSigner } from '@usedapp/core/dist/cjs/src/hooks'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as EthersBN, Contract, ethers, utils } from 'ethers'
import { print } from 'graphql/language/printer'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { NounsTokenABI, type NounsToken } from '@nouns/sdk'

import {
  cache,
  cacheKey as genSeedCacheKey,
  CHAIN_ID,
  ContractAddresses,
} from '@/configs'
import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useConfig } from '@/hooks/useConfig'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { useCachedCall } from './contracts'
import { seedsQuery, useQuery } from './subgraph'
import { Seed } from './subgraph/schema'

interface NounToken {
  name: string
  description: string
  image: string
}

export interface INounSeed {
  accessory: number
  background: number
  body: number
  glasses: number
  head: number
}

export enum NounsTokenContractFunction {
  delegateVotes = 'votesToDelegate',
}

const abi = new utils.Interface(NounsTokenABI)

const isSeedValid = (seed: Seed | undefined) => {
  const expectedKeys = ['background', 'body', 'accessory', 'head', 'glasses']
  const hasExpectedKeys = expectedKeys.every((key) =>
    (seed || {}).hasOwnProperty(key),
  )
  const hasValidValues = Object.values(seed || {}).some((v) => v !== 0)
  return hasExpectedKeys && hasValidValues
}

export const useNounToken = (
  addresses: ContractAddresses,
  nounId: EthersBN,
): NounToken | undefined => {
  // const { library } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'dataURI'

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // library,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${nounId}`
  const cachedData = fetchCache(lruCacheKey) as NounToken
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'dataURI' on contract ${contract.address}`);
  const { value: noun, error } =
    useCachedCall(
      contract &&
        !isFullyCached && {
          contract,
          method,
          args: [nounId],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const nounImgData = noun && (noun[0]?.split(';base64,').pop() as string)
  const json: NounToken | undefined =
    nounImgData && JSON.parse(atob(nounImgData))
  // result = nounImgData && JSON.parse(Buffer.from(nounImgData, 'base64').toString('utf-8'));

  const result = json
  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

  const dispatch = useAppDispatch()

  const [data, setData] = useState<NounToken>()

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data
}

const seedArrayToObject = (seeds: (INounSeed & { id: string })[]) => {
  return seeds.reduce<Record<string, INounSeed>>((acc, seed) => {
    acc[seed.id] = {
      background: Number(seed.background),
      body: Number(seed.body),
      accessory: Number(seed.accessory),
      head: Number(seed.head),
      glasses: Number(seed.glasses),
    }
    return acc
  }, {})
}

// const useNounSeeds = (addresses: ContractAddresses): [INounSeed] => {
const useNounSeeds = (
  addresses: ContractAddresses,
): Record<string, INounSeed> => {
  const seedCacheKey =
    cache.seed && genSeedCacheKey(cache.seed, CHAIN_ID, addresses.nounsToken)

  const cachedSeeds = (seedCacheKey &&
    (localStorage.getItem(seedCacheKey) as string) &&
    JSON.parse(localStorage.getItem(seedCacheKey) as string)) as Record<
    string,
    INounSeed
  >

  const nounCount =
    useAppSelector(
      ({ auction: { activeAuction } }) =>
        activeAuction?.nounId &&
        EthersBN.from(activeAuction.nounId).toNumber() + 1,
    ) ?? -1

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const fetchSeeds = useCallback(async () => {
    const query = print(seedsQuery())
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [])

  useEffect(
    () =>
      void queryClient.prefetchQuery({
        queryKey: [seedsQuery()],
        queryFn: fetchSeeds,
      }),
    [queryClient],
  )

  const { data } = useQuery({
    queryKey: [seedsQuery()],
    queryFn: fetchSeeds,
    skip: !!cachedSeeds && Object.keys(cachedSeeds)?.length === nounCount,
  })

  useEffect(() => {
    if (cachedSeeds && Object.keys(cachedSeeds)?.length < data?.seeds?.length) {
      localStorage.setItem(
        seedCacheKey,
        JSON.stringify(seedArrayToObject(data.seeds)),
      )
    }
  }, [data, cachedSeeds, nounCount, seedCacheKey])

  return data?.seeds ? seedArrayToObject(data.seeds) : cachedSeeds
}

export const useNounSeed = (
  addresses: ContractAddresses,
  nounId: EthersBN,
): INounSeed | undefined => {
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'seeds'

  const seedCacheKey =
    cache.seed && genSeedCacheKey(cache.seed, CHAIN_ID, addresses.nounsToken)

  const seeds = useNounSeeds(addresses)

  const seed = seeds?.[nounId.toNumber()]
  // const { library } = useEthers()

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // library,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${nounId}`
  const cachedData = fetchCache(lruCacheKey) as INounSeed
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'seeds' on contract ${contract.address}`);
  const { value: response, error } =
    useCachedCall(
      contract &&
        seeds &&
        Object.keys(seeds).length - 1 < nounId.toNumber() &&
        !isFullyCached && {
          contract: contract,
          method: 'seeds',
          args: [nounId],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  // return const result = seed
  const result = response
  // useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

  const dispatch = useAppDispatch()

  const [data, setData] = useState<INounSeed>()

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  const processNounSeed = (_response: INounSeed, _seedCacheKey: string) => {
    const _seedCache = localStorage.getItem(_seedCacheKey)
    if (_seedCache && isSeedValid(response)) {
      const updatedSeedCache = JSON.stringify({
        ...JSON.parse(_seedCache),
        [nounId.toString()]: {
          accessory: _response.accessory,
          background: _response.background,
          body: _response.body,
          glasses: _response.glasses,
          head: _response.head,
        },
      })
      localStorage.setItem(_seedCacheKey, updatedSeedCache)
    }
    return response
  }
  if (response && seedCacheKey) {
    return processNounSeed(response, seedCacheKey)
  }
  if (data && seedCacheKey) {
    return processNounSeed(data, seedCacheKey)
  }
  return seed
}

export const useUserVotes = (
  addresses: ContractAddresses,
): number | undefined => {
  const { activeAccount } = useAppSelector((state) => state.account)

  return useAccountVotes(
    addresses,
    activeAccount ?? ethers.constants.AddressZero,
  )
}

export const useAccountVotes = (
  addresses: ContractAddresses,
  account?: string,
): number | undefined => {
  // const { library } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'getCurrentVotes'

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // library,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${account}`
  const cachedData = fetchCache(lruCacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'getCurrentVotes' on contract ${contract.address}`);
  const { value: votes, error } =
    useCachedCall(
      contract &&
        account &&
        !isFullyCached && {
          contract,
          method,
          args: [account],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  const result = votes && EthersBN.from(votes[0]).toNumber()
  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data
}

export const useUserDelegatee = (
  addresses: ContractAddresses,
): string | undefined => {
  // const { library } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const { activeAccount } = useAppSelector((state) => state.account)

  const method = 'delegates'

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // library,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${activeAccount}`
  const cachedData = fetchCache(lruCacheKey) as string
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'delegates' on contract ${contract.address}`);
  const { value: delegate, error } =
    useCachedCall(
      contract &&
        activeAccount &&
        !isFullyCached && {
          contract: contract,
          method: 'delegates',
          args: [activeAccount],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = delegate && delegate[0]
  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data
}

export const useUserVotesAsOfBlock = (
  addresses: ContractAddresses,
  block: number | undefined,
): number | undefined => {
  // const { library: provider } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const { activeAccount } = useAppSelector((state) => state.account)

  const method = 'getPriorVotes'

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // provider,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${activeAccount}_${block}`
  const cachedData = fetchCache(lruCacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'getPriorVotes' on contract ${contract.address}`);
  const { value: votes, error } =
    useCachedCall(
      contract &&
        activeAccount &&
        block &&
        !isFullyCached && {
          contract: contract,
          method: 'getPriorVotes',
          args: [activeAccount, block],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = votes && EthersBN.from(votes[0]).toNumber()
  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data
}

export const useDelegateVotes = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // provider,
  ) as NounsToken
  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'delegate' on signed contract ${signedContract.address}`);
  const { send, state } = useContractFunction(signedContract, 'delegate')
  return { send, state }
}

export const useNounTokenBalance = (
  addresses: ContractAddresses,
  address: string,
): number => {
  // const { library: provider } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'balanceOf'

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // provider,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${address}`
  const cachedData = fetchCache(lruCacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'balanceOf' on contract ${contract.address}`);
  const { value: tokenBalance, error } =
    useCachedCall(
      contract &&
        !isFullyCached && {
          contract,
          method,
          args: [address],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }

  const result = tokenBalance ? EthersBN.from(tokenBalance).toNumber() : 0

  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)

    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data ? EthersBN.from(data).toNumber() : 0
}

export const useUserNounTokenBalance = (
  addresses: ContractAddresses,
): number | undefined => {
  // const { library: provider } = useEthers()
  const { updateCache, fetchCache, isCached, remainingCacheTime, removeCache } =
    useLRUCache()

  const method = 'balanceOf'

  const { activeAccount } = useAppSelector((state) => state.account)

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    // provider,
  ) as NounsToken

  const lruCacheKey = `${contract.address}_${method}_${activeAccount}`
  const cachedData = fetchCache(lruCacheKey) as number
  const isFullyCached = useMemo(
    () => isCached(lruCacheKey) && !!cachedData,
    [lruCacheKey],
  )

  // console.debug(`Calling function 'balanceOf' on contract ${contract.address}`);
  const { value: tokenBalance, error } =
    useCachedCall(
      contract &&
        activeAccount &&
        !isFullyCached && {
          contract: contract,
          method: 'balanceOf',
          args: [activeAccount],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  const result = tokenBalance?.[0].toNumber()
  useEffect(() => void updateCache(lruCacheKey, result), [lruCacheKey, result])

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
    const cachedTimeLeft = remainingCacheTime(lruCacheKey)
    if (isFullyCached || cachedTimeLeft > 0) {
      recordApiStat(RecordActions.FETCH)
      setData(cachedData)
      return
    }
    if (!!result) {
      updateCache(lruCacheKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
      setData(result)
      return
    }
    if (cachedTimeLeft <= 0) {
      removeCache(lruCacheKey)
      recordApiStat(RecordActions.REMOVE)
      return
    }
    recordApiStat(RecordActions.MISS)
  }, [dispatch, lruCacheKey, isFullyCached, result])

  return data
}
