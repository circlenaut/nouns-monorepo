import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { utils } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'

import BrandDropdown from '@/components/BrandDropdown'
import BrandNumericEntry from '@/components/BrandNumericEntry'
import BrandTextEntry from '@/components/BrandTextEntry'
import ModalBottomButtonRow from '@/components/ModalBottomButtonRow'
import ModalTitle from '@/components/ModalTitle'
import { ProposalActionModalStepProps } from '../..'

export enum SupportedCurrency {
  ETH = 'ETH',
  USDC = 'USDC',
}

const TransferFundsDetailsStep: React.FC<ProposalActionModalStepProps> = (
  props,
) => {
  const { onNextBtnClick, onPrevBtnClick, state, setState } = props

  const [currency, setCurrency] = useState<SupportedCurrency>(
    state.TransferFundsCurrency ?? SupportedCurrency.ETH,
  )
  const [amount, setAmount] = useState<string>(state.amount ?? '')
  const [formattedAmount, setFormattedAmount] = useState<string>(
    state.amount ?? '',
  )
  const [address, setAddress] = useState(state.address ?? '')
  const [isValidForNextStage, setIsValidForNextStage] = useState(false)

  const handleNextBtnClick = useCallback(() => {
    setState((x) => ({
      ...x,
      amount,
      address,
      TransferFundsCurrency: currency,
    }))
    onNextBtnClick()
  }, [amount, address, currency, onNextBtnClick])

  useEffect(() => {
    if (
      utils.isAddress(address) &&
      parseFloat(amount) > 0 &&
      !isValidForNextStage
    ) {
      setIsValidForNextStage(true)
    }
  }, [amount, address, isValidForNextStage])

  return (
    <div>
      <ModalTitle>
        <Trans>Add Transfer Funds Action</Trans>
      </ModalTitle>

      <BrandDropdown
        label={'Currency'}
        value={currency === SupportedCurrency.ETH ? 'ETH' : 'USDC'}
        onChange={(e) => {
          if (e.target.value === 'ETH') {
            setCurrency(SupportedCurrency.ETH)
          } else {
            setCurrency(SupportedCurrency.USDC)
          }
        }}
        chevronTop={38}
      >
        <option value="ETH">ETH</option>
        <option value="USDC">USDC</option>
      </BrandDropdown>

      <BrandNumericEntry
        label={'Amount'}
        value={formattedAmount}
        onValueChange={(e) => {
          setAmount(e.value)
          setFormattedAmount(e.formattedValue)
        }}
        placeholder={currency === SupportedCurrency.ETH ? '0 ETH' : '0 USDC'}
        isInvalid={parseFloat(amount) > 0 && new BigNumber(amount).isNaN()}
      />

      <BrandTextEntry
        label={'Recipient'}
        onChange={(e) => setAddress(e.target.value)}
        value={address}
        type="string"
        placeholder="0x..."
        isInvalid={address?.length === 0 ? false : !utils.isAddress(address)}
      />

      <ModalBottomButtonRow
        prevBtnText={<Trans>Back</Trans>}
        onPrevBtnClick={onPrevBtnClick}
        nextBtnText={<Trans>Review and Add</Trans>}
        isNextBtnDisabled={!isValidForNextStage}
        onNextBtnClick={handleNextBtnClick}
      />
    </div>
  )
}

export default TransferFundsDetailsStep
