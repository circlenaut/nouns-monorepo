import { ChainId } from '@usedapp/core'

import { DEFAULT_CHAIN_ID } from '@/configs'

export type SupportedChains = ChainId.Mainnet | ChainId.Goerli | ChainId.Hardhat

const isSupportedChain = (chainId: ChainId): chainId is SupportedChains =>
  true ?? false

const verifyChainIdSupport = (chainId: ChainId): SupportedChains => {
  if (!isSupportedChain(chainId)) {
    throw Error(`Unsupported chain! ${chainId}`)
  }
  return chainId as SupportedChains
}

export const getChainId = (chainId?: string) => {
  if (!chainId) return DEFAULT_CHAIN_ID

  switch (chainId) {
    case '1':
      return ChainId.Mainnet
    case '3':
      return ChainId.Ropsten
    case '4':
      return ChainId.Rinkeby
    case '5':
      return ChainId.Goerli
    case '42':
      return ChainId.Kovan
    case '1337':
      return ChainId.Localhost
    case '31337':
      return ChainId.Hardhat
    default:
      return undefined
  }
}

export const getValidChainNetwork = (chainId?: string): SupportedChains => {
  return verifyChainIdSupport(getChainId(chainId) ?? DEFAULT_CHAIN_ID)
}
