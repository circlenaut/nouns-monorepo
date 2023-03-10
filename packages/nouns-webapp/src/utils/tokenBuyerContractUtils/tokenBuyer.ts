import { Contract } from 'ethers';
import { Interface } from 'ethers/lib/utils';

import tokenBuyerABI from '@/libs/abi/tokenBuyerABI.json';
import { useCachedCall } from '@/wrappers/contracts';
import { TokenBuyerABI } from '@/types/typechain/TokenBuyerABI';

const abi = new Interface(tokenBuyerABI);
const BUFFER_BPS = 5_000;

export const useEthNeeded = (address: string, additionalTokens: number, skip?: boolean) => {
  const contract = new Contract(address, abi) as TokenBuyerABI

  const { value: ethNeeded, error } =
    useCachedCall(
      contract &&
        !skip && {
          contract: contract,
          method: 'ethNeeded',
          args: [additionalTokens, BUFFER_BPS],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  
  return ethNeeded && ethNeeded[0]?.toString();
};