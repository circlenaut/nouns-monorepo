import { useEthers } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import { NOUNS_NAME_SERVICE_CONTRACT } from '@/configs/constants'
import nounsNameServiceABI from '@/libs/abi/nounsNameServiceABI.json'
import { NounsNameServiceABI } from '@/types/typechain'
import { useCachedCall } from './contracts'

const abi = nounsNameServiceABI && new utils.Interface(nounsNameServiceABI)

/**
 * Look up via either the Nouns Name Service(NNS) or ENS (using NNS contract to resolve NNS with ENS fallback)
 * More info on NNS here: https://nns.xyz/ or https://mirror.xyz/nnsregistry.eth
 * @param address  Address to resolve
 * @returns  NNS or ENS or null (if neither resolve)
 */

export const useNounsNameService = (
  address: string,
  skip?: boolean,
): string | null | undefined => {
  const { chainId, library: provider } = useEthers()

  const contractAddress =
    chainId &&
    NOUNS_NAME_SERVICE_CONTRACT[
      chainId.toString() as keyof typeof NOUNS_NAME_SERVICE_CONTRACT
    ]
  const contract =
    contractAddress &&
    (new Contract(contractAddress, abi, provider) as NounsNameServiceABI)

  const { value: name, error } =
    useCachedCall(
      !skip &&
        contract &&
        address && {
          contract,
          method: 'resolve',
          args: [address],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return null
  }

  return name && name[0]
}
