// Borrowed from: https://github.com/nnsprotocol/nns-resolver-demo/blob/main/src/examples/ethers.js

import {
  FallbackProvider,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers'
import { BigNumber as EthersBN, providers, utils } from 'ethers'

import { config } from '@/configs'
import {
  DEFAULT_CHAIN_ID,
  NOUNS_NAME_SERVICE_CONTRACT,
} from '@/configs/constants'
import { fetchEthersError } from '@/errors/ethers'

// const TEST_ADDRESS = "0xE5358CaB95014E2306815743793F16c93a8a5C70";
const NNS_REGISTRY = '0x3e1970dc478991b49c4327973ea8a4862ef5a4de'
const ENS_REGISTRY = '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e'

const nnsContractAddress = ((chainId) =>
  !!chainId ? chainId : DEFAULT_CHAIN_ID.toString())(
  NOUNS_NAME_SERVICE_CONTRACT[
    config.settings.chainId?.toString() as keyof typeof NOUNS_NAME_SERVICE_CONTRACT
  ],
)

/**
 * Look up via either the Nouns Name Service(NNS) or ENS (using NNS contract to resolve NNS with ENS fallback)
 * More info on NNS here: https://nns.xyz/ or https://mirror.xyz/nnsregistry.eth
 * @param provider provider
 * @param address  Address to resolve
 * @returns  NNS or ENS or null (if neither resolve)
 */
export const lookupNNSOrENS = async (
  provider: Web3Provider | JsonRpcProvider | FallbackProvider,
  address: string,
): Promise<string | null | undefined> => {
  try {
    const validAddress = utils.getAddress(address)

    // Call resolver contract
    const res = await provider.call({
      to: nnsContractAddress,
      data: '0x55ea6c47000000000000000000000000' + validAddress.substring(2), // call .resolve(address) method
    })
    // Parse result into a string.
    const offset = EthersBN.from(utils.hexDataSlice(res, 0, 32)).toNumber()
    const length = EthersBN.from(
      utils.hexDataSlice(res, offset, offset + 32),
    ).toNumber()
    const data = utils.hexDataSlice(res, offset + 32, offset + 32 + length)
    return utils.toUtf8String(data) || null
  } catch (error) {
    return fetchEthersError(error)
  }
}

export const lookupAddress = async (address: string) => {
  const provider = new providers.InfuraProvider()
  provider.network.ensAddress = NNS_REGISTRY
  return await provider.lookupAddress(address)
}

export const lookupAddressWithENSFallback = async (address: string) => {
  const provider = new providers.InfuraProvider()

  // try looking up the address on NNS (ie get name.⌐◨-◨)
  provider.network.ensAddress = NNS_REGISTRY
  const nnsName = await provider.lookupAddress(address)
  if (nnsName) {
    return nnsName
  }
  // if not, look up on ENS (ie get name.eth)
  provider.network.ensAddress = ENS_REGISTRY
  return await provider.lookupAddress(address)
}

export const lookupAddressWithENSFallbackUsingContract = async (
  address: string,
) => {
  const provider = new providers.InfuraProvider()

  try {
    // Call resolver contract
    const res = await provider.call({
      to: nnsContractAddress,
      data: '0x55ea6c47000000000000000000000000' + address.substring(2), // call .resolve(address) method
    })
    // Parse result into a string.
    const offset = EthersBN.from(utils.hexDataSlice(res, 0, 32)).toNumber()
    const length = EthersBN.from(
      utils.hexDataSlice(res, offset, offset + 32),
    ).toNumber()
    const data = utils.hexDataSlice(res, offset + 32, offset + 32 + length)
    return utils.toUtf8String(data) || null
  } catch (e) {
    return null
  }
}
