import { environmentVariables } from '@/hooks/useEnv'
import { DEFAULT_LOCALE } from '@/i18n/locales'
import { getValidChainNetwork } from '@/utils/provider'
import { GraphQLClient } from '@/wrappers/subgraph'
import { ChainId } from '@usedapp/core'
import { ContractAddresses } from '.'

const createURL = (url: string) => {
  try {
    return new URL(url).href
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : `Unknown Error: ${error}`,
    )
    return ''
  }
}

export const AVERAGE_BLOCK_TIME_IN_SECS = 12

export const MULTI_CALL_ON_LOCAL_HOST =
  '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'

export const ETH_DECIMAL_PLACES = 2

export const MIN_BID_ETH = '0.02'

export const DEFAULT_CHAIN_ID = ChainId.Mainnet

export const DEFAULT_LOCALIZATION = DEFAULT_LOCALE

export const DEFAULT_GRAPHQL_CLIENT = GraphQLClient.APOLLO

export const DEFAULT_REACT_QUERY_STALE_TIME = Infinity

export const CACHE_MAX_AGE = 1000 * 60 * 5 // cache for 5 minutes

export const CACHE_MAX_ITEMS = 1000 // store at most 500 objects

export const AUCTION_SETTLEMENT_TIMEOUT = 120

export const CHAIN_ID = getValidChainNetwork(environmentVariables['CHAIN_ID'])

export const ADDRESS_ID = parseInt(environmentVariables['ADDRESS_ID'] ?? '1')

export const ETHERSCAN_API_KEY = environmentVariables['ETHERSCAN_API_KEY'] ?? ''

export const FOMO_NOUNS_URL = environmentVariables['FOMO_NOUNS_URL']

export const NOUNS_PICS_URL = environmentVariables['NOUNS_PICS_URL']
  ? // ? createURL(environmentVariables['NOUNS_PICS_URL'])
    environmentVariables['NOUNS_PICS_URL']
  : 'http://localhost:3000'

export const SETTLEMENT_TIMEOUT = parseInt(
  environmentVariables['SETTLEMENT_TIMEOUT'] ?? '5',
) // mins

// Nouns Mainnet
export const DEFAULT_ADDRESSES = {
  nounsToken: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
  nounsSeeder: '0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515',
  nounsDescriptor: '0x0Cfdb3Ba1694c2bb2CFACB0339ad7b1Ae5932B63',
  nftDescriptor: '0x0BBAd8c947210ab6284699605ce2a61780958264',
  nounsAuctionHouse: '0xF15a943787014461d94da08aD4040f79Cd7c124e',
  nounsAuctionHouseProxy: '0x830BD73E4184ceF73443C15111a1DF14e495C706',
  nounsAuctionHouseProxyAdmin: '0xC1C119932d78aB9080862C5fcb964029f086401e',
  nounsDaoExecutor: '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10',
  nounsDAOProxy: '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
  nounsDAOLogicV1: '0xa43aFE317985726E4e194eb061Af77fbCb43F944',
} as ContractAddresses

export const NOUNS_NAME_SERVICE_CONTRACT = {
  1: '0x849f92178950f6254db5d16d1ba265e70521ac1b', // mainnet
  5: '0x551AdE51c28b67b66868D61125768d571D2bB8BA', // goerli
  NNS_REGISTRY: '0x3e1970dc478991b49c4327973ea8a4862ef5a4de',
  ENS_REGISTRY: '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e',
}
