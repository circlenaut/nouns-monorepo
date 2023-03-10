import { SearchIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { t, Trans } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { TransactionStatus, useBlockNumber } from '@usedapp/core'
import clsx from 'clsx'
import dayjs from 'dayjs'
import advanced from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap'
import { ReactNode } from 'react-markdown/lib/react-markdown'
import { useNavigate, useParams } from 'react-router-dom'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { DelegateVote } from '@/components/DelegateGroupedNounImageVoteTable'
import DynamicQuorumInfoModal from '@/components/DynamicQuorumInfoModal'
import ProposalContent from '@/components/ProposalContent'
import ProposalHeader from '@/components/ProposalHeader'
import ShortAddress from '@/components/ShortAddress'
import StreamWithdrawModal from '@/components/StreamWithdrawModal'
import VoteCard, { VoteCardVariant } from '@/components/VoteCard'
import VoteModal from '@/components/VoteModal'
import { AVERAGE_BLOCK_TIME_IN_SECS } from '@/configs'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useConfig } from '@/hooks/useConfig'
import Section from '@/layout/Section'
import { AlertModal, setAlertModal } from '@/state/slices/application'
import { getNounVotes } from '@/utils/getNounsVotes'
import { parseStreamCreationCallData } from '@/utils/streamingPaymentUtils/streamingPaymentUtils'
import {
  ProposalState,
  useCancelProposal,
  useCurrentQuorum,
  useExecuteProposal,
  useProposal,
  useProposalCount,
  useQueueProposal,
} from '@/wrappers/nounsDao'
import { useUserVotesAsOfBlock } from '@/wrappers/nounToken'
import {
  delegateNounsAtBlockQuery,
  Delegates,
  ProposalVotes,
  proposalVotesQuery,
  propUsingDynamicQuorum,
  useQuery,
} from '@/wrappers/subgraph'

import classes from './Vote.module.css'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advanced)

