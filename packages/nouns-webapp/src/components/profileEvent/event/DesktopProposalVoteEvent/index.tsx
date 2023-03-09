import { t } from '@lingui/macro'
import React from 'react'
import { Image } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { getProposalVoteIcon } from '@/utils/nounActivity/getProposalVoteIcon'
import { ProposalVoteEvent } from '@/wrappers/nounActivity'
import DesktopNounActivityRow from '../../activityRow/DesktopNounActivityRow'
import ProposalVoteHeadline from '../../eventData/ProposalVoteHeadline'
import ProposalVoteInfoPillsContainer from '../../eventData/ProposalVoteInfoPillsContainer'

import classes from './DesktopProposalVoteEvent.module.css'

interface DesktopProposalVoteEventProps {
  event: ProposalVoteEvent
}

const DesktopProposalVoteEvent: React.FC<DesktopProposalVoteEventProps> = (
  props,
) => {
  const { event } = props
  const navigate = useNavigate()
  const proposalOnClickHandler = () =>
    void navigate(event.proposal.id ? `/vote/${event.proposal.id}` : '/vote')

  return (
    <DesktopNounActivityRow
      icon={
        <Image
          src={getProposalVoteIcon(event.proposal, event.vote.supportDetailed)}
          className={classes.voteIcon}
        />
      }
      primaryContent={
        <>
          <ReactTooltip
            id={'view-prop-tooltip'}
            className={classes.delegateHover}
            content={t`View on Etherscan`}
            place={'top'}
          />
          <ProposalVoteHeadline
            proposal={event.proposal}
            voter={event.vote.voter}
            supportDetailed={event.vote.supportDetailed}
          />{' '}
          <span
            data-tip={`View Proposal`}
            data-for="view-prop-tooltip"
            onClick={proposalOnClickHandler}
            onKeyDown={proposalOnClickHandler}
            role="button"
            tabIndex={0}
            className={classes.proposalTitle}
          >
            {event.proposal.title}
          </span>
        </>
      }
      secondaryContent={
        <ProposalVoteInfoPillsContainer proposal={event.proposal} />
      }
    />
  )
}

export default DesktopProposalVoteEvent
