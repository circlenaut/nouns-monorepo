import { Trans } from '@lingui/macro'
import { utils } from 'ethers'
import React, { useCallback } from 'react'

import ModalBottomButtonRow from '@/components/ModalBottomButtonRow'
import ModalTitle from '@/components/ModalTitle'
import ShortAddress from '@/components/ShortAddress'
import { ContractAddresses } from '@/configs'
import { useContractAddresses } from '@/hooks/useAddresses'
import { ProposalTransaction } from '@/wrappers/nounsDao'
import { FinalProposalActionStepProps, ProposalActionModalState } from '../..'
import { SupportedCurrency } from '../TransferFundsDetailsStep'

import classes from './TransferFundsReviewStep.module.css'

import payerABI from '@/libs/abi/payerABI.json'

const handleActionAdd = (
  state: ProposalActionModalState,
  onActionAdd: (e?: ProposalTransaction) => void,
  addresses: ContractAddresses,
) => {
  if (state.TransferFundsCurrency === SupportedCurrency.ETH) {
    onActionAdd({
      address: state.address,
      value: state.amount
        ? utils.parseEther(state.amount.toString()).toString()
        : '0',
      signature: '',
      calldata: '0x',
    })
  } else if (state.TransferFundsCurrency === SupportedCurrency.USDC) {
    const signature = 'sendOrRegisterDebt(address,uint256)'
    const abi = payerABI && new utils.Interface(payerABI)
    const inpts = abi?.functions[signature]?.inputs

    addresses &&
      inpts &&
      onActionAdd({
        address: addresses.payerContract ?? '',
        value: '0',
        usdcValue: Math.round(parseFloat(state.amount ?? '0') * 1_000_000),
        signature,
        decodedCalldata: JSON.stringify([
          state.address,
          // USDC has 6 decimals so we convert from human readable format to contract input format here
          Math.round(parseFloat(state.amount ?? '0') * 1_000_000).toString(),
        ]),
        calldata: abi?._encodeParams(inpts, [
          state.address,
          // USDC has 6 decimals so we convert from human readable format to contract input format here
          Math.round(parseFloat(state.amount ?? '0') * 1_000_000).toString(),
        ]),
      })
  } else {
    // This should never happen
    alert('Unsupported currency selected')
  }
}

const TransferFundsReviewStep: React.FC<FinalProposalActionStepProps> = (
  props,
) => {
  const { onNextBtnClick, onPrevBtnClick, state, onDismiss } = props
  const { contractAddresses } = useContractAddresses()

  const handleNextClick = useCallback(() => {
    if (!contractAddresses) return
    handleActionAdd(state, onNextBtnClick, contractAddresses)
    onDismiss()
  }, [contractAddresses, state, onDismiss, handleActionAdd, onNextBtnClick])

  return (
    <div>
      <ModalTitle>
        <Trans>Review Transfer Funds Action</Trans>
      </ModalTitle>

      <span className={classes.label}>Pay</span>
      <div className={classes.text}>
        {Intl.NumberFormat(undefined, { maximumFractionDigits: 18 }).format(
          Number(state.amount),
        )}{' '}
        {state.TransferFundsCurrency}
      </div>
      <span className={classes.label}>To</span>
      <div className={classes.text}>
        <ShortAddress address={state.address} />
      </div>

      <ModalBottomButtonRow
        prevBtnText={<Trans>Back</Trans>}
        onPrevBtnClick={onPrevBtnClick}
        nextBtnText={<Trans>Add Transfer Funds Action</Trans>}
        onNextBtnClick={handleNextClick}
      />
    </div>
  )
}

export default TransferFundsReviewStep
