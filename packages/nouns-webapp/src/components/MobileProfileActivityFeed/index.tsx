import React, { useMemo } from 'react'
import { Collapse } from 'react-bootstrap'

import {
  DelegationEvent,
  NounEventType,
  NounProfileEvent,
  NounWinEvent,
  ProposalVoteEvent,
  TransferEvent,
} from '@/wrappers/nounActivity'
import MobileDelegationEvent from '../profileEvent/event/MobileDelegationEvent'
import MobileNounWinEvent from '../profileEvent/event/MobileNounWinEvent'
import MobileProposalVoteEvent from '../profileEvent/event/MobileProposalVoteEvent'
import MobileTransferEvent from '../profileEvent/event/MobileTransferEvent'

interface MobileProfileActivityFeedProps {
  events: NounProfileEvent[]
  aboveFoldEventCount: number
  isExpanded: boolean
}

const getComponentFromEvent = (event: NounProfileEvent, key: number) => {
  if (event.eventType === NounEventType.PROPOSAL_VOTE) {
    return (
      <MobileProposalVoteEvent
        event={event.payload as ProposalVoteEvent}
        key={key}
      />
    )
  }

  if (event.eventType === NounEventType.DELEGATION) {
    return (
      <MobileDelegationEvent
        event={event.payload as DelegationEvent}
        key={key}
      />
    )
  }

  if (event.eventType === NounEventType.TRANSFER) {
    return (
      <MobileTransferEvent event={event.payload as TransferEvent} key={key} />
    )
  }

  if (event.eventType === NounEventType.AUCTION_WIN) {
    return (
      <MobileNounWinEvent event={event.payload as NounWinEvent} key={key} />
    )
  }
  return null
}

const MobileProfileActivityFeed: React.FC<MobileProfileActivityFeedProps> = (
  props,
) => {
  const { events, aboveFoldEventCount, isExpanded } = props

  const initialEvents = useMemo(
    () =>
      events
        .slice(0)
        .slice(0, aboveFoldEventCount)
        .map((event: NounProfileEvent, i: number) => {
          return getComponentFromEvent(event, i)
        }),
    [events, aboveFoldEventCount],
  )

  const remainingEvents = useMemo(
    () =>
      events
        .slice(0)
        .slice(aboveFoldEventCount, events.length)
        .map((event: NounProfileEvent, i: number) => {
          return getComponentFromEvent(event, i)
        }),
    [events, aboveFoldEventCount],
  )

  return (
    <div>
      {initialEvents}
      <Collapse in={isExpanded}>
        <div>{remainingEvents}</div>
      </Collapse>
    </div>
  )
}

export default MobileProfileActivityFeed
