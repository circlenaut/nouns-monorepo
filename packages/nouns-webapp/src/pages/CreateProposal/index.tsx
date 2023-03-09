import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { withStepProgress } from 'react-stepz'

import CreateProposalButton from '@/components/CreateProposalButton'
import ProposalActionModal from '@/components/ProposalActionsModal'
import ProposalEditor from '@/components/ProposalEditor'
import ProposalTransactions from '@/components/ProposalTransactions'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import Section from '@/layout/Section'
import { AlertModal, setAlertModal } from '@/state/slices/application'
import { useEthNeeded } from '@/utils/tokenBuyerContractUtils/tokenBuyer'
import {
  ProposalState,
  ProposalTransaction,
  useProposal,
  useProposalCount,
  useProposalThreshold,
  usePropose,
} from '@/wrappers/nounsDao'
import { useUserVotes } from '@/wrappers/nounToken'

// tslint:disable:ordered-imports
import classes from './CreateProposal.module.css'
import navBarButtonClasses from '@/components/NavBarButton/NavBarButton.module.css'

const CreateProposalPage: React.FC = () => {
  // Setting default address to avoid hook order error on useEtherBalance and useTreasuryBalance
  const { contractAddresses } = useContractAddresses()

  const activeAccount = useAppSelector((state) => state.account.activeAccount)
  const navigate = useNavigate()

  const latestProposalIdCall = useProposalCount(contractAddresses)
  const latestProposalId = useMemo(
    () => latestProposalIdCall,
    [latestProposalIdCall],
  )
  const latestProposalCall = useProposal(latestProposalId?.toString())
  const latestProposal = useMemo(() => latestProposalCall, [latestProposalCall])
  const availableVotesCall = useUserVotes(contractAddresses)

  const availableVotes = useMemo(() => availableVotesCall, [availableVotesCall])

  const proposalThresholdCall = useProposalThreshold(contractAddresses)
  const proposalThreshold = useMemo(
    () => proposalThresholdCall,
    [proposalThresholdCall],
  )

  const fetchedPropose = usePropose(contractAddresses)

  const [titleValue, setTitleValue] = useState('')
  const [bodyValue, setBodyValue] = useState('')

  const [totalUSDCPayment, setTotalUSDCPayment] = useState<number>(0)
  const [tokenBuyerTopUpEth, setTokenBuyerTopUpETH] = useState<string>('0')

  const ethNeededCall = useEthNeeded(
    contractAddresses.tokenBuyer,
    totalUSDCPayment,
  )
  const ethNeeded = useMemo(() => ethNeededCall, [ethNeededCall])

  const proposalTransactionsRef = useRef<ProposalTransaction[]>([])
  const setProposalTransactions = (value: ProposalTransaction[]) => {
    proposalTransactionsRef.current = value
  }

  const handleAddProposalAction = useCallback(
    (transaction: ProposalTransaction) => {
      if (!transaction.address?.startsWith('0x')) {
        transaction.address = `0x${transaction.address}`
      }
      if (!transaction.calldata.startsWith('0x')) {
        transaction.calldata = `0x${transaction.calldata}`
      }

      if (transaction.usdcValue) {
        setTotalUSDCPayment(totalUSDCPayment + transaction.usdcValue)
      }

      proposalTransactionsRef.current.push(transaction)
      setShowTransactionFormModal(false)
      setProposalTransactions(proposalTransactionsRef.current)
    },
    [proposalTransactionsRef, setProposalTransactions, totalUSDCPayment],
  )

  const handleRemoveProposalAction = useCallback(
    (index: number) => {
      const propTxInx = proposalTransactionsRef.current[index]
      propTxInx &&
        setTotalUSDCPayment(totalUSDCPayment - (propTxInx.usdcValue ?? 0))
      proposalTransactionsRef.current.splice(index, 1)
      setProposalTransactions(proposalTransactionsRef.current)
    },
    [proposalTransactionsRef, setProposalTransactions, totalUSDCPayment],
  )

  useEffect(() => {
    if (
      ethNeeded !== undefined &&
      ethNeeded !== null &&
      ethNeeded !== tokenBuyerTopUpEth &&
      totalUSDCPayment > 0
    ) {
      const hasTokenBuyerTopTop =
        proposalTransactionsRef.current.filter(
          (txn) => txn.address === contractAddresses.tokenBuyer,
        )?.length > 0

      // Add a new top up txn if one isn't there already, else add to the existing one
      if (parseInt(ethNeeded) > 0 && !hasTokenBuyerTopTop) {
        handleAddProposalAction({
          address: contractAddresses.tokenBuyer ?? '',
          value: ethNeeded ?? '0',
          calldata: '0x',
          signature: '',
        })
      } else {
        if (parseInt(ethNeeded) > 0) {
          const indexOfTokenBuyerTopUp =
            proposalTransactionsRef.current
              .map((txn, index: number) => {
                if (txn.address === contractAddresses.tokenBuyer) {
                  return index
                } else {
                  return -1
                }
              })
              .filter((n) => n >= 0) ?? new Array<number>()

          const txns = proposalTransactionsRef.current
          const indexOfTokenBuyerTopUpKey =
            indexOfTokenBuyerTopUp?.length > 0
              ? indexOfTokenBuyerTopUp[0]
              : undefined
          if (indexOfTokenBuyerTopUpKey !== undefined) {
            const txn = txns[indexOfTokenBuyerTopUpKey]
            if (txn !== undefined) {
              txn.value = ethNeeded
              setProposalTransactions(txns)
            }
          }
        }
      }

      setTokenBuyerTopUpETH(ethNeeded ?? '0')
    }
  }, [
    ethNeeded,
    handleAddProposalAction,
    handleRemoveProposalAction,
    proposalTransactionsRef,
    tokenBuyerTopUpEth,
    totalUSDCPayment,
    contractAddresses.tokenBuyer,
  ])

  const handleTitleInput = useCallback(
    (title: string) => {
      setTitleValue(title)
    },
    [setTitleValue],
  )

  const handleBodyInput = useCallback(
    (body: string) => {
      setBodyValue(body)
    },
    [setBodyValue],
  )

  const isFormInvalid = useMemo(
    () =>
      !proposalTransactionsRef.current?.length ||
      titleValue === '' ||
      bodyValue === '',
    [proposalTransactionsRef, titleValue, bodyValue],
  )

  const hasEnoughVote = useMemo(
    () =>
      !!availableVotes &&
      proposalThreshold !== undefined &&
      availableVotes > proposalThreshold,
    [availableVotes, proposalThreshold],
  )

  const hasActiveOrPendingProposal = useMemo(
    () =>
      !!latestProposal &&
      (latestProposal.status === ProposalState.ACTIVE ||
        latestProposal.status === ProposalState.PENDING) &&
      latestProposal.proposer?.toLowerCase() === activeAccount?.toLowerCase(),
    [latestProposal, activeAccount],
  )

  const handleCreateProposal = useCallback(async () => {
    if (!proposalTransactionsRef.current?.length || !fetchedPropose) return

    try {
      fetchedPropose.propose(
        proposalTransactionsRef.current.map(({ address }) => address), // Targets
        proposalTransactionsRef.current.map(({ value }) => value ?? '0'), // Values
        proposalTransactionsRef.current.map(({ signature }) => signature), // Signatures
        proposalTransactionsRef.current.map(({ calldata }) => calldata), // Calldatas
        `# ${titleValue}\n\n${bodyValue}`, // Description
      )
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : `Unknown Error: ${error}`
      console.error(errMsg)
      setModal({
        title: 'Error',
        message: 'Unable to post this proposal 😔', // TODO: parse error codes
        show: true,
      })
    }
  }, [proposalTransactionsRef, fetchedPropose])

  const [showTransactionFormModal, setShowTransactionFormModal] =
    useState(false)
  const [isProposePending, setProposePending] = useState(false)
  const [isProposeCreated, setProposeCreated] = useState(false)

  const dispatch = useAppDispatch()
  const setModal = useCallback(
    (modal: AlertModal) => dispatch(setAlertModal(modal)),
    [dispatch],
  )

  useEffect(() => {
    if (!fetchedPropose) return
    switch (fetchedPropose.proposeState.status) {
      case 'None':
        setProposePending(false)
        break
      case 'Mining':
        setProposePending(true)
        break
      case 'Success':
        setModal({
          title: 'Success',
          message: 'Proposal Created!',
          show: true,
        })
        setProposePending(false)
        setProposeCreated(true)
        break
      case 'Fail':
        setModal({
          title: 'Transaction Failed',
          message:
            fetchedPropose.proposeState?.errorMessage || 'Please try again.',
          show: true,
        })
        setProposePending(false)
        break
      case 'Exception':
        setModal({
          title: 'Error',
          message:
            fetchedPropose.proposeState?.errorMessage || 'Please try again.',
          show: true,
        })
        setProposePending(false)
        break
    }
  }, [fetchedPropose, setModal])

  const cleanup = useRef(() => {
    setModal({ show: false })
    setProposePending(false)
  })

  useEffect(() => {
    const currentCleanup = cleanup.current
    return () => {
      currentCleanup()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (isProposeCreated) {
        navigate('/vote')
      }
    }
  }, [isProposeCreated])

  return (
    <Section fullWidth={false} className={classes.CreateProposalPage}>
      <ProposalActionModal
        onDismiss={() => setShowTransactionFormModal(false)}
        show={showTransactionFormModal}
        onActionAdd={handleAddProposalAction}
      />

      <Col lg={{ span: 8, offset: 2 }} className={classes.createProposalForm}>
        <div className={classes.wrapper}>
          <Link to={'/vote'}>
            <button
              className={clsx(
                classes.backButton,
                navBarButtonClasses.whiteInfo,
              )}
            >
              ←
            </button>
          </Link>
          <h3 className={classes.heading}>
            <Trans>Create Proposal</Trans>
          </h3>
        </div>
        <Alert variant="secondary" className={classes.voterIneligibleAlert}>
          <b>
            <Trans>Tip</Trans>
          </b>
          :{' '}
          <Trans>
            Add one or more proposal actions and describe your proposal for the
            community. The proposal cannot be modified after submission, so
            please verify all information before submitting. The voting period
            will begin after 2 days and last for 5 days.
          </Trans>
          <br />
          <br />
          <Trans>
            You <b>MUST</b> maintain enough voting power to meet the proposal
            threshold until your proposal is executed. If you fail to do so,
            anyone can cancel your proposal.
          </Trans>
        </Alert>
        <div className="d-grid">
          <Button
            className={classes.proposalActionButton}
            variant="dark"
            onClick={() => setShowTransactionFormModal(true)}
            disabled={!hasEnoughVote}
          >
            <Trans>Add Action</Trans>
          </Button>
        </div>
        <ProposalTransactions
          proposalTransactions={proposalTransactionsRef.current}
          onRemoveProposalTransaction={handleRemoveProposalAction}
        />

        {totalUSDCPayment > 0 && (
          <Alert variant="secondary" className={classes.tokenBuyerNotif}>
            <b>
              <Trans>Note</Trans>
            </b>
            :{' '}
            <Trans>
              Because this proposal contains a USDC fund transfer action
              we&apos;ve added an additional ETH transaction to refill the
              TokenBuyer contract. This action allows to DAO to continue to
              trustlessly acquire USDC to fund proposals like this.
            </Trans>
          </Alert>
        )}
        <ProposalEditor
          title={titleValue}
          body={bodyValue}
          onTitleInput={handleTitleInput}
          onBodyInput={handleBodyInput}
        />
        <CreateProposalButton
          className={classes.createProposalButton}
          isLoading={isProposePending}
          proposalThreshold={proposalThreshold}
          hasActiveOrPendingProposal={hasActiveOrPendingProposal}
          hasEnoughVote={hasEnoughVote}
          isFormInvalid={isFormInvalid}
          handleCreateProposal={handleCreateProposal}
        />
      </Col>
    </Section>
  )
}

export default withStepProgress(CreateProposalPage)
