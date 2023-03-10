import { Contract, utils } from 'ethers';

import { SupportedCurrency } from '@/components/ProposalActionsModal/steps/TransferFundsDetailsStep';
import StreamFactoryABI from '@/libs/abi/streamFactory.abi.json';
import { useCachedCall } from '@/wrappers/contracts';
import { useContractAddresses } from '@/hooks/useAddresses';


interface UsePredictStreamAddressProps {
  msgSender?: string;
  payer?: string;
  recipient?: string;
  tokenAmount?: string;
  tokenAddress?: string;
  startTime?: number;
  endTime?: number;
}

const abi = new utils.Interface(StreamFactoryABI);

export const usePredictStreamAddress = ({
  msgSender,
  payer,
  recipient,
  tokenAmount,
  tokenAddress,
  startTime,
  endTime,
}: UsePredictStreamAddressProps) => {
  const { contractAddresses } = useContractAddresses()

  const contract = new Contract(contractAddresses.nounsStreamFactory ?? '', abi)
  // console.debug(`Calling function 'auction' on contract ${contract.address}`);
  const { value: predictedAddress, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'predictStreamAddress',
        args: [msgSender, payer, recipient, tokenAmount, tokenAddress, startTime, endTime],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return predictedAddress && predictedAddress[0].toString()
}

export const formatTokenAmount = (amount?: string, currency?: SupportedCurrency) => {
  const amt = amount ?? '0';
  switch (currency) {
    case SupportedCurrency.USDC:
      return Math.round(parseFloat(amt) * 1_000_000).toString();
    case SupportedCurrency.WETH:
      return utils.parseEther(amt).toString();
    default:
      return amt;
  }
}

export const getTokenAddressForCurrency = (currency?: SupportedCurrency) => {
  const { contractAddresses } = useContractAddresses()
  switch (currency) {
    case SupportedCurrency.USDC:
      return contractAddresses.usdcToken;
    case SupportedCurrency.WETH:
      return contractAddresses.weth;
    default:
      return '';
  }
}

export const parseStreamCreationCallData = (callData: string) => {
  const callDataArray = callData.split(',');

  if (!callDataArray || callDataArray.length < 6) {
    return {
      recipient: '',
      streamAddress: '',
      startTime: 0,
      endTime: 0,
      streamAmount: 0,
      tokenAddress: '',
    };
  }

  const streamAddress = callDataArray[6];
  const nonce = callDataArray[5];
  const startTime = parseInt(callDataArray[3]);
  const endTime = parseInt(callDataArray[4]);
  const streamAmount = parseInt(callDataArray[1]);
  const recipient = callDataArray[0];
  const tokenAddress = callDataArray[2];
  return {
    recipient,
    streamAddress,
    startTime,
    endTime,
    streamAmount,
    tokenAddress,
    nonce
  };
}
