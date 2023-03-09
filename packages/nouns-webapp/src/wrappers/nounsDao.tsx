import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useQueryClient } from '@tanstack/react-query'
import {
  Call,
  ChainId,
  useBlockNumber,
  useContractFunction,
  useEthers,
} from '@usedapp/core'
import { connectContractToSigner } from '@usedapp/core/dist/cjs/src/hooks'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import {
  BigNumber as EthersBN,
  BigNumberish,
  Contract,
  Overrides,
  utils,
} from 'ethers'
import { defaultAbiCoder, Result } from 'ethers/lib/utils'
import { print } from 'graphql/language/printer'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { NounsDAOV2ABI, type NounsDAOLogicV2 } from '@nouns/sdk'

import { CHAIN_ID, ContractAddresses } from '@/configs'
import { useAppSelector } from '@/hooks'
import { useBlockTimestamp } from '@/hooks/useBlockTimestamp'
import { useConfig } from '@/hooks/useConfig'
import { useLogs } from '@/hooks/useLogs'
import { useCachedCall, useCachedCalls } from './contracts'
import { partialProposalsQuery, proposalQuery, useQuery } from './subgraph'

export interface DynamicQuorumParams {
  minQuorumVotesBPS: number
  maxQuorumVotesBPS: number
  quorumCoefficient: number
}

export enum Vote {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2,
}

export enum ProposalState {
  UNDETERMINED = -1,
  PENDING,
  ACTIVE,
  CANCELLED,
  DEFEATED,
  SUCCEEDED,
  QUEUED,
  EXPIRED,
  EXECUTED,
  VETOED,
}

interface ProposalCallResult {
  id: EthersBN
  abstainVotes: EthersBN
  againstVotes: EthersBN
  forVotes: EthersBN
  canceled: boolean
  vetoed: boolean
  executed: boolean
  startBlock: EthersBN
  endBlock: EthersBN
  eta: EthersBN
  proposalThreshold: EthersBN
  proposer: string
  quorumVotes: EthersBN
}

interface ProposalDetail {
  target: string
  value?: string
  functionSig: string
  callData: string
}

interface RefundableVote {
  proposalId: BigNumberish
  support: BigNumberish
  overrides?:
    | (Overrides & {
        from?: string | Promise<string> | undefined
      })
    | undefined
}

interface RefundableVoteWithReason extends RefundableVote {
  reason: string
}

export interface PartialProposal {
  id: string | undefined
  title: string
  status: ProposalState
  forCount: number
  againstCount: number
  abstainCount: number
  startBlock: number
  endBlock: number
  eta: Date | undefined
  quorumVotes: number
}

export interface Proposal extends PartialProposal {
  description: string
  createdBlock: number
  proposer: string | undefined
  proposalThreshold: number
  details: ProposalDetail[]
  transactionHash: string
}

interface ProposalTransactionDetails {
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
}

export interface PartialProposalSubgraphEntity {
  id: string
  title: string
  status: keyof typeof ProposalState
  forVotes: string
  againstVotes: string
  abstainVotes: string
  startBlock: string
  endBlock: string
  executionETA: string | null
  quorumVotes: string
}

export interface ProposalSubgraphEntity
  extends ProposalTransactionDetails,
    PartialProposalSubgraphEntity {
  description: string
  createdBlock: string
  createdTransactionHash: string
  proposer: { id: string }
  proposalThreshold: string
}

export interface PartialProposalData {
  data: PartialProposal[]
  error?: Error
  loading: boolean
}

export interface ProposalTransaction {
  address: string
  value: string
  signature: string
  calldata: string
  decodedCalldata?: string
  usdcValue?: number
}

const abi = NounsDAOV2ABI && new utils.Interface(NounsDAOV2ABI)

const hashRegex = /^\s*#{1,6}\s+([^\n]+)/
const equalTitleRegex = /^\s*([^\n]+)\n(={3,25}|-{3,25})/

/**
 * Extract a markdown title from a proposal body that uses the `# Title` format
 * Returns null if no title found.
 */
const extractHashTitle = (body: string) => body.match(hashRegex)
/**
 * Extract a markdown title from a proposal body that uses the `Title\n===` format.
 * Returns null if no title found.
 */
const extractEqualTitle = (body: string) => body.match(equalTitleRegex)

/**
 * Extract title from a proposal's body/description. Returns null if no title found in the first line.
 * @param body proposal body
 */
