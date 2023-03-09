import { CHAIN_ID, ETHERSCAN_API_KEY } from '@/configs'
import { ChainId } from '@usedapp/core'

const getBaseURL = (network: ChainId) => {
  switch (network) {
    case ChainId.Mainnet:
      return 'https://etherscan.io/'
    case ChainId.Goerli:
      return 'https://goerli.etherscan.io/'
    case ChainId.Hardhat:
      // @TODO (circlenaut): Figure what to do here, is there a locally accessible alternative to etherscan?
      return ''
    default:
      return 'https://etherscan.io/'
  }
}

const BASE_URL = getBaseURL(CHAIN_ID)

export const buildEtherscanTxLink = (txHash: string): string => {
  const path = `tx/${txHash}`
  return new URL(path, BASE_URL).toString()
}

export const buildEtherscanAddressLink = (address: string): string => {
  const path = `address/${address}`
  return new URL(path, BASE_URL).toString()
}

export const buildEtherscanTokenLink = (
  tokenContractAddress: string,
  tokenId: number,
): string => {
  const path = `token/${tokenContractAddress}?a=${tokenId}`
  return new URL(path, BASE_URL).toString()
}

export const buildEtherscanHoldingsLink = (address: string): string => {
  const path = `tokenholdings?a=${address}`
  return new URL(path, BASE_URL).toString()
}

const getApiBaseURL = (network: ChainId) => {
  switch (network) {
    case ChainId.Mainnet:
      return 'https://api.etherscan.io/'
    case ChainId.Goerli:
      return 'https://api-goerli.etherscan.io/'
    case ChainId.Hardhat:
      // @TODO (circlenaut): Figure what to do here, is there a locally accessible alternative to etherscan?
      return ''
    default:
      return 'https://api.etherscan.io/'
  }
}

const API_BASE_URL = getApiBaseURL(CHAIN_ID)

export const buildEtherscanApiQuery = (
  address: string,
  module = 'contract',
  action = 'getsourcecode',
): string => {
  if (!ETHERSCAN_API_KEY) {
    throw Error(
      'Unable to build Etherscan query, ETHERSCAN_API_KEY not defined!',
    )
  }
  const params = new URLSearchParams({
    module,
    action,
    address,
    apikey: ETHERSCAN_API_KEY,
  })
  const path = `api?${params.toString()}`
  return new URL(path, API_BASE_URL).toString()
}
