import { Interface } from 'ethers/lib/utils'
import React, { SetStateAction, UIEvent, useCallback, useState } from 'react'

import SolidColorBackgroundModal from '@/components/SolidColorBackgroundModal'
import { Config } from '@/configs'
import { useConfig } from '@/hooks/useConfig'
import { ProposalTransaction } from '@/wrappers/nounsDao'
import FunctionCallEnterArgsStep from './steps/FunctionCallEnterArgsStep'
import FunctionCallReviewStep from './steps/FunctionCallReviewStep'
import FunctionCallSelectFunctionStep from './steps/FunctionCallSelectFunctionStep'
import SelectProposalActionStep from './steps/SelectProposalActionStep'
import TransferFundsDetailsStep, {
  SupportedCurrency,
} from './steps/TransferFundsDetailsStep'
import TransferFundsReviewStep from './steps/TransferFundsReviewStep'
import StreamPaymentsPaymentDetailsStep from './steps/StreamPaymentsPaymentDetailsStep';
import StreamPaymentDateDetailsStep from './steps/StreamPaymentsDateDetailsStep';
import StreamPaymentsReviewStep from './steps/StreamPaymentsReviewStep';




export enum ProposalActionCreationStep {
  SELECT_ACTION_TYPE,
  LUMP_SUM_DETAILS,
  LUMP_SUM_REVIEW,
  FUNCTION_CALL_SELECT_FUNCTION,
  FUNCTION_CALL_ADD_ARGUMENTS,
  FUNCTION_CALL_REVIEW,
  STREAM_PAYMENT_PAYMENT_DETAILS,
  STREAM_PAYMENT_DATE_DETAILS,
  STREAM_PAYMENT_REVIEW
}


export enum ProposalActionType {
  LUMP_SUM,
  FUNCTION_CALL,
  STREAM
}

export interface ProposalActionModalState {
  actionType: ProposalActionType
  address: string
  config: Config
  amount?: string
  TransferFundsCurrency?: SupportedCurrency
  streamStartTimestamp?: number;
  streamEndTimestamp?: number;
  function?: string
  abi?: Interface
  args?: string[]
}
export interface ProposalActionModalStepProps {

  onPrevBtnClick: (e?: ProposalTransaction) => void
  onNextBtnClick: (e?: ProposalTransaction) => void
  state: ProposalActionModalState
  setState: (e: SetStateAction<ProposalActionModalState>) => void
}

export interface FinalProposalActionStepProps
  extends ProposalActionModalStepProps {
  onDismiss: () => void
}

export interface ProposalActionModalProps {
  onActionAdd: (transaction: ProposalTransaction) => void
  show: boolean
  onDismiss: () => void
}

