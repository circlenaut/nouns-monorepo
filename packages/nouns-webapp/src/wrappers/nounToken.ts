import { useQueryClient } from '@tanstack/react-query'
import { useContractFunction, useEthers } from '@usedapp/core'
import { connectContractToSigner } from '@usedapp/core/dist/cjs/src/hooks'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as EthersBN, Contract, ethers, utils } from 'ethers'
import { print } from 'graphql/language/printer'
import { useCallback, useEffect } from 'react'

import { NounsTokenABI, type NounsToken } from '@nouns/sdk'

import { cache, cacheKey, CHAIN_ID, ContractAddresses } from '@/configs'
import { useAppSelector } from '@/hooks'
import { useConfig } from '@/hooks/useConfig'
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
  const { library } = useEthers()
  const contract = new Contract(
    addresses.nounsToken,
    abi,
    library,
  ) as NounsToken

  // console.debug(`Calling function 'dataURI' on contract ${contract.address}`);
  const { value: noun, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'dataURI',
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
  return json
  // return nounImgData && JSON.parse(Buffer.from(nounImgData, 'base64').toString('utf-8'));
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
    cache.seed && cacheKey(cache.seed, CHAIN_ID, addresses.nounsToken)

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
  const seedCacheKey =
    cache.seed && cacheKey(cache.seed, CHAIN_ID, addresses.nounsToken)

  const seeds = useNounSeeds(addresses)

  const seed = seeds?.[nounId.toNumber()]
  const { library } = useEthers()

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    library,
  ) as NounsToken

  // console.debug(`Calling function 'seeds' on contract ${contract.address}`);
  const { value: response, error } =
    useCachedCall(
      contract &&
        seeds &&
        Object.keys(seeds).length - 1 < nounId.toNumber() && {
          contract: contract,
          method: 'seeds',
          args: [nounId],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  if (response && seedCacheKey) {
    const seedCache = localStorage.getItem(seedCacheKey)
    if (seedCache && isSeedValid(response)) {
      const updatedSeedCache = JSON.stringify({
        ...JSON.parse(seedCache),
        [nounId.toString()]: {
          accessory: response.accessory,
          background: response.background,
          body: response.body,
          glasses: response.glasses,
          head: response.head,
        },
      })
      localStorage.setItem(seedCacheKey, updatedSeedCache)
    }
    return response
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
  const { library } = useEthers()
  const contract = new Contract(
    addresses.nounsToken,
    abi,
    library,
  ) as NounsToken

  // console.debug(`Calling function 'getCurrentVotes' on contract ${contract.address}`);
  const { value: votes, error } =
    useCachedCall(
      contract &&
        account && {
          contract: contract,
          method: 'getCurrentVotes',
          args: [account],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return votes && EthersBN.from(votes[0]).toNumber()
}

export const useUserDelegatee = (
  addresses: ContractAddresses,
): string | undefined => {
  const { library } = useEthers()
  const { activeAccount } = useAppSelector((state) => state.account)

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    library,
  ) as NounsToken

  // console.debug(`Calling function 'delegates' on contract ${contract.address}`);
  const { value: delegate, error } =
    useCachedCall(
      contract &&
        activeAccount && {
          contract: contract,
          method: 'delegates',
          args: [activeAccount],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return delegate && delegate[0]
}

export const useUserVotesAsOfBlock = (
  addresses: ContractAddresses,
  block: number | undefined,
): number | undefined => {
  const { library: provider } = useEthers()
  const { activeAccount } = useAppSelector((state) => state.account)

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    provider,
  ) as NounsToken

  // console.debug(`Calling function 'getPriorVotes' on contract ${contract.address}`);
  const { value: votes, error } =
    useCachedCall(
      contract &&
        activeAccount &&
        block && {
          contract: contract,
          method: 'getPriorVotes',
          args: [activeAccount, block],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return votes && EthersBN.from(votes[0]).toNumber()
}

export const useDelegateVotes = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    provider,
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
  const { library: provider } = useEthers()

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    provider,
  ) as NounsToken

  // console.debug(`Calling function 'balanceOf' on contract ${contract.address}`);
  const { value: tokenBalance, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'balanceOf',
        args: [address],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }
  return tokenBalance ? EthersBN.from(tokenBalance[0]).toNumber() : 0
}

export const useUserNounTokenBalance = (
  addresses: ContractAddresses,
): number | undefined => {
  const { library: provider } = useEthers()
  const { activeAccount } = useAppSelector((state) => state.account)

  const contract = new Contract(
    addresses.nounsToken,
    abi,
    provider,
  ) as NounsToken

  // console.debug(`Calling function 'balanceOf' on contract ${contract.address}`);
  const { value: tokenBalance, error } =
    useCachedCall(
      contract &&
        activeAccount && {
          contract: contract,
          method: 'balanceOf',
          args: [activeAccount],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return tokenBalance?.[0].toNumber()
}