const VotePage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const propId = id ? parseInt(id) : null

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const { contractAddresses } = useContractAddresses()
  const proposalCountCall = useProposalCount(contractAddresses)
  const proposalCount = useMemo(() => proposalCountCall, [proposalCountCall])

  const [forceFetch, setForceFetch] = useState(false)
  const proposal = useProposal(propId ?? 0, forceFetch)

  const activeAccount = useAppSelector((state) => state.account.activeAccount)

  const [showVoteModal, setShowVoteModal] = useState<boolean>(false)
  const [showDynamicQuorumInfoModal, setShowDynamicQuorumInfoModal] =
    useState<boolean>(false)
  // Toggle between Noun centric view and delegate view
  const [isDelegateView, setIsDelegateView] = useState(false)

  const [isQueuePending, setQueuePending] = useState<boolean>(false)
  const [isExecutePending, setExecutePending] = useState<boolean>(false)
  const [isCancelPending, setCancelPending] = useState<boolean>(false)

  const [redirectToPage, setRedirectToPage] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const setModal = useCallback(
    (modal: AlertModal) => dispatch(setAlertModal(modal)),
    [dispatch],
  )

  const fetchPropUsingDynamicQuorum = useCallback(async () => {
    if (!id) return

    const query = print(propUsingDynamicQuorum(id.toString()))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [id])

  useEffect(
    () =>
      void (typeof id === 'string'
        ? queryClient.prefetchQuery({
            queryKey: [propUsingDynamicQuorum(id)],
            queryFn: fetchPropUsingDynamicQuorum,
          })
        : undefined),
    [id, queryClient],
  )
  const [showStreamWithdrawModal, setShowStreamWithdrawModal] =
    useState<boolean>(false)
  const [streamWithdrawInfo, setStreamWithdrawInfo] = useState<{
    streamAddress: string
    startTime: number
    endTime: number
    streamAmount: number
    tokenAddress: string
  } | null>(null)

  const {
    data: dqInfo,
    loading: loadingDQInfo,
    error: dqError,
  } = useQuery({
    queryKey: [propUsingDynamicQuorum(id ?? '0')],
    queryFn: fetchPropUsingDynamicQuorum,
  })

  const handleQueueProposal = useCallback(useQueueProposal, [contractAddresses])
  const { queueProposal, queueProposalState } =
    handleQueueProposal(contractAddresses)

  const handleExecuteProposal = useCallback(useExecuteProposal, [
    contractAddresses,
  ])
  const { executeProposal, executeProposalState } =
    handleExecuteProposal(contractAddresses)

  const handleCancelProposal = useCallback(useCancelProposal, [
    contractAddresses,
  ])
  const { cancelProposal, cancelProposalState } =
    handleCancelProposal(contractAddresses)

  // Get and format date from data
  const timestamp = Date.now()
  const currentBlock = useBlockNumber()
  const startDate = useMemo(
    () =>
      proposal && timestamp && currentBlock
        ? dayjs(timestamp).add(
            AVERAGE_BLOCK_TIME_IN_SECS * (proposal.startBlock - currentBlock),
            'seconds',
          )
        : undefined,
    [proposal, timestamp, currentBlock],
  )

  const endDate = useMemo(
    () =>
      proposal && timestamp && currentBlock
        ? dayjs(timestamp).add(
            AVERAGE_BLOCK_TIME_IN_SECS * (proposal.endBlock - currentBlock),
            'seconds',
          )
        : undefined,
    [proposal, timestamp, currentBlock],
  )

  const now = dayjs()

  // Get total votes and format percentages for UI
  const totalVotes = useMemo(
    () =>
      proposal
        ? proposal.forCount + proposal.againstCount + proposal.abstainCount
        : undefined,
    [proposal],
  )

  const forPercentage = useMemo(
    () => (proposal && totalVotes ? (proposal.forCount * 100) / totalVotes : 0),
    [proposal, totalVotes],
  )

  const againstPercentage = useMemo(
    () =>
      proposal && totalVotes ? (proposal.againstCount * 100) / totalVotes : 0,
    [proposal, totalVotes],
  )

  const abstainPercentage = useMemo(
    () =>
      proposal && totalVotes ? (proposal.abstainCount * 100) / totalVotes : 0,
    [proposal, totalVotes],
  )

  // Only count available votes as of the proposal created block
  const availableVotesCall = useUserVotesAsOfBlock(
    contractAddresses,
    proposal?.createdBlock ?? undefined,
  )
  const availableVotes = useMemo(() => availableVotesCall, [availableVotesCall])

  const currentQuorumCall = useCurrentQuorum(
    contractAddresses.nounsDAOProxy,
    proposal && proposal.id ? parseInt(proposal.id) : 0,
    dqInfo && dqInfo.proposal
      ? dqInfo.proposal.quorumCoefficient === '0'
      : true,
  )
  const currentQuorum = useMemo(() => currentQuorumCall, [currentQuorumCall])

  const hasSucceeded = useMemo(
    () => proposal?.status === ProposalState.SUCCEEDED,
    [proposal],
  )

  const isInNonFinalState = useMemo(
    () =>
      proposal?.status &&
      [
        ProposalState.PENDING,
        ProposalState.ACTIVE,
        ProposalState.SUCCEEDED,
        ProposalState.QUEUED,
      ].includes(proposal.status),
    [proposal],
  )

  const isCancellable = useMemo(
    () =>
      isInNonFinalState &&
      proposal?.proposer?.toLowerCase() === activeAccount?.toLowerCase(),
    [isInNonFinalState, proposal, activeAccount],
  )

  const isAwaitingStateChange = useMemo(
    () =>
      hasSucceeded ||
      (proposal?.status === ProposalState.QUEUED &&
        new Date() >= (proposal?.eta ?? Number.MAX_SAFE_INTEGER)),
    [hasSucceeded, proposal],
  )

  const isAwaitingDestructiveStateChange = useMemo(
    () => (isCancellable ? true : false),
    [isCancellable],
  )

  const isWalletConnected = useMemo(
    () => !(activeAccount === undefined),
    [activeAccount],
  )
  const isActiveForVoting = useMemo(
    () => startDate?.isBefore(now) && endDate?.isAfter(now),
    [startDate, now, endDate],
  )

  const startOrEndTimeCopy = () =>
    startDate?.isBefore(now) && endDate?.isAfter(now) ? (
      <Trans>Ends</Trans>
    ) : endDate?.isBefore(now) ? (
      <Trans>Ended</Trans>
    ) : (
      <Trans>Starts</Trans>
    )

  const startOrEndTimeTime = useCallback(
    () => (!startDate?.isBefore(now) ? startDate : endDate),
    [startDate, now, endDate],
  )

  const moveStateButtonAction = useMemo(
    () => (hasSucceeded ? 'Queue' : 'Execute'),
    [hasSucceeded],
  )
  const moveStateAction = useCallback(
    hasSucceeded
      ? () => proposal?.id && queueProposal(proposal.id)
      : () => proposal?.id && executeProposal(proposal.id),
    [hasSucceeded, proposal, queueProposal, executeProposal],
  )

  const destructiveStateButtonAction = isCancellable ? (
    <Trans>Cancel</Trans>
  ) : (
    ''
  )

  const destructiveStateAction = useCallback(() => {
    if (isCancellable && proposal?.id) {
      cancelProposal(proposal.id)
    }
  }, [isCancellable, proposal])

  const onTransactionStateChange = useCallback(
    (
      tx: TransactionStatus,
      successMessage?: ReactNode,
      setPending?: (isPending: boolean) => void,
      getErrorMessage?: (error?: string) => ReactNode | undefined,
      onFinalState?: () => void,
    ) => {
      switch (tx.status) {
        case 'None':
          setPending?.(false)
          break
        case 'Mining':
          setPending?.(true)
          break
        case 'Success':
          setModal({
            title: t`Success`,
            message: successMessage || t`Transaction Successful!`,
            show: true,
          })
          setPending?.(false)
          onFinalState?.()
          break
        case 'Fail':
          setModal({
            title: t`Transaction Failed`,
            message: tx?.errorMessage || t`Please try again.`,
            show: true,
          })
          setPending?.(false)
          onFinalState?.()
          break
        case 'Exception':
          setModal({
            title: t`Error`,
            message:
              getErrorMessage?.(tx?.errorMessage) || t`Please try again.`,
            show: true,
          })
          setPending?.(false)
          onFinalState?.()
          break
      }
      setForceFetch(true)
    },
    [setModal],
  )

  useEffect(
    () =>
      onTransactionStateChange(
        queueProposalState,
        t`Proposal Queued!`,
        setQueuePending,
      ),
    [queueProposalState, onTransactionStateChange, setModal],
  )

  useEffect(
    () =>
      onTransactionStateChange(
        executeProposalState,
        t`Proposal Executed!`,
        setExecutePending,
      ),
    [executeProposalState, onTransactionStateChange, setModal],
  )

  useEffect(
    () =>
      onTransactionStateChange(
        cancelProposalState,
        t`Proposal Canceled!`,
        setCancelPending,
      ),
    [cancelProposalState, onTransactionStateChange, setModal],
  )

  const fetchProposalVotes = useCallback(async () => {
    if (!proposal?.id) return

    const query = print(proposalVotesQuery(proposal?.id))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [proposal])

  useEffect(
    () =>
      void (typeof proposal?.id === 'string'
        ? queryClient.prefetchQuery({
            queryKey: [proposalVotesQuery(proposal.id)],
            queryFn: fetchProposalVotes,
          })
        : undefined),
    [proposal, queryClient],
  )

  const {
    loading,
    error,
    data: voters,
  } = useQuery<ProposalVotes>({
    queryKey: [proposalVotesQuery(proposal?.id ?? '0')],
    queryFn: fetchProposalVotes,
    skip: !proposal,
  })

  const voterIds = useMemo(
    () => voters?.votes?.map((v) => v.voter.id),
    [voters],
  )

  const fetchDelegates = useCallback(async () => {
    if (!voterIds || !proposal) return

    const query = print(
      delegateNounsAtBlockQuery(voterIds, proposal.createdBlock),
    )
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [voterIds, proposal])

  useEffect(
    () =>
      void (voterIds && voterIds.length && proposal?.createdBlock != null
        ? queryClient.prefetchQuery({
            queryKey: [
              delegateNounsAtBlockQuery(voterIds, proposal.createdBlock),
            ],
            queryFn: fetchDelegates,
          })
        : undefined),
    [voterIds, proposal?.createdBlock, queryClient],
  )

  const { data: delegateSnapshot } = useQuery<Delegates>({
    queryKey: [
      delegateNounsAtBlockQuery(voterIds ?? [], proposal?.createdBlock ?? 0),
    ],
    queryFn: fetchDelegates,
    skip: !voters?.votes?.length,
  })

  const { delegates } = delegateSnapshot || {}
  const delegateToNounIds = useMemo(
    () =>
      delegates?.reduce<Record<string, string[]>>((acc, curr) => {
        acc[curr.id] = curr?.nounsRepresented?.map((nr) => nr.id) ?? []
        return acc
      }, {}),
    [delegates],
  )

  const data: DelegateVote[] | undefined = useMemo(
    () =>
      voters?.votes?.map((v) => ({
        delegate: v.voter.id,
        supportDetailed: v.supportDetailed,
        nounsRepresented: delegateToNounIds?.[v.voter.id] ?? [],
      })),
    [voters, delegateToNounIds],
  )

  // @TODO: What is this for?
  const [showToast, setShowToast] = useState(true)
  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false)
      }, 5000)
    }
  }, [showToast])

  useEffect(() => {
    if (id === 'create-proposal') {
      setRedirectToPage(`/${id}`)
    } else if (
      !propId ||
      (propId && isNaN(propId)) ||
      (proposalCount && propId && propId > proposalCount)
    ) {
      setRedirectToPage(`/vote/${proposalCount}`)
    }
  }, [id, propId, proposalCount])

  useEffect(() => {
    if (redirectToPage) navigate(redirectToPage)
  }, [redirectToPage])

  const cleanup = useRef(() => {
    setModal({ show: false })
    setShowDynamicQuorumInfoModal(false)
    setShowVoteModal(false)
  })

  useEffect(() => {
    const currentCleanup = cleanup.current
    return () => {
      currentCleanup()
    }
  }, [])

  if (!proposal || loading || !data || loadingDQInfo || !dqInfo) {
    return (
      <div className={classes.spinner}>
        <Spinner animation="border" />
      </div>
    )
  }

  if (error || dqError) {
    return <Trans>Failed to fetch</Trans>
  }

  const forNouns = getNounVotes(data, 1)
  const againstNouns = getNounVotes(data, 0)
  const abstainNouns = getNounVotes(data, 2)
  const isV2Prop = dqInfo.proposal.quorumCoefficient > 0

  return (
    <Section fullWidth={false} className={classes.votePage}>
      {showDynamicQuorumInfoModal && (
        <DynamicQuorumInfoModal
          proposal={proposal}
          againstVotesAbsolute={againstNouns.length}
          onDismiss={() => setShowDynamicQuorumInfoModal(false)}
          currentQuorum={currentQuorum}
        />
      )}
      <StreamWithdrawModal
        show={showStreamWithdrawModal}
        onDismiss={() => setShowStreamWithdrawModal(false)}
        {...streamWithdrawInfo}
      />
      {contractAddresses && (
        <VoteModal
          show={showVoteModal}
          onHide={() => setShowVoteModal(false)}
          proposalId={proposal?.id}
          availableVotes={availableVotes || 0}
          addresses={contractAddresses}
        />
      )}
      <Col lg={10} className={classes.wrapper}>
        {proposal && (
          <ProposalHeader
            proposal={proposal}
            isActiveForVoting={isActiveForVoting}
            isWalletConnected={isWalletConnected}
            submitButtonClickHandler={() => setShowVoteModal(true)}
          />
        )}
      </Col>
      <Col lg={10} className={clsx(classes.proposal, classes.wrapper)}>
        {proposal.status === ProposalState.EXECUTED &&
          proposal.details
            .filter((txn) => txn?.functionSig.includes('createStream'))
            .map((txn) => {
              const parsedCallData = parseStreamCreationCallData(txn.callData)
              if (
                parsedCallData.recipient.toLowerCase() !==
                activeAccount?.toLowerCase()
              ) {
                return <></>
              }

              return (
                <Row
                  key={parsedCallData.streamAddress}
                  className={clsx(
                    classes.section,
                    classes.transitionStateButtonSection,
                  )}
                >
                  <span className={classes.boldedLabel}>
                    <Trans>Only visible to you</Trans>
                  </span>
                  <Col className="d-grid gap-4">
                    <Button
                      onClick={() => {
                        setShowStreamWithdrawModal(true)
                        setStreamWithdrawInfo({
                          streamAddress: parsedCallData.streamAddress,
                          startTime: parsedCallData.startTime,
                          endTime: parsedCallData.endTime,
                          streamAmount: parsedCallData.streamAmount,
                          tokenAddress: parsedCallData.tokenAddress,
                        })
                      }}
                      variant="primary"
                      className={classes.transitionStateButton}
                    >
                      <Trans>
                        Withdraw from Stream{' '}
                        <ShortAddress
                          address={parsedCallData.streamAddress ?? ''}
                        />
                      </Trans>
                    </Button>
                  </Col>
                </Row>
              )
            })}

        {isWalletConnected &&
          (isAwaitingStateChange || isAwaitingDestructiveStateChange) && (
            <Row
              className={clsx(
                classes.section,
                classes.transitionStateButtonSection,
              )}
            >
              <Col className="d-grid gap-4">
                {isAwaitingStateChange && (
                  <Button
                    onClick={moveStateAction}
                    disabled={isQueuePending || isExecutePending}
                    variant="dark"
                    className={classes.transitionStateButton}
                  >
                    {isQueuePending || isExecutePending ? (
                      <Spinner animation="border" />
                    ) : (
                      `${moveStateButtonAction} Proposal ⌐◧-◧`
                    )}
                  </Button>
                )}

                {isAwaitingDestructiveStateChange && (
                  <Button
                    onClick={destructiveStateAction}
                    disabled={isCancelPending}
                    variant="danger"
                    className={classes.destructiveTransitionStateButton}
                  >
                    {isCancelPending ? (
                      <Spinner animation="border" />
                    ) : (
                      <Trans>
                        {destructiveStateButtonAction} Proposal ⌐◧-◧
                      </Trans>
                    )}
                  </Button>
                )}
              </Col>
            </Row>
          )}
        <button
          onClick={() => setIsDelegateView(!isDelegateView)}
          className={classes.toggleDelegateVoteViewButton}
        >
          {isDelegateView ? (
            <Trans>Switch to Noun view</Trans>
          ) : (
            <Trans>Switch to delegate view</Trans>
          )}
        </button>
        <Row>
          <VoteCard
            proposal={proposal}
            percentage={forPercentage}
            nounIds={forNouns}
            variant={VoteCardVariant.FOR}
            delegateView={isDelegateView}
            delegateGroupedVoteData={data}
          />
          <VoteCard
            proposal={proposal}
            percentage={againstPercentage}
            nounIds={againstNouns}
            variant={VoteCardVariant.AGAINST}
            delegateView={isDelegateView}
            delegateGroupedVoteData={data}
          />
          <VoteCard
            proposal={proposal}
            percentage={abstainPercentage}
            nounIds={abstainNouns}
            variant={VoteCardVariant.ABSTAIN}
            delegateView={isDelegateView}
            delegateGroupedVoteData={data}
          />
        </Row>

        {/* TODO abstract this into a component  */}
        <Row>
          <Col xl={4} lg={12}>
            <Card className={classes.voteInfoCard}>
              <Card.Body className="p-2">
                <div className={classes.voteMetadataRow}>
                  <div className={classes.voteMetadataRowTitle}>
                    <h1>
                      <Trans>Threshold</Trans>
                    </h1>
                  </div>
                  {isV2Prop && (
                    <ReactTooltip
                      id={'view-dq-info'}
                      className={classes.delegateHover}
                      content={'View Threshold Info'}
                    />
                  )}
                  <div
                    data-for="view-dq-info"
                    data-tip="View Dynamic Quorum Info"
                    onClick={() =>
                      setShowDynamicQuorumInfoModal(true && isV2Prop)
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      setShowDynamicQuorumInfoModal(true && isV2Prop)
                    }
                    role="button"
                    tabIndex={0}
                    className={clsx(
                      classes.thresholdInfo,
                      isV2Prop ? classes.cursorPointer : '',
                    )}
                  >
                    <span>
                      {isV2Prop ? (
                        <Trans>Current Threshold</Trans>
                      ) : (
                        <Trans>Threshold</Trans>
                      )}
                    </span>
                    <h3>
                      <Trans>
                        {isV2Prop
                          ? i18n.number(currentQuorum ?? 0)
                          : proposal.quorumVotes}{' '}
                        votes
                      </Trans>
                      {isV2Prop && <SearchIcon className={classes.dqIcon} />}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4} lg={12}>
            <Card className={classes.voteInfoCard}>
              <Card.Body className="p-2">
                <div className={classes.voteMetadataRow}>
                  <div className={classes.voteMetadataRowTitle}>
                    <h1>{startOrEndTimeCopy()}</h1>
                  </div>
                  <div className={classes.voteMetadataTime}>
                    <span>
                      {startOrEndTimeTime() &&
                        i18n.date(
                          new Date(startOrEndTimeTime()?.toISOString() || 0),
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZoneName: 'short',
                          },
                        )}
                    </span>
                    <h3>
                      {startOrEndTimeTime() &&
                        i18n.date(
                          new Date(startOrEndTimeTime()?.toISOString() || 0),
                          {
                            dateStyle: 'long',
                          },
                        )}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4} lg={12}>
            <Card className={classes.voteInfoCard}>
              <Card.Body className="p-2">
                <div className={classes.voteMetadataRow}>
                  <div className={classes.voteMetadataRowTitle}>
                    <h1>Snapshot</h1>
                  </div>
                  <div className={classes.snapshotBlock}>
                    <span>
                      <Trans>Taken at block</Trans>
                    </span>
                    <h3>{proposal.createdBlock}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ProposalContent proposal={proposal} />
      </Col>
    </Section>
  )
}

export default VotePage
