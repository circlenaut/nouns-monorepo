import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import { isAddress } from 'ethers/lib/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Collapse, FormControl } from 'react-bootstrap'
import { useEthers } from '@usedapp/core'

import BrandSpinner from '@/components/BrandSpinner'
import DelegationCandidateInfo from '@/components/DelegationCandidateInfo'
import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import { DEFAULT_LOCALIZATION } from '@/configs'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import { useContractAddresses } from '@/hooks/useAddresses'
import { buildEtherscanTxLink } from '@/utils/etherscan'
import { usePickByState } from '@/utils/pickByState'
import {
  useDelegateVotes,
  useNounTokenBalance,
  useUserDelegatee,
} from '@/wrappers/nounToken'

// tslint:disable:ordered-imports
import currentDelegatePanelClasses from '@/components/CurrentDelegatePanel/CurrentDelegatePanel.module.css'
import classes from './ChangeDelegatePanel.module.css'
import { useAppSelector } from '@/hooks'

interface ChangeDelegatePanelProps {
  onDismiss: () => void
  delegateTo?: string
}

export enum ChangeDelegateState {
  ENTER_DELEGATE_ADDRESS,
  CHANGING,
  CHANGE_SUCCESS,
  CHANGE_FAILURE,
}

/**
 * Gets localized title component based on current ChangeDelegateState
 * @param state
 */
const getTitleFromState = (state: ChangeDelegateState) => {
  switch (state) {
    case ChangeDelegateState.CHANGING:
      return <Trans>Updating...</Trans>
    case ChangeDelegateState.CHANGE_SUCCESS:
      return <Trans>Delegate Updated!</Trans>
    case ChangeDelegateState.CHANGE_FAILURE:
      return <Trans>Delegate Update Failed</Trans>
    default:
      return <Trans>Update Delegate</Trans>
  }
}

