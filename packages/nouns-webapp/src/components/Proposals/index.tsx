import { Trans } from '@lingui/macro'
import { ClockIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { useBlockNumber } from '@usedapp/core'
import clsx from 'clsx'
import dayjs from 'dayjs'
import en from 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useMemo, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import DelegationModal from '@/components/DelegationModal'
import ProposalStatus from '@/components/ProposalStatus'
import { AVERAGE_BLOCK_TIME_IN_SECS } from '@/configs'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import { useContractAddresses } from '@/hooks/useAddresses'
import {
  SupportedLocale,
  SUPPORTED_LOCALE_TO_DAYSJS_LOCALE,
} from '@/i18n/locales'
import { isMobileScreen } from '@/utils/isMobile'
import {
  PartialProposal,
  ProposalState,
  useProposalThreshold,
} from '@/wrappers/nounsDao'
import { useUserNounTokenBalance, useUserVotes } from '@/wrappers/nounToken'
import { useAppSelector } from '@/hooks'

// tslint:disable:ordered-imports
import classes from './Proposals.module.css'
import proposalStatusClasses from '@/components/ProposalStatus/ProposalStatus.module.css'

dayjs.extend(relativeTime)

const getCountdownCopy = (
  proposal: PartialProposal,
  currentBlock: number,
  locale: SupportedLocale,
) => {
  const timestamp = Date.now()
  const startDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.startBlock - currentBlock),
          'seconds',
        )
      : undefined

  const endDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.endBlock - currentBlock),
          'seconds',
        )
      : undefined

  const expiresDate = proposal && dayjs(proposal.eta).add(14, 'days')

  const now = dayjs()

  if (startDate?.isBefore(now) && endDate?.isAfter(now)) {
    return (
      <Trans>
        Ends{' '}
        {endDate
          .locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en)
          .fromNow()}
      </Trans>
    )
  }
  if (endDate?.isBefore(now)) {
    return (
      <Trans>
        Expires{' '}
        {expiresDate
          .locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en)
          .fromNow()}
      </Trans>
    )
  }
  return (
    <Trans>
      Starts{' '}
      {dayjs(startDate)
        .locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en)
        .fromNow()}
    </Trans>
  )
}

