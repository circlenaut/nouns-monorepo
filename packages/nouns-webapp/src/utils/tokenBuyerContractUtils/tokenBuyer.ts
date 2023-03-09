import { useEthers } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import tokenBuyerABI from '@/libs/abi/tokenBuyerABI.json'
import type { TokenBuyerABI } from '@/types/typechain'
import { useCachedCall } from '@/wrappers/contracts'

const abi = tokenBuyerABI && new utils.Interface(tokenBuyerABI)
const BUFFER_BPS = 5_000

export const useEthNeeded = (
  address?: string,
  additionalTokens?: number,
): string | undefined => {
  const { library } = useEthers()

  const contract =
    address && (new Contract(address, abi, library) as TokenBuyerABI)

  // console.debug(`Calling function 'ethNeeded' on contract ${contract.address}`);
  const { value: ethNeeded, error } =
    useCachedCall(
      contract &&
        additionalTokens && {
          contract,
          method: 'ethNeeded',
          args: [additionalTokens, BUFFER_BPS],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return
  }

  return ethNeeded && ethNeeded[0]?.toString()
}