const extractTitle = (body: string | undefined): string | null => {
  if (!body) return null
  const hashResult = extractHashTitle(body)
  const equalResult = extractEqualTitle(body)
  return (hashResult?.[1] || equalResult?.[1]) ?? null
}

const removeBold = (text: string | null): string | null =>
  text ? text.replace(/\*\*/g, '') : text
const removeItalics = (text: string | null): string | null =>
  text ? text.replace(/__/g, '') : text

const removeMarkdownStyle = R.compose(removeBold, removeItalics)

const proposalCreatedFilter = (
  addresses: ContractAddresses,
  activeFromBlock: number,
) => {
  if (!addresses || !addresses.nounsDAOProxy || !activeFromBlock) {
    return null
  }

  const nounsDaoContract = new Contract(
    addresses.nounsDAOProxy,
    abi,
  ) as NounsDAOLogicV2
  return useMemo(
    () =>
      nounsDaoContract && {
        ...nounsDaoContract.filters?.ProposalCreated(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ),
        activeFromBlock,
      },
    [addresses, activeFromBlock],
  )
}

export const useCurrentQuorum = (
  nounsDao: string,
  proposalId: number,
  skip = false,
): number | undefined => {
  const { library } = useEthers()
  const contract = new Contract(nounsDao, abi, library) as NounsDAOLogicV2

  // console.debug(`Calling function 'quorumVotes' on contract ${contract.address}`);
  const { value: quorum, error } =
    useCachedCall(
      contract &&
        !skip && {
          contract: contract,
          method: 'quorumVotes',
          args: [proposalId],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }

  return quorum && EthersBN.from(quorum[0]).toNumber()
}

export const useDynamicQuorumProps = (
  nounsDao: string,
  block: number,
): DynamicQuorumParams | undefined => {
  const { library } = useEthers()
  const contract = new Contract(nounsDao, abi, library) as NounsDAOLogicV2

  // console.debug(`Calling function 'getDynamicQuorumParamsAt' on contract ${contract.address}`);
  const { value: params, error } =
    useCachedCall(
      contract &&
        block && {
          contract: contract,
          method: 'getDynamicQuorumParamsAt',
          args: [block],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return params && params[0]
}

export const useHasVotedOnProposal = (
  addresses: ContractAddresses,
  proposalId: string | undefined,
): boolean | undefined => {
  const { library } = useEthers()
  const { activeAccount } = useAppSelector((state) => state.account)

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    library,
  ) as NounsDAOLogicV2

  // Fetch a voting receipt for the passed proposal id
  // console.debug(`Calling function 'getReceipt' on contract ${contract.address}`);
  const { value: receipt, error } =
    useCachedCall(
      contract &&
        activeAccount &&
        proposalId && {
          contract: contract,
          method: 'getReceipt',
          args: [proposalId, activeAccount],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return receipt ? receipt[0]?.hasVoted : false
}

export const useProposalVote = (
  addresses: ContractAddresses,
  proposalId: string | undefined,
): string | undefined => {
  const { account, library } = useEthers()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    library,
  ) as NounsDAOLogicV2

  // Fetch a voting receipt for the passed proposal id
  // console.debug(`Calling function 'getReceipt' on contract ${contract.address}`);
  const { value: receipt, error } =
    useCachedCall(
      contract &&
        account &&
        proposalId && {
          contract: contract,
          method: 'getReceipt',
          args: [proposalId, account],
        },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  const voteStatus = receipt ? receipt[0]?.support : -1
  if (voteStatus === 0) {
    return 'Against'
  }
  if (voteStatus === 1) {
    return 'For'
  }
  if (voteStatus === 2) {
    return 'Abstain'
  }
}

export const useProposalCount = (
  addresses: ContractAddresses,
): number | undefined => {
  const { library } = useEthers()
  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    library,
  ) as NounsDAOLogicV2

  // console.debug(`Calling function 'proposalCount' on contract ${contract.address}`);
  const { value: count, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'proposalCount',
        args: [],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return count && EthersBN.from(count[0]).toNumber()
}

export const useProposalThreshold = (
  addresses: ContractAddresses,
): number | undefined => {
  const { library } = useEthers()
  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    library,
  ) as NounsDAOLogicV2

  // console.debug(`Calling function 'proposalThreshold' on contract ${contract.address}`);
  const { value: count, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'proposalThreshold',
        args: [],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return count && EthersBN.from(count[0]).toNumber()
}

const countToIndices = (count?: number) =>
  count && Number.isInteger(count) && count > 0
    ? new Array(count).fill(0).map((_, i) => [i + 1])
    : []

const formatProposalTransactionDetails = (
  details: ProposalTransactionDetails | Result,
) => {
  return details.targets.map((target: string, i: number) => {
    const signature: string = details.signatures[i]
    const value = EthersBN.from(
      // Handle both logs and subgraph responses
      (details as ProposalTransactionDetails).values?.[i] ??
        (details as Result)?.[3]?.[i] ??
        0,
    )
    // Split at first occurrence of '('
    const [name, types] = signature
      .substring(0, signature.length - 1)
      ?.split(/\((.*)/s)
    if (!name || !types) {
      return {
        target,
        functionSig:
          name === '' ? 'transfer' : name === undefined ? 'unknown' : name,
        callData: types
          ? types
          : value
          ? `${utils.formatEther(value)} ETH`
          : '',
      }
    }
    const calldata = details.calldatas[i]
    // Split using comma as separator, unless comma is between parentheses (tuple).
    const decoded = defaultAbiCoder.decode(
      types.split(/,(?![^(]*\))/g),
      calldata,
    )
    return {
      target,
      functionSig: name,
      callData: decoded.join(),
      value: value.gt(0) ? `{ value: ${utils.formatEther(value)} ETH }` : '',
    }
  })
}

const useFormattedProposalCreatedLogs = (
  addresses: ContractAddresses,
  skip: boolean,
  fromBlock?: number,
) => {
  const activeFromBlock =
    fromBlock ?? CHAIN_ID === ChainId.Mainnet ? 12985453 : 0

  const filter = useMemo(
    () => ({
      ...proposalCreatedFilter(addresses, activeFromBlock),
      ...(activeFromBlock ? { activeFromBlock } : {}),
    }),
    [proposalCreatedFilter, activeFromBlock],
  )
  const useLogsResult = useLogs(!skip ? filter : undefined)

  return useMemo(() => {
    const logs = useLogsResult?.logs
    if (!logs) return []

    return logs.map((log) => {
      const { args: parsed } = abi?.parseLog(log)
      return {
        description: parsed.description,
        transactionHash: log.transactionHash,
        details: formatProposalTransactionDetails(parsed),
      }
    })
  }, [useLogsResult])
}

const getProposalState = (
  blockNumber: number | undefined,
  blockTimestamp: Date | undefined,
  proposal: PartialProposalSubgraphEntity,
) => {
  const status = ProposalState[proposal.status]
  if (status === ProposalState.PENDING) {
    if (!blockNumber) {
      return ProposalState.UNDETERMINED
    }
    if (blockNumber <= parseInt(proposal.startBlock)) {
      return ProposalState.PENDING
    }
    return ProposalState.ACTIVE
  }
  if (status === ProposalState.ACTIVE) {
    if (!blockNumber) {
      return ProposalState.UNDETERMINED
    }
    if (blockNumber > parseInt(proposal.endBlock)) {
      const forVotes = new BigNumber(proposal.forVotes)
      if (
        forVotes.lte(proposal.againstVotes) ||
        forVotes.lt(proposal.quorumVotes)
      ) {
        return ProposalState.DEFEATED
      }
      if (!proposal.executionETA) {
        return ProposalState.SUCCEEDED
      }
    }
    return status
  }
  if (status === ProposalState.QUEUED) {
    if (!blockTimestamp || !proposal.executionETA) {
      return ProposalState.UNDETERMINED
    }
    const GRACE_PERIOD = 14 * 60 * 60 * 24
    if (
      blockTimestamp.getTime() / 1_000 >=
      parseInt(proposal.executionETA) + GRACE_PERIOD
    ) {
      return ProposalState.EXPIRED
    }
    return status
  }
  return status
}

const parsePartialSubgraphProposal = (
  proposal: PartialProposalSubgraphEntity | undefined,
  blockNumber: number | undefined,
  timestamp: number | undefined,
) => {
  if (!proposal) {
    return
  }

  return {
    id: proposal.id,
    title: proposal.title ?? 'Untitled',
    status: getProposalState(
      blockNumber,
      new Date((timestamp ?? 0) * 1000),
      proposal,
    ),
    startBlock: parseInt(proposal.startBlock),
    endBlock: parseInt(proposal.endBlock),
    forCount: parseInt(proposal.forVotes),
    againstCount: parseInt(proposal.againstVotes),
    abstainCount: parseInt(proposal.abstainVotes),
    quorumVotes: parseInt(proposal.quorumVotes),
    eta: proposal.executionETA
      ? new Date(Number(proposal.executionETA) * 1000)
      : undefined,
  }
}

const parseSubgraphProposal = (
  proposal: ProposalSubgraphEntity | undefined,
  blockNumber: number | undefined,
  timestamp: number | undefined,
) => {
  if (!proposal) {
    return
  }

  const description = proposal.description
    ?.replace(/\\n/g, '\n')
    .replace(/(^['"]|['"]$)/g, '')
  return {
    id: proposal.id,
    title: R.pipe(extractTitle, removeMarkdownStyle)(description) ?? 'Untitled',
    description: description ?? 'No description.',
    proposer: proposal.proposer?.id,
    status: getProposalState(
      blockNumber,
      new Date((timestamp ?? 0) * 1000),
      proposal,
    ),
    proposalThreshold: parseInt(proposal.proposalThreshold),
    quorumVotes: parseInt(proposal.quorumVotes),
    forCount: parseInt(proposal.forVotes),
    againstCount: parseInt(proposal.againstVotes),
    abstainCount: parseInt(proposal.abstainVotes),
    createdBlock: parseInt(proposal.createdBlock),
    startBlock: parseInt(proposal.startBlock),
    endBlock: parseInt(proposal.endBlock),
    eta: proposal.executionETA
      ? new Date(Number(proposal.executionETA) * 1000)
      : undefined,
    details: formatProposalTransactionDetails(proposal),
    transactionHash: proposal.createdTransactionHash,
  }
}

export const useAllProposalsViaSubgraph = (): PartialProposalData => {
  const blockNumber = useBlockNumber()
  const timestamp = useBlockTimestamp(blockNumber)

  const { app } = useConfig()
  const queryClient = useQueryClient()

  const [proposals, setProposals] = useState<Proposal[]>([])

  const fetchProposal = useCallback(async () => {
    const query = print(partialProposalsQuery())
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [])

  useEffect(
    () =>
      void queryClient.prefetchQuery({
        queryKey: [partialProposalsQuery()],
        queryFn: fetchProposal,
      }),
    [queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [partialProposalsQuery()],
    queryFn: fetchProposal,
  })

  useEffect(() => {
    if (data?.proposals && blockNumber && timestamp) {
      const result = data?.proposals?.map((proposal: ProposalSubgraphEntity) =>
        parsePartialSubgraphProposal(proposal, blockNumber, timestamp),
      ) as Proposal[]
      setProposals(result)
    }
    return () => {
      setProposals([])
    }
  }, [data, blockNumber, timestamp])

  return {
    loading,
    error,
    data: proposals,
  }
}

const testProposalData = {
  data: [
    {
      id: '1',
      title: 'title',
      status: ProposalState.ACTIVE,
      forCount: 20,
      againstCount: 10,
      abstainCount: 5,
      startBlock: 0,
      endBlock: 10000000,
      quorumVotes: 20,
    } as PartialProposal,
  ],
  loading: true,
}

export const useAllProposalsViaChain = (
  addresses: ContractAddresses,
  skip = false,
  ignoreLogs = false,
): PartialProposalData | undefined => {
  const proposalCountCall = useProposalCount(addresses)
  const proposalCount = useMemo(() => proposalCountCall, [proposalCountCall])

  const { library } = useEthers()
  const contract = new Contract(addresses.nounsDAOProxy, abi, library)

  const requests = (method: string) => {
    const govProposalIndexes = countToIndices(proposalCount)
    // if (skip) return [false]
    return govProposalIndexes.map(
      (index) =>
        contract && {
          contract: contract,
          method,
          args: [index],
        },
    )
    // return govProposalIndexes.map(
    //   (index) =>
    //     contract && {
    //       contract: contract,
    //       method,
    //       args: [index],
    //     },
    // )
  }
  // return testProposalData

  const proposalCalls = requests('proposals').map((request) =>
    typeof request === 'object' ? request : false,
  )

  const proposals: ProposalCallResult[] | undefined = useCachedCalls(
    proposalCalls,
  ).map((result) => result?.value?.[0])

  // const proposals: ProposalCallResult[] | undefined = useCachedCalls(
  //   const proposals = useCachedCalls(
  //   requests('proposals')
  //   // .map((request) =>
  //   //   typeof request === 'object' ? request : false,
  //   // ),
  // )
  // // .map((result) => result?.value?.[0])

  // return testProposalData

  const proposalStates: ProposalState[] = useCachedCalls(
    requests('state').map((request) =>
      typeof request === 'object' ? request : false,
    ),
  ).map((result) => result?.value?.[0])

  const formattedLogs = useFormattedProposalCreatedLogs(addresses, skip, 0)

  // Early return until events are fetched
  return useMemo(() => {
    if (extractTitle === undefined) return { data: [], loading: true }

    const logs = formattedLogs ?? []
    if (!ignoreLogs && proposals.length && !logs.length) {
      return { data: [], loading: true }
    }

    return {
      data: proposals.map((p, i) => {
        const proposal: ProposalCallResult | undefined = p
        const description: string = logs[i]?.description?.replace(/\\n/g, '\n')
        return {
          id: proposal?.id.toString(),
          title:
            R.pipe(extractTitle, removeMarkdownStyle)(description) ??
            'Untitled',
          status: proposalStates[i] ?? ProposalState.UNDETERMINED,

          startBlock: parseInt(proposal?.startBlock?.toString() ?? ''),
          endBlock: parseInt(proposal?.endBlock?.toString() ?? ''),
          forCount: parseInt(proposal?.forVotes?.toString() ?? '0'),
          againstCount: parseInt(proposal?.againstVotes?.toString() ?? '0'),
          abstainCount: parseInt(proposal?.abstainVotes?.toString() ?? '0'),
          quorumVotes: parseInt(proposal?.quorumVotes?.toString() ?? '0'),
          eta: proposal?.eta
            ? new Date(proposal?.eta?.toNumber() * 1000)
            : undefined,
        }
      }),
      loading: false,
    }
  }, [formattedLogs, proposalStates, proposals])
}

export const useAllProposals = (
  addresses: ContractAddresses,
): PartialProposalData | undefined => {
  try {
    const subgraph = useAllProposalsViaSubgraph()
    const onchain = useAllProposalsViaChain(addresses, !subgraph.error)
    // const onchain = useAllProposalsViaChain(addresses, false)
    // return onchain
    return subgraph?.error && onchain ? onchain : subgraph
  } catch (error) {
    error instanceof Error ? error.message : `Unknown Error: ${error}`
  }
}

// This may be slightly more performant in terms of memory usage because it avoids creating a new variable for subgraph and onchain
// export const useAllProposals = (addresses: ContractAddresses): PartialProposalData =>
//   (subgraph =>
//     (subgraph?.error && useAllProposalsViaChain(addresses, true)) || subgraph
//   )(useAllProposalsViaSubgraph());

export const useProposal = (
  id?: string | number,
  forceFetch?: boolean,
): Proposal | undefined => {
  // console.error('================')

  const blockNumber = useBlockNumber()
  const timestamp = useBlockTimestamp(blockNumber)

  const propId = id ? parseInt(id.toString()) : null

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const [proposal, setProposal] = useState<Proposal | undefined>()

  const fetchProposal = useCallback(async () => {
    if (!propId) return

    const query = print(proposalQuery(propId))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [propId])

  useEffect(
    () =>
      void (!!propId && propId >= 0
        ? queryClient.prefetchQuery({
            queryKey: [proposalQuery(propId)],
            queryFn: fetchProposal,
          })
        : undefined),
    [propId, queryClient, forceFetch],
  )

  const { data } = useQuery({
    queryKey: [proposalQuery(propId ?? 0)],
    queryFn: fetchProposal,
  })

  useEffect(() => {
    if (data?.proposal && blockNumber && timestamp) {
      const result = parseSubgraphProposal(
        data.proposal,
        blockNumber,
        timestamp,
      ) as Proposal
      setProposal(result)
    }

    return () => {
      setProposal(undefined)
    }
  }, [data, blockNumber, timestamp])

  // console.error('useProposal status',propId, proposal?.id, proposal?.status)
  // console.error('================')
  return proposal
}

export const useCastVote = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()
  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2
  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'castVote' on signed contract ${signedContract.address}`);
  const { send: castVote, state: castVoteState } = useContractFunction(
    signedContract,
    'castVote',
  )
  return { castVote, castVoteState }
}

export const useCastVoteWithReason = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2

  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'castVoteWithReason' on signed contract ${signedContract.address}`);
  const { send: castVoteWithReason, state: castVoteWithReasonState } =
    useContractFunction(signedContract, 'castVoteWithReason')
  return { castVoteWithReason, castVoteWithReasonState }
}

export const useCastRefundableVote = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2

  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'castRefundableVote' on signed contract ${signedContract.address}`);
  const { send: castRefundableVote, state: castRefundableVoteState } =
    useContractFunction(signedContract, 'castRefundableVote')

  return {
    castRefundableVote: async (
      ...args: RefundableVote[]
    ): Promise<TransactionReceipt | undefined> => {
      const arg = args[0]
      if (!arg) return

      const gasLimit = await contract.estimateGas.castRefundableVote(
        arg.proposalId,
        arg.support,
      )
      return castRefundableVote(arg.proposalId, arg.support, {
        gasLimit: gasLimit.add(30_000), // A 30,000 gas pad is used to avoid 'Out of gas' errors
      })
    },
    castRefundableVoteState,
  }
}

export const useCastRefundableVoteWithReason = (
  addresses: ContractAddresses,
) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2

  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'castRefundableVoteWithReason' on signed contract ${signedContract.address}`);
  const {
    send: castRefundableVoteWithReason,
    state: castRefundableVoteWithReasonState,
  } = useContractFunction(signedContract, 'castRefundableVoteWithReason')

  return {
    castRefundableVoteWithReason: async (
      ...args: RefundableVoteWithReason[]
    ): Promise<TransactionReceipt | undefined> => {
      const arg = args[0]
      if (!arg || !contract) return

      const gasLimit = await contract.estimateGas.castRefundableVoteWithReason(
        arg.proposalId,
        arg.support,
        arg.reason,
      )
      return castRefundableVoteWithReason(
        arg.proposalId,
        arg.support,
        arg.reason,
        {
          gasLimit: gasLimit.add(30_000), // A 30,000 gas pad is used to avoid 'Out of gas' errors
        },
      )
    },
    castRefundableVoteWithReasonState,
  }
}

export const usePropose = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2

  const signer = provider?.getSigner()
  const signedContract = (
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract
  ) as NounsDAOLogicV2

  const { send: propose, state: proposeState } = useContractFunction(
    signedContract,
    'propose',
  )

  return { propose, proposeState }
}

//!?
export const useQueueProposal = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2

  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'queue' on signed contract ${signedContract.address}`);
  const { send: queueProposal, state: queueProposalState } =
    useContractFunction(signedContract, 'queue')

  //   const queueProposalState = useContractFunction(
  //     nounsDaoContract,
  //     'queue',
  //     // options: {
  //     //   onSuccess: (result) => {
  //     //     'meh'
  //     //     // onSuccess callback logic here
  //     //   },
  //     //   onError: (error) => {
  //     //     // onError callback logic here
  //     //     'meh'
  //     //   },
  //     // },
  //   );

  //   const queueProposal = async (proposalId: number) => {
  //     const tx = await nounsDaoContract.queue(proposalId);
  //     return tx;
  //   };

  return { queueProposal, queueProposalState }
}

export const useCancelProposal = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2
  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'cancel' on signed contract ${signedContract.address}`);
  const { send: cancelProposal, state: cancelProposalState } =
    useContractFunction(signedContract, 'cancel')
  return { cancelProposal, cancelProposalState }
}

export const useExecuteProposal = (addresses: ContractAddresses) => {
  const { provider } = useWeb3React()

  const contract = new Contract(
    addresses.nounsDAOProxy,
    abi,
    provider,
  ) as NounsDAOLogicV2
  const signer = provider?.getSigner()
  const signedContract =
    contract && signer
      ? connectContractToSigner(contract, undefined, signer)
      : contract

  // console.debug(`Using contract function 'execute' on signed contract ${signedContract.address}`);
  const { send: executeProposal, state: executeProposalState } =
    useContractFunction(signedContract, 'execute')
  return { executeProposal, executeProposalState }
}

export const useTotalSupplies = (
  addresses: ContractAddresses,
): (BigNumber | undefined)[] => {
  const { library: provider } = useEthers()

  const calls =
    Object.entries(addresses).map(([address]) => ({
      contract: new Contract(address, abi, provider) as NounsDAOLogicV2,
      method: 'totalSupply',
      args: [],
    })) ?? ([] as Call[])

  const requests = (calls: Call[]) => {
    return calls.map(
      (call) =>
        call.contract && {
          contract: call.contract,
          method: call.method,
          args: call.args,
        },
    )
  }
  const supplyTotals: (BigNumber | undefined)[] | undefined = useCachedCalls(
    requests(calls).map((request) =>
      typeof request === 'object' ? request : false,
    ),
  ).map((result) => result?.value?.[0])

  return supplyTotals
}
