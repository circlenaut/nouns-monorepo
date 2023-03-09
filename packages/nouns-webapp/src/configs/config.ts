import { ChainId } from '@usedapp/core'

import { environmentVariables, EnvironmentVariables } from '@/hooks/useEnv'
import { SupportedChains } from '@/utils/provider'
import { ContractAddresses } from '.'
import {
  ADDRESS_ID,
  CHAIN_ID,
  DEFAULT_CHAIN_ID,
  ETHERSCAN_API_KEY,
  ETH_DECIMAL_PLACES,
  MIN_BID_ETH,
  MULTI_CALL_ON_LOCAL_HOST,
  NOUNS_PICS_URL,
} from './constants'

export interface Config {
  app: AppConfig
  addresses?: ContractAddresses
  settings: {
    chainId: number
    addressId: number
    etherScanApiKey: string | undefined
    nounsPicsUrl: string | URL
  }
  constants: {
    multicallOnLocalhost: string
    ethDecimalPlaces: number
    minBidEth: string
    defaultChainId: ChainId
  }
  envs?: EnvironmentVariables
}

interface AppConfig {
  jsonRpcUri?: string
  wsRpcUri: string
  subgraphApiUri: string
  enableHistory: boolean
}

interface CacheBucket {
  name: string
  version: string
}

export const cache: Record<string, CacheBucket> = {
  seed: {
    name: 'seed',
    version: 'v1',
  },
  ens: {
    name: 'ens',
    version: 'v1',
  },
}

export const cacheKey = (
  bucket: CacheBucket,
  ...parts: (string | number)[]
) => {
  return [bucket.name, bucket.version, ...parts].join('-').toLowerCase()
}

const getInfuraProjectId = () => {
  const id = environmentVariables['INFURA_PROJECT_ID']
  if (!id) {
    throw Error('Infura Project ID not specified!')
  }
  return id
}

export const createNetworkHttpUrl = (network: string): string => {
  switch (network) {
    case 'mainnet':
      return (
        environmentVariables['MAINNET_JSONRPC'] ||
        `https://${network}.infura.io/v3/${getInfuraProjectId()}`
      )
    case 'goerli':
      return (
        environmentVariables['GOERLI_JSONRPC'] ||
        `https://${network}.infura.io/v3/${getInfuraProjectId()}`
      )
    case 'hardhat':
      return environmentVariables['HARDHAT_JSONRPC'] || 'http://localhost:8545'
    default:
      return 'http://localhost:8545'
  }
}

export const createNetworkWsUrl = (network: string): string => {
  switch (network) {
    case 'mainnet':
      return (
        environmentVariables['MAINNET_WSRPC'] ||
        `wss://${network}.infura.io/ws/v3/${getInfuraProjectId()}`
      )
    case 'goerli':
      return (
        environmentVariables['GOERLI_WSRPC'] ||
        `wss://${network}.infura.io/ws/v3/${getInfuraProjectId()}`
      )
    case 'hardhat':
      return environmentVariables['HARDHAT_WSRPC'] || 'ws://localhost:8545'
    default:
      return 'ws://localhost:8545'
  }
}

export const createSubgraphApiUri = (
  network?: string,
  version?: string,
): string => {
  switch (network) {
    case 'mainnet':
      return (
        environmentVariables['MAINNET_SUBGRAPH'] ||
        `https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/${version}/gn`
      )
    case 'goerli':
      return (
        environmentVariables['GOERLI_SUBGRAPH'] ||
        `https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns-${network.toLowerCase()}/${version}/gn`
      )
    case 'hardhat':
      return (
        environmentVariables['HARDHAT_SUBGRAPH'] ||
        'http://localhost:8000/subgraphs/name/nounsdao/nouns-subgraph'
      )
    default:
      return 'http://localhost:8000/subgraphs/name/nounsdao/nouns-subgraph'
  }
}

const app: Record<SupportedChains, AppConfig> = {
  [ChainId.Goerli]: {
    // jsonRpcUri: createNetworkHttpUrl('goerli'),
    wsRpcUri: createNetworkWsUrl('goerli'),
    subgraphApiUri: createSubgraphApiUri('goerli', '0.1.0'),
    enableHistory: environmentVariables['ENABLE_HISTORY'] === 'true' ?? 'true',
  },
  [ChainId.Mainnet]: {
    jsonRpcUri: createNetworkHttpUrl('mainnet'),
    wsRpcUri: createNetworkWsUrl('mainnet'),
    subgraphApiUri: createSubgraphApiUri('mainnet', '0.1.0'),
    enableHistory: environmentVariables['ENABLE_HISTORY'] === 'true' ?? 'true',
  },
  [ChainId.Hardhat]: {
    jsonRpcUri: createNetworkHttpUrl('hardhat'),
    wsRpcUri: createNetworkWsUrl('hardhat'),
    subgraphApiUri: createSubgraphApiUri('hardhat'),
    enableHistory: environmentVariables['ENABLE_HISTORY'] === 'true' ?? 'true',
  },
}

export const config: Config = {
  app: app[CHAIN_ID],
  settings: {
    chainId: CHAIN_ID,
    addressId: ADDRESS_ID,
    etherScanApiKey: ETHERSCAN_API_KEY,
    nounsPicsUrl: NOUNS_PICS_URL,
  },
  constants: {
    multicallOnLocalhost: MULTI_CALL_ON_LOCAL_HOST,
    ethDecimalPlaces: ETH_DECIMAL_PLACES,
    minBidEth: MIN_BID_ETH,
    defaultChainId: DEFAULT_CHAIN_ID,
  },
}
