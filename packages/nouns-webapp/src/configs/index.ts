import type { ContractAddresses as NounsContractAddresses } from '@nouns/sdk'

interface ExternalContractAddresses {
  lidoToken: string | undefined
  usdcToken: string | undefined
  chainlinkEthUsdc: string | undefined
  payerContract: string | undefined
  tokenBuyer: string | undefined
  nounsStreamFactory: string | undefined
  weth: string | undefined
}

export type ContractAddresses = NounsContractAddresses &
  ExternalContractAddresses

export {
  cache,
  cacheKey,
  config,
  createNetworkHttpUrl,
  createNetworkWsUrl,
  createSubgraphApiUri,
  type Config,
} from './config'
export {
  ADDRESS_ID,
  AVERAGE_BLOCK_TIME_IN_SECS,
  CHAIN_ID,
  DEFAULT_ADDRESSES,
  DEFAULT_CHAIN_ID,
  DEFAULT_LOCALIZATION,
  ETHERSCAN_API_KEY,
  ETH_DECIMAL_PLACES,
  FOMO_NOUNS_URL,
  MIN_BID_ETH,
  MULTI_CALL_ON_LOCAL_HOST,
  NOUNS_PICS_URL,
} from './constants'