const ChangeDelegatePanel: React.FC<ChangeDelegatePanelProps> = (props) => {
  const { onDismiss, delegateTo } = props

  const [changeDelegateState, setChangeDelegateState] =
    useState<ChangeDelegateState>(ChangeDelegateState.ENTER_DELEGATE_ADDRESS)

  const { library: provider } = useEthers()
  const { activeAccount } = useAppSelector((state) => state.account)
  const { contractAddresses } = useContractAddresses()

  const [delegateAddress, setDelegateAddress] = useState(delegateTo ?? '')
  const [delegateInputText, setDelegateInputText] = useState(delegateTo ?? '')
  const [delegateInputClass, setDelegateInputClass] = useState<string>('')
  const [hasResolvedDeepLinkedENS, setHasResolvedDeepLinkedENS] =
    useState(false)
  const availableVotesCall = useNounTokenBalance(
    contractAddresses,
    activeAccount ?? '',
  )
  const availableVotes = useMemo(() => availableVotesCall, [availableVotesCall])

  const votes = useDelegateVotes(contractAddresses)
  const { send: delegateVotes, state: delegateState } = votes
    ? votes
    : { send: null, state: null }

  const locale = useActiveLocale()
  const currentDelegateCall = useUserDelegatee(contractAddresses)
  const currentDelegate = useMemo(
    () => currentDelegateCall,
    [currentDelegateCall],
  )

  useEffect(() => {
    if (!delegateState) return

    if (delegateState.status === 'Success') {
      setChangeDelegateState(ChangeDelegateState.CHANGE_SUCCESS)
    }

    if (
      delegateState.status === 'Exception' ||
      delegateState.status === 'Fail'
    ) {
      setChangeDelegateState(ChangeDelegateState.CHANGE_FAILURE)
    }

    if (delegateState.status === 'Mining') {
      setChangeDelegateState(ChangeDelegateState.CHANGING)
    }
  }, [delegateState, votes])

  useEffect(() => {
    const checkIsValidENS = async () => {
      const reverseENSResult = await provider?.resolveName(delegateAddress)
      if (reverseENSResult) {
        setDelegateAddress(reverseENSResult)
      }
      setHasResolvedDeepLinkedENS(true)
    }

    checkIsValidENS()
  }, [delegateAddress, delegateTo, provider])

  useEffect(() => {
    if (delegateAddress.length === 0) {
      classes.empty && setDelegateInputClass(classes.empty)
    } else {
      if (isAddress(delegateAddress)) {
        classes.valid && setDelegateInputClass(classes.valid)
      } else {
        classes.invalid && setDelegateInputClass(classes.invalid)
      }
    }
  }, [delegateAddress, delegateTo, hasResolvedDeepLinkedENS])

  const etherscanTxLink = useMemo(
    () =>
      delegateState
        ? buildEtherscanTxLink(delegateState.transaction?.hash ?? '')
        : undefined,
    [delegateState],
  )

  const primaryButton = usePickByState(
    changeDelegateState,
    [
      ChangeDelegateState.ENTER_DELEGATE_ADDRESS,
      ChangeDelegateState.CHANGING,
      ChangeDelegateState.CHANGE_SUCCESS,
      ChangeDelegateState.CHANGE_FAILURE,
    ],
    [
      <NavBarButton
        key={delegateAddress}
        buttonText={
          <div className={classes.delegateKVotesBtn}>
            {locale === DEFAULT_LOCALIZATION ? (
              <>
                Delegate{' '}
                <span className={classes.highlightCircle}>
                  {availableVotes}
                </span>
                {availableVotes === 1 ? <>Vote</> : <>Votes</>}
              </>
            ) : (
              <>
                {availableVotes === 1 ? (
                  <Trans>Delegate {availableVotes} Vote</Trans>
                ) : (
                  <Trans>Delegate {availableVotes} Votes</Trans>
                )}
              </>
            )}
          </div>
        }
        buttonStyle={
          isAddress(delegateAddress) &&
          delegateAddress !== currentDelegate &&
          availableVotes &&
          availableVotes > 0
            ? NavBarButtonStyle.DELEGATE_SECONDARY
            : NavBarButtonStyle.DELEGATE_DISABLED
        }
        onClick={() => {
          delegateVotes && delegateVotes(delegateAddress)
        }}
        disabled={
          (changeDelegateState === ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
            !isAddress(delegateAddress)) ||
          availableVotes === 0
        }
      />,
      <NavBarButton
        key={delegateAddress}
        buttonText={<Trans>View on Etherscan</Trans>}
        buttonStyle={NavBarButtonStyle.DELEGATE_PRIMARY}
        onClick={() => {
          window.open(etherscanTxLink, '_blank')?.focus()
        }}
        disabled={false}
      />,
      <NavBarButton
        key={delegateAddress}
        buttonText={<Trans>Close</Trans>}
        buttonStyle={NavBarButtonStyle.DELEGATE_SECONDARY}
        onClick={onDismiss}
      />,
      <></>,
    ],
  )

  const primaryCopy = usePickByState(
    changeDelegateState,
    [
      ChangeDelegateState.ENTER_DELEGATE_ADDRESS,
      ChangeDelegateState.CHANGING,
      ChangeDelegateState.CHANGE_SUCCESS,
      ChangeDelegateState.CHANGE_FAILURE,
    ],
    // eslint-disable-next-line no-sparse-arrays
    [
      <Trans key={delegateAddress}>
        Enter the Ethereum address or ENS name of the account you would like to
        delegate your votes to.
      </Trans>,
      <Trans key={delegateAddress}>
        Your <span style={{ fontWeight: 'bold' }}>{availableVotes}</span> votes
        are being delegated to a new account.
      </Trans>,
      <Trans key={delegateAddress}>
        Your <span style={{ fontWeight: 'bold' }}>{availableVotes}</span> votes
        have been delegated to a new account.
      </Trans>,
      <>{delegateState && delegateState.errorMessage}</>,
    ],
  )

  return (
    <>
      <div className={currentDelegatePanelClasses.wrapper}>
        <h1
          className={clsx(
            currentDelegatePanelClasses.title,
            locale !== DEFAULT_LOCALIZATION ? classes.nonEnBottomMargin : '',
          )}
        >
          {getTitleFromState(changeDelegateState)}
        </h1>
        <p className={currentDelegatePanelClasses.copy}>{primaryCopy}</p>
      </div>

      {!(changeDelegateState === ChangeDelegateState.CHANGE_FAILURE) &&
        delegateTo === undefined && (
          <FormControl
            className={clsx(classes.delegateInput, delegateInputClass)}
            type="string"
            onChange={(e) => {
              setDelegateAddress(e.target.value)
              setDelegateInputText(e.target.value)
            }}
            value={delegateInputText}
            placeholder={
              locale === DEFAULT_LOCALIZATION
                ? '0x... or ...eth'
                : '0x... / ...eth'
            }
          />
        )}

      {delegateTo !== undefined && !isAddress(delegateAddress) && (
        <div className={classes.delegateDeepLinkSpinner}>
          <BrandSpinner />
        </div>
      )}

      <Collapse
        in={
          isAddress(delegateAddress) &&
          !(changeDelegateState === ChangeDelegateState.CHANGE_FAILURE)
        }
      >
        <div className={classes.delegateCandidateInfoWrapper}>
          {changeDelegateState === ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
          delegateAddress === currentDelegate ? (
            <span className={classes.alreadyDelegatedCopy}>
              <Trans>You&apos;ve already delegated to this address</Trans>
            </span>
          ) : (
            <>
              {isAddress(delegateAddress) && availableVotes && (
                <DelegationCandidateInfo
                  address={delegateAddress || ''}
                  votesToAdd={availableVotes}
                  changeModalState={changeDelegateState}
                />
              )}
            </>
          )}
        </div>
      </Collapse>

      <div className={classes.buttonWrapper}>
        <NavBarButton
          buttonText={
            changeDelegateState === ChangeDelegateState.CHANGE_SUCCESS ? (
              <Trans>Change</Trans>
            ) : (
              <Trans>Close</Trans>
            )
          }
          buttonStyle={NavBarButtonStyle.DELEGATE_BACK}
          onClick={
            changeDelegateState === ChangeDelegateState.CHANGE_SUCCESS
              ? () => {
                  setDelegateAddress('')
                  setDelegateInputText('')
                  setChangeDelegateState(
                    ChangeDelegateState.ENTER_DELEGATE_ADDRESS,
                  )
                }
              : onDismiss
          }
        />
        {changeDelegateState === ChangeDelegateState.ENTER_DELEGATE_ADDRESS && (
          <div
            className={clsx(
              classes.customButtonHighlighter,
              isAddress(delegateAddress) && classes.extened,
            )}
          />
        )}
        {primaryButton}
      </div>
    </>
  )
}

export default ChangeDelegatePanel
