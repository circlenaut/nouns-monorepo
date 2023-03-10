import { useContractFunction, useEthers } from '@usedapp/core';
import { utils, BigNumber, Contract } from 'ethers';

import streamABI from '@/libs/abi/stream.abi.json';
import { StreamAbi } from '@/types/typechain';
import { useCachedCall } from './contracts';

const abi = new utils.Interface(streamABI)

export const useStreamRemainingBalance = (streamAddress: string) => {
  const contract = new Contract(streamAddress, abi) as StreamAbi

  const { value: balance, error } =
    useCachedCall(
      contract && {
          contract: contract,
          method: 'recipientBalance',
          args: []
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  return balance && balance[0]?.toString();
};

export const useWithdrawTokens = (streamAddress: string) => {
  const { library } = useEthers();
  const { send: withdrawTokens, state: withdrawTokensState } = useContractFunction(
    new Contract(streamAddress, abi, library),
    'withdraw',
  );
  return { withdrawTokens, withdrawTokensState };
};

export const useElapsedTime = (streamAddress: string) => {
  const contract = new Contract(streamAddress, abi) as StreamAbi

  const { value: elapsedTime, error } =
  useCachedCall(
    contract && {
        contract: contract,
        method: 'elapsedTime',
        args: []
      },
  ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  return elapsedTime?.[0]?.toNumber();
}
