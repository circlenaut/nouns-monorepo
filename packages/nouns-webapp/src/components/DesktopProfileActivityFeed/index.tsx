import React, { useMemo } from 'react'
import { Collapse, Table } from 'react-bootstrap'

import BrandSpinner from '@/components/BrandSpinner'
import DesktopDelegationEvent from '@/components/profileEvent/event/DesktopDelegationEvent'
import DesktopNounWinEvent from '@/components/profileEvent/event/DesktopNounWinEvent'
import DesktopProposalVoteEvent from '@/components/profileEvent/event/DesktopProposalVoteEvent'
import DesktopTransferEvent from '@/components/profileEvent/event/DesktopTransferEvent'
import {
  DelegationEvent,
  NounEventType,
  NounProfileEvent,
  NounWinEvent,
  ProposalVoteEvent,
  TransferEvent,
} from '@/wrappers/nounActivity'

import classes from './DesktopProfileActivityFeed.module.css'

interface DesktopProfileActivityFeedProps {
  events: NounProfileEvent[]
  aboveFoldEventCount: number
  isExpanded: boolean
}

const getComponentFromEvent = (event: NounProfileEvent, key: number) => {
  if (event.eventType === NounEventType.PROPOSAL_VOTE) {
    return (
      <DesktopProposalVoteEvent
        event={event.payload as ProposalVoteEvent}
        key={key}
      />
    )
  }

  if (event.eventType === NounEventType.DELEGATION) {
    return (
      <DesktopDelegationEvent
        event={event.payload as DelegationEvent}
        key={key}
      />
    )
  }

  if (event.eventType === NounEventType.TRANSFER) {
    return (
      <DesktopTransferEvent event={event.payload as TransferEvent} key={key} />
    )
  }

  if (event.eventType === NounEventType.AUCTION_WIN) {
    return (
      <DesktopNounWinEvent event={event.payload as NounWinEvent} key={key} />
    )
  }
  return null
}

const DesktopProfileActivityFeed: React.FC<DesktopProfileActivityFeedProps> = (
  props,
) => {
  const { events, aboveFoldEventCount, isExpanded } = props

  const initialEvents = useMemo(
    () => (
      <Table responsive hover className={classes.aboveTheFoldEventsTable}>
        <tbody className={classes.nounInfoPadding}>
          {events?.length ? (
            events
              .slice(0, aboveFoldEventCount)
              .map((event: NounProfileEvent, i: number) => {
                return getComponentFromEvent(event, i)
              })
          ) : (
            <BrandSpinner />
          )}
        </tbody>
      </Table>
    ),
    [events, aboveFoldEventCount],
  )

  const remainingEvents = useMemo(
    () => (
      <Table responsive hover>
        <tbody className={classes.nounInfoPadding}>
          {events?.length ? (
            events
              .slice(aboveFoldEventCount, events.length)
              .map((event: NounProfileEvent, i: number) => {
                return getComponentFromEvent(event, i)
              })
          ) : (
            <BrandSpinner />
          )}
        </tbody>
      </Table>
    ),
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

export default DesktopProfileActivityFeed
