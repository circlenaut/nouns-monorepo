import { PartialProposal, ProposalState } from '@/wrappers/nounsDao'

export const proposalData = {
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
