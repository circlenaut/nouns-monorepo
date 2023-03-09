import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import { TransactionStatus } from '@usedapp/core'
import clsx from 'clsx'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Button, FloatingLabel, FormControl, Spinner } from 'react-bootstrap'

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import SolidColorBackgroundModal from '@/components/SolidColorBackgroundModal'
import { ContractAddresses } from '@/configs'
import {
  useCastRefundableVote,
  useCastRefundableVoteWithReason,
  Vote,
} from '@/wrappers/nounsDao'

import classes from './VoteModal.module.css'

interface VoteModalProps {
  show: boolean
  onHide: () => void
  proposalId: string | undefined
  availableVotes: number
  addresses: ContractAddresses
}

const POST_SUCCESSFUL_VOTE_MODAL_CLOSE_TIME_MS = 3000

const VoteModal: React.FC<VoteModalProps> = ({
  show,
  onHide,
  proposalId,
  availableVotes,
  addresses,
}: VoteModalProps) => {
  const castRefundableVotes = useCastRefundableVote(addresses)
  const { castRefundableVote, castRefundableVoteState } = castRefundableVotes
    ? castRefundableVotes
    : { castRefundableVote: null, castRefundableVoteState: null }

  const { castRefundableVoteWithReason, castRefundableVoteWithReasonState } =
    useCastRefundableVoteWithReason(addresses)
  const [vote, setVote] = useState<Vote>()
  const [voteReason, setVoteReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoteSuccessful, setIsVoteSuccessful] = useState(false)
  const [isVoteFailed, setIsVoteFailed] = useState(false)
  const [failureCopy, setFailureCopy] = useState<ReactNode>('')
  const [errorMessage, setErrorMessage] = useState<ReactNode>('')

  const getVoteErrorMessage = (error: string | undefined) => {
    if (error?.match(/voter already voted/)) {
      return <Trans>User Already Voted</Trans>
    }
    return error
  }

  const handleVoteStateChange = useCallback((state: TransactionStatus) => {
    switch (state.status) {
      case 'None':
        setIsLoading(false)
        break
      case 'Mining':
        setIsLoading(true)
        break
      case 'Success':
        setIsLoading(false)
        setIsVoteSuccessful(true)
        break
      case 'Fail':
        setFailureCopy(<Trans>Transaction Failed</Trans>)
        setErrorMessage(state?.errorMessage || <Trans>Please try again.</Trans>)
        setIsLoading(false)
        setIsVoteFailed(true)
        break
      case 'Exception':
        setFailureCopy(<Trans>Error</Trans>)
        setErrorMessage(
          getVoteErrorMessage(state?.errorMessage) || (
            <Trans>Please try again.</Trans>
          ),
        )
        setIsLoading(false)
        setIsVoteFailed(true)
        break
    }
  }, [])

  // Cast refundable vote transaction state hook
  useEffect(() => {
    if (!castRefundableVoteState) return
    handleVoteStateChange(castRefundableVoteState)
  }, [castRefundableVoteState, handleVoteStateChange])

  // Cast refundable vote with reason transaction state hook
  useEffect(() => {
    handleVoteStateChange(castRefundableVoteWithReasonState)
  }, [castRefundableVoteWithReasonState, handleVoteStateChange])

  // Auto close the modal after a transaction completes succesfully
  // Leave failed transaction up until user closes manually to allow for debugging
  useEffect(() => {
    if (isVoteSuccessful) {
      setTimeout(onHide, POST_SUCCESSFUL_VOTE_MODAL_CLOSE_TIME_MS)
    }
  }, [isVoteSuccessful, onHide])

  // If show is false (i.e. on hide) reset failure related state variables
  useEffect(() => {
    if (show) {
      return
    }
    setIsVoteFailed(false)
  }, [show])

  const voteModalContent = (
    <>
      <div className={classes.voteModalTitle}>
        <Trans>Vote on Prop {i18n.number(parseInt(proposalId || '0'))}</Trans>
      </div>
      <div className={classes.voteModalSubtitle}>
        {availableVotes === 1 ? (
          <Trans>
            Voting with{' '}
            <span className={classes.bold}>{i18n.number(availableVotes)}</span>{' '}
            Noun
          </Trans>
        ) : (
          <Trans>
            Voting with{' '}
            <span className={classes.bold}>{i18n.number(availableVotes)}</span>{' '}
            Nouns
          </Trans>
        )}
      </div>
      {isVoteSuccessful && (
        <div className={classes.transactionStatus}>
          <p>
            <Trans>
              You&apos;ve successfully voted on on prop{' '}
              {i18n.number(parseInt(proposalId || '0'))}
            </Trans>
          </p>

          <div className={classes.voteSuccessBody}>
            <Trans>Thank you for voting.</Trans>
          </div>
        </div>
      )}
      {isVoteFailed && (
        <div className={classes.transactionStatus}>
          <p className={classes.voteFailureTitle}>
            <Trans>There was an error voting for your account.</Trans>
          </p>
          <div className={classes.voteFailureBody}>
            {failureCopy}:{' '}
            <span className={classes.voteFailureErrorMessage}>
              {errorMessage}
            </span>
          </div>
        </div>
      )}
      {!isVoteFailed && !isVoteSuccessful && (
        <div
          className={clsx(
            classes.votingButtonsWrapper,
            isLoading ? classes.disabled : '',
          )}
        >
          <div
            onClick={() => setVote(Vote.FOR)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ;() => setVote(Vote.FOR)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <NavBarButton
              buttonText={<Trans>For</Trans>}
              buttonIcon={<></>}
              buttonStyle={NavBarButtonStyle.FOR_VOTE_SUBMIT}
              className={
                vote === Vote.FOR
                  ? ''
                  : vote === undefined
                  ? classes.inactive
                  : classes.unselected
              }
            />
          </div>
          <br />
          <div
            onClick={() => setVote(Vote.AGAINST)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ;() => setVote(Vote.AGAINST)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <NavBarButton
              buttonText={<Trans>Against</Trans>}
              buttonIcon={<></>}
              buttonStyle={NavBarButtonStyle.AGAINST_VOTE_SUBMIT}
              className={
                vote === Vote.AGAINST
                  ? ''
                  : vote === undefined
                  ? classes.inactive
                  : classes.unselected
              }
            />
          </div>
          <br />
          <div
            onClick={() => setVote(Vote.ABSTAIN)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ;() => setVote(Vote.ABSTAIN)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <NavBarButton
              buttonText={<Trans>Abstain</Trans>}
              buttonIcon={<></>}
              buttonStyle={NavBarButtonStyle.ABSTAIN_VOTE_SUBMIT}
              className={
                vote === Vote.ABSTAIN
                  ? ''
                  : vote === undefined
                  ? classes.inactive
                  : classes.unselected
              }
            />
          </div>
          <br />
          <FloatingLabel
            controlId="reasonTextarea"
            label={<Trans>Reason (Optional)</Trans>}
          >
            <FormControl
              as="textarea"
              placeholder={
                i18n.locale === 'en'
                  ? `Reason for voting ${Vote[vote ?? Vote.FOR]}`
                  : ''
              }
              value={voteReason}
              onChange={(e) => setVoteReason(e.target.value)}
              className={classes.voteReasonTextarea}
            />
          </FloatingLabel>
          <br />
          <Button
            onClick={async () => {
              if (vote === undefined || !proposalId || isLoading) {
                return
              }
              setIsLoading(true)
              const isReasonEmpty = voteReason.trim() === ''
              if (isReasonEmpty && castRefundableVote) {
                castRefundableVote({ proposalId, support: vote })
              } else {
                castRefundableVoteWithReason({
                  proposalId,
                  support: vote,
                  reason: voteReason,
                })
              }
            }}
            className={
              vote === undefined ? classes.submitBtnDisabled : classes.submitBtn
            }
          >
            {isLoading ? (
              <Spinner animation="border" />
            ) : (
              <Trans>Submit Vote</Trans>
            )}
          </Button>

          <div className={classes.gasFreeVotingWrapper}>
            <span className={classes.gasFreeVotingCopy}>
              <Trans>Gas spent on voting will be refunded to you.</Trans>
            </span>
          </div>
        </div>
      )}
    </>
  )

  // On modal dismiss, reset non-success state
  const resetNonSuccessStateAndHideModal = () => {
    setIsLoading(false)
    setIsVoteFailed(false)
    setErrorMessage('')
    setFailureCopy('')
    onHide()
  }

  return (
    <>
      <SolidColorBackgroundModal
        show={show}
        onDismiss={resetNonSuccessStateAndHideModal}
        content={voteModalContent}
      />
    </>
  )
}
export default VoteModal
