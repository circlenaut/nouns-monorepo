import Avatar from '@davatar/react'
import { Trans } from '@lingui/macro'
import React, { useEffect, useMemo, useState } from 'react'

import BrandSpinner from '@/components/BrandSpinner'
import { ChangeDelegateState } from '@/components/ChangeDelegatePanel'
import DelegationCandidateVoteCountInfo from '@/components/DelegationCandidateVoteCountInfo'
import ShortAddress from '@/components/ShortAddress'
import { useContractAddresses } from '@/hooks/useAddresses'
import { usePickByState } from '@/utils/pickByState'
import { useAccountVotes } from '@/wrappers/nounToken'
import { toShortAddress } from '../../utils/addressAndChainNameDisplayUtils'

import classes from './DelegationCandidateInfo.module.css'

interface DelegationCandidateInfoProps {
  address: string
  changeModalState: ChangeDelegateState
  votesToAdd: number
}

const DelegationCandidateInfo: React.FC<DelegationCandidateInfoProps> = (
  props,
) => {
  const { address, changeModalState, votesToAdd } = props
  const { contractAddresses } = useContractAddresses()

  const [willHaveVoteCount, setWillHaveVoteCount] = useState(0)

  const shortAddress = toShortAddress(address)

  const votesCall = useAccountVotes(contractAddresses, address)
  const votes = useMemo(() => votesCall, [votesCall])

  const countDelegatedNouns = votes ?? 0

  // Do this so that in the lag between the delegation happening on chain and the UI updating
  // we don't show that we've added the delegated votes twice
  useEffect(() => {
    if (
      changeModalState === ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
      willHaveVoteCount !== 0
    ) {
      setWillHaveVoteCount(0)
      return
    }

    if (willHaveVoteCount > 0) {
      return
    }
    if (
      changeModalState !== ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
      willHaveVoteCount !== countDelegatedNouns + votesToAdd
    ) {
      setWillHaveVoteCount(countDelegatedNouns + votesToAdd)
    }
  }, [willHaveVoteCount, countDelegatedNouns, votesToAdd, changeModalState])

  const changeDelegateInfo = usePickByState(
    changeModalState,
    [
      ChangeDelegateState.ENTER_DELEGATE_ADDRESS,
      ChangeDelegateState.CHANGING,
      ChangeDelegateState.CHANGE_SUCCESS,
    ],
    [
      <DelegationCandidateVoteCountInfo
        key={address}
        text={
          countDelegatedNouns > 0 ? (
            <Trans>Already has</Trans>
          ) : (
            <Trans>Has</Trans>
          )
        }
        voteCount={countDelegatedNouns}
        isLoading={false}
      />,
      <DelegationCandidateVoteCountInfo
        key={address}
        text={<Trans>Will have</Trans>}
        voteCount={willHaveVoteCount}
        isLoading={true}
      />,
      <DelegationCandidateVoteCountInfo
        key={address}
        text={<Trans>Now has</Trans>}
        voteCount={countDelegatedNouns}
        isLoading={false}
      />,
    ],
  )

  if (votes === null) {
    return (
      <div className={classes.spinner}>
        <BrandSpinner />
      </div>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.delegateCandidateInfoWrapper}>
        <div className={classes.avatarWrapper}>
          <Avatar address={address} size={45} />
        </div>
        <div>
          <div className={classes.ensText}>
            <ShortAddress address={address} />
          </div>
          <div className={classes.shortAddress}>{shortAddress}</div>
        </div>
      </div>

      {changeDelegateInfo}
    </div>
  )
}

export default DelegationCandidateInfo