const ModalContent: React.FC<{
  onActionAdd: (transaction: ProposalTransaction) => void
  onDismiss: () => void
}> = (props) => {
  const { onActionAdd, onDismiss } = props
  const config = useConfig()

  const [step, setStep] = useState<ProposalActionCreationStep>(
    ProposalActionCreationStep.SELECT_ACTION_TYPE,
  )

  const handleStep = useCallback(
    (action: ProposalActionCreationStep) => setStep(action),
    [],
  )

  const handleActionAdd = useCallback(
    (transaction: ProposalTransaction) => onActionAdd(transaction),
    [],
  )

  const [state, setState] = useState<ProposalActionModalState>({
    actionType: ProposalActionType.LUMP_SUM,
    address: '',
    config: config,
  })

  switch (step) {
    case ProposalActionCreationStep.SELECT_ACTION_TYPE:
      return (
        <SelectProposalActionStep
          onNextBtnClick={(e?: ProposalTransaction | UIEvent) => {
            const s = e as unknown as ProposalActionCreationStep
            s && handleStep(s)
          }}
          onPrevBtnClick={onDismiss}
          state={state}
          setState={setState}
        />
      )
    case ProposalActionCreationStep.LUMP_SUM_DETAILS:
      return (
        <TransferFundsDetailsStep
          onNextBtnClick={() =>
            handleStep(ProposalActionCreationStep.LUMP_SUM_REVIEW)
          }
          onPrevBtnClick={() =>
            handleStep(ProposalActionCreationStep.SELECT_ACTION_TYPE)
          }
          state={state}
          setState={setState}
        />
      )
    case ProposalActionCreationStep.LUMP_SUM_REVIEW:
      return (
        <TransferFundsReviewStep
          onNextBtnClick={(e?: ProposalTransaction | UIEvent) => {
            const t = e as unknown as ProposalTransaction
            t && handleActionAdd(t)
          }}
          onPrevBtnClick={() =>
            handleStep(ProposalActionCreationStep.LUMP_SUM_DETAILS)
          }
          state={state}
          setState={setState}
          onDismiss={onDismiss}
        />
      )
    case ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION:
      return (
        <FunctionCallSelectFunctionStep
          onNextBtnClick={() =>
            handleStep(ProposalActionCreationStep.FUNCTION_CALL_ADD_ARGUMENTS)
          }
          onPrevBtnClick={() =>
            handleStep(ProposalActionCreationStep.SELECT_ACTION_TYPE)
          }
          state={state}
          setState={setState}
        />
      )
    case ProposalActionCreationStep.FUNCTION_CALL_ADD_ARGUMENTS:
      return (
        <FunctionCallEnterArgsStep
          onNextBtnClick={() =>
            handleStep(ProposalActionCreationStep.FUNCTION_CALL_REVIEW)
          }
          onPrevBtnClick={() =>
            handleStep(ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION)
          }
          state={state}
          setState={setState}
        />
      )
    case ProposalActionCreationStep.FUNCTION_CALL_REVIEW:
      return (
        <FunctionCallReviewStep
          onNextBtnClick={(e?: ProposalTransaction | UIEvent) => {
            const t = e as unknown as ProposalTransaction
            t && handleActionAdd(t)
          }}
          onPrevBtnClick={() =>
            handleStep(ProposalActionCreationStep.FUNCTION_CALL_ADD_ARGUMENTS)
          }
          state={state}
          setState={setState}
          onDismiss={onDismiss}
        />
      )
    case ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS:
      return (
        <StreamPaymentsPaymentDetailsStep
          onNextBtnClick={() => setStep(ProposalActionCreationStep.STREAM_PAYMENT_DATE_DETAILS)}
          onPrevBtnClick={() => setStep(ProposalActionCreationStep.SELECT_ACTION_TYPE)}
          state={state}
          setState={setState}
        />
      );
    case ProposalActionCreationStep.STREAM_PAYMENT_DATE_DETAILS:
      return (
        <StreamPaymentDateDetailsStep
          onNextBtnClick={() => setStep(ProposalActionCreationStep.STREAM_PAYMENT_REVIEW)}
          onPrevBtnClick={() => setStep(ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS)}
          state={state}
          setState={setState}
        />
      );
    case ProposalActionCreationStep.STREAM_PAYMENT_REVIEW:
      return (
        <StreamPaymentsReviewStep
          onNextBtnClick={(transaction?: ProposalTransaction) => transaction && onActionAdd(transaction)}
          onPrevBtnClick={() => setStep(ProposalActionCreationStep.STREAM_PAYMENT_DATE_DETAILS)}
          state={state}
          setState={setState}
          onDismiss={onDismiss}
        />
      );
    default:
      return (
        <SelectProposalActionStep
          onNextBtnClick={() => console.info('')}
          onPrevBtnClick={() => console.info('')}
          state={state}
          setState={setState}
        />
      )
  }
}

const ProposalActionModal: React.FC<ProposalActionModalProps> = (props) => {
  const { onActionAdd, show, onDismiss } = props

  return (
    <SolidColorBackgroundModal
      show={show}
      onDismiss={onDismiss}
      content={<ModalContent onActionAdd={onActionAdd} onDismiss={onDismiss} />}
    />
  )
}

export default ProposalActionModal