const Proposals: React.FC<{ proposals: PartialProposal[] }> = ({
  proposals,
}: {
  proposals: PartialProposal[]
}) => {
  const navigate = useNavigate()

  const activeAccount = useAppSelector((state) => state.account.activeAccount)
  // const appState = useAppSelector((state) => state)

  const { contractAddresses } = useContractAddresses()

  const currentBlock = useBlockNumber()
  const isMobile = isMobileScreen()
  const activeLocale = useActiveLocale()
  const [showDelegateModal, setShowDelegateModal] = useState(false)

  // Fetch the number of votes this user may cast
  const connectedAccountNounVotesCall = useUserVotes(contractAddresses)
  const connectedAccountNounVotes = useMemo(
    () => connectedAccountNounVotesCall ?? 0,
    [connectedAccountNounVotesCall],
  )

  // Fetch the minimum number of Nouns require to cast a vote
  const proposalThresholdCall = useProposalThreshold(contractAddresses)
  const proposalThreshold = useMemo(
    () => (proposalThresholdCall ? proposalThresholdCall : 0 + 1),
    [proposalThresholdCall],
  )

  const hasEnoughVotesToPropose = useMemo(
    () =>
      activeAccount !== undefined &&
      connectedAccountNounVotes >= proposalThreshold,
    [proposalThreshold, activeAccount, connectedAccountNounVotes],
  )

  const userTokenBalanceCall = useUserNounTokenBalance(contractAddresses)
  const userTokenBalance = useMemo(
    () => userTokenBalanceCall ?? 0,
    [userTokenBalanceCall],
  )
  const hasNounBalance = userTokenBalance > 0

  const nullStateCopy = () => {
    if (activeAccount !== null) {
      if (connectedAccountNounVotes > 0) {
        return (
          <Trans>Making a proposal requires {proposalThreshold} votes</Trans>
        )
      }
      return <Trans>You have no Votes.</Trans>
    }
    return <Trans>Connect wallet to make a proposal.</Trans>
  }

  return (
    <div className={classes.proposals}>
      {showDelegateModal && (
        <DelegationModal onDismiss={() => setShowDelegateModal(false)} />
      )}
      <div
        className={clsx(
          classes.headerWrapper,
          !hasEnoughVotesToPropose ? classes.forceFlexRow : '',
        )}
      >
        <h3 className={classes.heading}>
          <Trans>Proposals</Trans>
        </h3>
        {hasEnoughVotesToPropose ? (
          <div className={classes.nounInWalletBtnWrapper}>
            <div className={classes.submitProposalButtonWrapper}>
              <Button
                className={classes.generateBtn}
                onClick={() => navigate('create-proposal')}
                disabled={!hasEnoughVotesToPropose}
              >
                <Trans>Submit Proposal</Trans>
              </Button>
            </div>

            {hasNounBalance && (
              <div className={classes.delegateBtnWrapper}>
                <Button
                  className={classes.changeDelegateBtn}
                  onClick={() => setShowDelegateModal(true)}
                  disabled={!hasNounBalance}
                >
                  <Trans>Delegate</Trans>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={clsx(
              'd-flex',
              classes.nullStateSubmitProposalBtnWrapper,
            )}
          >
            {!isMobile && (
              <div className={classes.nullStateCopy}>{nullStateCopy()}</div>
            )}
            <div className={classes.nullBtnWrapper}>
              <Button
                className={classes.generateBtnDisabled}
                disabled={!isMobile || !hasEnoughVotesToPropose}
              >
                <Trans>Submit Proposal</Trans>
              </Button>
            </div>
            {!isMobile && hasNounBalance && (
              <div className={classes.delegateBtnWrapper}>
                <Button
                  className={classes.changeDelegateBtn}
                  onClick={() => setShowDelegateModal(true)}
                  disabled={!isMobile || !hasNounBalance}
                >
                  <Trans>Delegate</Trans>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {isMobile && (
        <div className={classes.nullStateCopy}>{nullStateCopy()}</div>
      )}
      {isMobile && hasNounBalance && (
        <div>
          <Button
            className={classes.changeDelegateBtn}
            onClick={() => setShowDelegateModal(true)}
            disabled={!isMobile || !hasNounBalance}
          >
            <Trans>Delegate</Trans>
          </Button>
        </div>
      )}
      {proposals?.length ? (
        proposals
          .slice(0)
          .reverse()
          .map((p, i) => {
            const isPropInStateToHaveCountDown =
              p.status === ProposalState.PENDING ||
              p.status === ProposalState.ACTIVE ||
              p.status === ProposalState.QUEUED

            const countdownPill = (
              <div className={classes.proposalStatusWrapper}>
                <div
                  className={clsx(
                    proposalStatusClasses.proposalStatus,
                    classes.countdownPill,
                  )}
                >
                  <div className={classes.countdownPillContentWrapper}>
                    <span className={classes.countdownPillClock}>
                      <ClockIcon height={16} width={16} />
                    </span>{' '}
                    <span className={classes.countdownPillText}>
                      {getCountdownCopy(p, currentBlock || 0, activeLocale)}
                    </span>
                  </div>
                </div>
              </div>
            )

            return (
              <Link
                to={`/vote/${p.id}`}
                className={clsx(
                  classes.proposalLink,
                  classes.proposalLinkWithCountdown,
                )}
                key={i}
              >
                <div className={classes.proposalInfoWrapper}>
                  <span className={classes.proposalTitle}>
                    <span className={classes.proposalId}>
                      {i18n.number(parseInt(p.id || '0'))}
                    </span>{' '}
                    <span>{p.title}</span>
                  </span>

                  {isPropInStateToHaveCountDown && (
                    <div className={classes.desktopCountdownWrapper}>
                      {countdownPill}
                    </div>
                  )}
                  <div
                    className={clsx(
                      classes.proposalStatusWrapper,
                      classes.votePillWrapper,
                    )}
                  >
                    <ProposalStatus status={p.status}></ProposalStatus>
                  </div>
                </div>

                {isPropInStateToHaveCountDown && (
                  <div className={classes.mobileCountdownWrapper}>
                    {countdownPill}
                  </div>
                )}
              </Link>
            )
          })
      ) : (
        <Alert variant="secondary">
          <Alert.Heading>
            <Trans>No proposals found</Trans>
          </Alert.Heading>
          <p>
            <Trans>
              Proposals submitted by community members will appear here.
            </Trans>
          </p>
        </Alert>
      )}
    </div>
  )
}
export default Proposals
