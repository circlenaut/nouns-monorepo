import { Trans } from '@lingui/macro'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ModalBottomButtonRow from '@/components/ModalBottomButtonRow'
import ModalLabel from '@/components/ModalLabel'
import ModalTextPrimary from '@/components/ModalTextPrimary'
import ModalTitle from '@/components/ModalTitle'
import ShortAddress from '@/components/ShortAddress'
import { useContractAddresses } from '@/hooks/useAddresses'
import useStreamPaymentTransactions from '@/hooks/useStreamPaymentTransactions'
import {
  formatTokenAmount,
  getTokenAddressForCurrency,
  usePredictStreamAddress,
} from '@/utils/streamingPaymentUtils/streamingPaymentUtils'
import { unixToDateString } from '@/utils/timeUtils'
import { FinalProposalActionStepProps } from '../..'

import classes from './StreamPaymentsReviewStep.module.css'

const StreamPaymentsReviewStep: React.FC<FinalProposalActionStepProps> = (
  props,
) => {
  const { onNextBtnClick, onPrevBtnClick, state, onDismiss } = props

  const { contractAddresses } = useContractAddresses()
  const predictedAddress = usePredictStreamAddress({
    msgSender: contractAddresses.nounsDaoExecutor,
    payer: contractAddresses.nounsDaoExecutor,
    recipient: state.address,
    tokenAmount: formatTokenAmount(state.amount, state.TransferFundsCurrency),
    tokenAddress: getTokenAddressForCurrency(state.TransferFundsCurrency),
    startTime: state.streamStartTimestamp,
    endTime: state.streamEndTimestamp,
  })

  const actionTransactions = useStreamPaymentTransactions({
    state,
    predictedAddress,
  })

  return (
    <>
      <ReactTooltip
        id={'address-tooltip'}
        // effect={'solid'}
        className={classes.hover}
        content={state.address}
        place={'top'}
      />
      <ModalTitle>
        <Trans>Review Streaming Payment Action</Trans>
      </ModalTitle>

      <ModalLabel>
        <Trans>Stream</Trans>
      </ModalLabel>

      <ModalTextPrimary>
        {Intl.NumberFormat(undefined, { maximumFractionDigits: 18 }).format(
          Number(state.amount),
        )}{' '}
        {state.TransferFundsCurrency}
      </ModalTextPrimary>

      <ModalLabel>
        <Trans>To</Trans>
      </ModalLabel>
      <ModalTextPrimary>
        <span data-for="address-tooltip" data-tip="address">
          <ShortAddress address={state.address} />
        </span>
      </ModalTextPrimary>

      <ModalLabel>
        <Trans>Starting on</Trans>
      </ModalLabel>
      <ModalTextPrimary>
        {unixToDateString(state.streamStartTimestamp)}
      </ModalTextPrimary>

      <ModalLabel>
        <Trans>Ending on</Trans>
      </ModalLabel>

      <ModalTextPrimary>
        {unixToDateString(state.streamEndTimestamp)}
      </ModalTextPrimary>

      <ModalBottomButtonRow
        prevBtnText={<Trans>Back</Trans>}
        onPrevBtnClick={onPrevBtnClick}
        nextBtnText={<Trans>Add Streaming Payment Action</Trans>}
        onNextBtnClick={() => {
          onNextBtnClick(actionTransactions[0])
          onDismiss()
        }}
      />
    </>
  )
}

export default StreamPaymentsReviewStep
