import { t, Trans } from '@lingui/macro'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ShortAddress from '@/components/ShortAddress'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { Proposal, ProposalState, Vote } from '@/wrappers/nounsDao'

import classes from './ProposalVoteHeadline.module.css'

interface ProposalVoteHeadlineProps {
  proposal: Proposal
  supportDetailed: Vote | undefined
  voter: string | undefined
}

const ProposalVoteHeadline: React.FC<ProposalVoteHeadlineProps> = (props) => {
  const { proposal, supportDetailed, voter } = props

  if (supportDetailed === undefined) {
    if (
      proposal.status === ProposalState.PENDING ||
      proposal.status === ProposalState.ACTIVE
    ) {
      return <Trans>Waiting for</Trans>
    }
    return <Trans>Absent for</Trans>
  }

  const voterComponent = (
    <>
      <ReactTooltip
        id={'view-on-etherscan-tooltip'}
        place={'top'}
        className={classes.delegateHover}
        content={t`View on Etherscan`}
      />
      <span
        className={classes.voterLink}
        data-tip={`View on Etherscan`}
        data-for="view-on-etherscan-tooltip"
        onClick={(e) => {
          // This is so that we don't navigate to the prop page on click the address
          e.stopPropagation()
          window.open(buildEtherscanAddressLink(voter ?? ''), '_blank')
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation()
            window.open(buildEtherscanAddressLink(voter ?? ''), '_blank')
          }
        }}
        role="button"
        tabIndex={0}
      >
        <ShortAddress address={voter ?? ''} />
      </span>
    </>
  )

  switch (supportDetailed) {
    case Vote.FOR:
      return <Trans>{voterComponent} voted for</Trans>
    case Vote.ABSTAIN:
      return <Trans>{voterComponent} abstained on</Trans>
    default:
      return <Trans>{voterComponent} voted against</Trans>
  }
}

export default ProposalVoteHeadline
