import { Trans } from '@lingui/macro'
import { BigNumber } from 'ethers'
import React, { useCallback, useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import AuctionActivityDateHeadline from '@/components/AuctionActivityDateHeadline'
import AuctionActivityNounTitle from '@/components/AuctionActivityNounTitle'
import AuctionActivityWrapper from '@/components/AuctionActivityWrapper'
import AuctionNavigation from '@/components/AuctionNavigation'
import AuctionTitleAndNavWrapper from '@/components/AuctionTitleAndNavWrapper'
import CurrentBid, { BID_N_A } from '@/components/CurrentBid'
import Winner from '@/components/Winner'
import { useAppSelector } from '@/hooks'

// tslint:disable:ordered-imports
import nounContentClasses from './NounderNounContent.module.css'
import auctionBidClasses from '../AuctionActivity/BidHistory.module.css'
import bidBtnClasses from '../BidHistoryBtn/BidHistoryBtn.module.css'
import auctionActivityClasses from '../AuctionActivity/AuctionActivity.module.css'

const NounderNounContent: React.FC<{
  mintTimestamp: BigNumber
  nounId: BigNumber
  isFirstAuction: boolean
  isLastAuction: boolean
  onPrevAuctionClick: () => void
  onNextAuctionClick: () => void
}> = (props) => {
  const {
    mintTimestamp,
    nounId,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
  } = props

  const isCool = useAppSelector((state) => state.application.isCoolBackground)

  // Page through Nouns via keyboard
  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrevAuctionClick()
      }
      if (event.key === 'ArrowRight') {
        onNextAuctionClick()
      }
    },
    [onNextAuctionClick, onPrevAuctionClick],
  )

  useEffect(() => {
    // attach the event listener
    document.addEventListener(
      'keydown',
      handleKeyPress,
      // { passive: false }
    )

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <AuctionActivityWrapper>
      <div className={auctionActivityClasses.informationRow}>
        <Row className={auctionActivityClasses.activityRow}>
          <AuctionTitleAndNavWrapper>
            <AuctionNavigation
              isFirstAuction={isFirstAuction}
              isLastAuction={isLastAuction}
              onNextAuctionClick={onNextAuctionClick}
              onPrevAuctionClick={onPrevAuctionClick}
            />
            <AuctionActivityDateHeadline startTime={mintTimestamp} />
          </AuctionTitleAndNavWrapper>
          <Col lg={12}>
            <AuctionActivityNounTitle nounId={nounId} />
          </Col>
        </Row>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={4} className={auctionActivityClasses.currentBidCol}>
            <CurrentBid currentBid={BID_N_A} auctionEnded={true} />
          </Col>
          <Col
            lg={5}
            className={`${auctionActivityClasses.currentBidCol} ${nounContentClasses.currentBidCol} ${auctionActivityClasses.auctionTimerCol}`}
          >
            <div className={auctionActivityClasses.section}>
              <Winner winner={''} isNounders={true} />
            </div>
          </Col>
        </Row>
      </div>
      <Row className={auctionActivityClasses.activityRow}>
        <Col lg={12}>
          <ul className={auctionBidClasses.bidCollection}>
            <li
              className={
                (isCool
                  ? `${auctionBidClasses.bidRowCool}`
                  : `${auctionBidClasses.bidRowWarm}`) +
                ` ${nounContentClasses.bidRow}`
              }
            >
              <Trans>All Noun auction proceeds are sent to the</Trans>{' '}
              <Link to="/vote" className={nounContentClasses.link}>
                <Trans>Nouns DAO</Trans>
              </Link>
              .{' '}
              <Trans>
                For this reason, we, the project&apos;s founders (‘Nounders’)
                have chosen to compensate ourselves with Nouns. Every 10th Noun
                for the first 5 years of the project will be sent to our
                multisig (5/10), where it will be vested and distributed to
                individual Nounders.
              </Trans>
            </li>
          </ul>
          <div
            className={
              isCool
                ? bidBtnClasses.bidHistoryWrapperCool
                : bidBtnClasses.bidHistoryWrapperWarm
            }
          >
            <Link
              to="/nounders"
              className={
                isCool
                  ? bidBtnClasses.bidHistoryCool
                  : bidBtnClasses.bidHistoryWarm
              }
            >
              <Trans>Learn more</Trans> →
            </Link>
          </div>
        </Col>
      </Row>
    </AuctionActivityWrapper>
  )
}
export default NounderNounContent
