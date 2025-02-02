import { Trans } from '@lingui/macro'
import React, { useState } from 'react'

import BrandDropdown from '@/components/BrandDropdown'
import ModalBottomButtonRow from '@/components/ModalBottomButtonRow'
import ModalSubTitle from '@/components/ModalSubtitle'
import ModalTitle from '@/components/ModalTitle'
import { ProposalTransaction } from '@/wrappers/nounsDao'
import {
  ProposalActionCreationStep,
  ProposalActionModalStepProps,
  ProposalActionType,
} from '../..'

const proposalActionTypeToProposalActionCreationStep = (
  actionTypeString: string,
) => {
  if (actionTypeString === ProposalActionType.LUMP_SUM.toString()) {
    return ProposalActionCreationStep.LUMP_SUM_DETAILS
  } else if (actionTypeString === ProposalActionType.STREAM.toString()) {
    return ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS
  } else {
    return ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION
  }
}

const SelectProposalActionStep: React.FC<ProposalActionModalStepProps> = (
  props,
) => {
  const { onPrevBtnClick, onNextBtnClick, state, setState } = props

  const [nextStep, setNextStep] = useState<ProposalActionCreationStep>(
    proposalActionTypeToProposalActionCreationStep(
      state.actionType?.toString() ?? '',
    ),
  )

  return (
    <div>
      <ModalTitle>
        <Trans>Add Proposal Action</Trans>
      </ModalTitle>

      <ModalSubTitle>
        <Trans>
          <hr />
          <b>Guidelines</b>
          <hr />• Do <b>NOT</b> request ETH to trade into USDC. Instead, request
          USDC directly.
          <br />• Do <b>NOT</b> transfer funds externally to create an ETH or
          USDC stream. Instead, use the &quot;Stream Funds&quot; action.
          <hr />
          <b>Supported Action Types</b>
          <hr />
          <b>• Transfer Funds: </b>Send a fixed amount of ETH or USDC.
          <br />
          <b>• Stream Funds: </b>Stream a fixed amount of WETH or USDC.
          <br />
          <b>• Function Call: </b>Call a contract function.
        </Trans>
      </ModalSubTitle>

      <BrandDropdown
        value={state.actionType.toString()}
        onChange={(e) => {
          const actionType = Object.entries(ProposalActionType).find(
            (entry) => {
              return entry[1] === e.target.value
            },
          )
          setState((x) => ({
            ...x,
            actionType: actionType
              ? (actionType[1] as ProposalActionType)
              : ProposalActionType.LUMP_SUM,
          }))

          setNextStep(
            proposalActionTypeToProposalActionCreationStep(e.target.value),
          )
        }}
      >
        <option value={'Transfer Funds'}>Transfer Funds</option>
        <option value={'Stream Funds'}>Stream Funds</option>
        <option value={'Function Call'}>Function Call</option>
      </BrandDropdown>

      <ModalBottomButtonRow
        prevBtnText={<Trans>Close</Trans>}
        onPrevBtnClick={(transaction?: ProposalTransaction) =>
          onPrevBtnClick(transaction)
        }
        nextBtnText={<Trans>Add Action Details</Trans>}
        onNextBtnClick={() => {
          onNextBtnClick(nextStep as unknown as ProposalTransaction)
        }}
      />
    </div>
  )
}

export default SelectProposalActionStep
