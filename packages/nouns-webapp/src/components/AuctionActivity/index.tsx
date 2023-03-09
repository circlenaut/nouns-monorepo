import { Trans } from '@lingui/macro'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'

import AuctionActivityDateHeadline from '@/components/AuctionActivityDateHeadline'
import AuctionActivityNounTitle from '@/components/AuctionActivityNounTitle'
import AuctionActivityWrapper from '@/components/AuctionActivityWrapper'
import AuctionNavigation from '@/components/AuctionNavigation'
import AuctionTimer from '@/components/AuctionTimer'
import AuctionTitleAndNavWrapper from '@/components/AuctionTitleAndNavWrapper'
import Bid from '@/components/Bid'
import BidHistory from '@/components/BidHistory'
import BidHistoryBtn from '@/components/BidHistoryBtn'
import BidHistoryModal from '@/components/BidHistoryModal'
import CurrentBid from '@/components/CurrentBid'
import Holder from '@/components/Holder'
import NounInfoCard from '@/components/NounInfoCard'
import Winner from '@/components/Winner'
import { FOMO_NOUNS_URL } from '@/configs'
import { useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { Auction } from '@/wrappers/nounsAuction'

// tslint:disable:ordered-imports
import classes from './AuctionActivity.module.css'
import bidHistoryClasses from './BidHistory.module.css'

interface AuctionActivityProps {
  auction: Auction
  isFirstAuction: boolean
  isLastAuction: boolean
  onPrevAuctionClick: () => void
  onNextAuctionClick: () => void
  displayGraphDepComps: boolean
}

const AuctionActivity: React.FC<AuctionActivityProps> = (
  props: AuctionActivityProps,
) => {
  const {
    auction,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
    displayGraphDepComps,
  } = props

  const isCool = useAppSelector((state) => state.application.isCoolBackground)
  const { contractAddresses } = useContractAddresses()

  const [auctionEnded, setAuctionEnded] = useState(false)
  const [auctionTimer, setAuctionTimer] = useState(false)

  const [showBidHistoryModal, setShowBidHistoryModal] = useState(false)
  const showBidModalHandler = () => {
    setShowBidHistoryModal(true)
  }
  const dismissBidModalHanlder = () => {
    setShowBidHistoryModal(false)
  }

  // timer logic - check auction status every 30 seconds, until five minutes remain, then check status every second
  useEffect(() => {
    if (!auction) return

    const timeLeft = Number(auction.endTime) - Math.floor(Date.now() / 1000)

    if (auction && timeLeft <= 0) {
      setAuctionEnded(true)
      return
    } else {
      setAuctionEnded(false)
      const timer = setTimeout(
        () => {
          setAuctionTimer(!auctionTimer)
        },
        timeLeft > 300 ? 30000 : 1000,
      )

      return () => {
        clearTimeout(timer)
      }
    }
  }, [auctionTimer, auction])

  if (!auction) return null

  const openEtherscanBidHistory = () => {
    if (!contractAddresses) return
    const url = buildEtherscanAddressLink(
      contractAddresses.nounsAuctionHouseProxy,
    )
    window.open(url)
  }

  return (
    <>
      {showBidHistoryModal && (
        <BidHistoryModal onDismiss={dismissBidModalHanlder} auction={auction} />
      )}

      <AuctionActivityWrapper>
        <div className={classes.informationRow}>
          <Row className={classes.activityRow}>
            <AuctionTitleAndNavWrapper>
              {displayGraphDepComps && (
                <AuctionNavigation
                  isFirstAuction={isFirstAuction}
                  isLastAuction={isLastAuction}
                  onNextAuctionClick={onNextAuctionClick}
                  onPrevAuctionClick={onPrevAuctionClick}
                />
              )}
              <AuctionActivityDateHeadline startTime={auction.startTime} />
            </AuctionTitleAndNavWrapper>
            <Col lg={12}>
              <AuctionActivityNounTitle
                isCool={isCool}
                nounId={auction.nounId}
              />
            </Col>
          </Row>
          <Row className={classes.activityRow}>
            <Col lg={4} className={classes.currentBidCol}>
              <CurrentBid
                currentBid={new BigNumber(auction.amount.toString())}
                auctionEnded={auctionEnded}
              />
            </Col>
            <Col lg={6} className={classes.auctionTimerCol}>
              {auctionEnded ? (
                isLastAuction ? (
                  <Winner winner={auction.bidder} />
                ) : (
                  <Holder nounId={auction.nounId?.toNumber()} />
                )
              ) : (
                <AuctionTimer auction={auction} auctionEnded={auctionEnded} />
              )}
            </Col>
          </Row>
        </div>
        {!auctionEnded && (
          <Row className={classes.activityRow}>
            <Col lg={12} className={classes.fomoNounsLink}>
              <FontAwesomeIcon icon={faInfoCircle} />
              <Link
                to={FOMO_NOUNS_URL}
                className={classes.fomoNounsLink}
                target={'_blank'}
                rel="noreferrer"
              >
                <Trans>Help mint the next Noun</Trans>
              </Link>
            </Col>
          </Row>
        )}
        {isLastAuction && (
          <>
            <Row className={classes.activityRow}>
              <Col lg={12}>
                <Bid auction={auction} auctionEnded={auctionEnded} />
              </Col>
            </Row>
          </>
        )}
        <Row className={classes.activityRow}>
          <Col lg={12}>
            {!isLastAuction ? (
              <NounInfoCard
                nounId={auction.nounId.toNumber()}
                bidHistoryOnClickHandler={showBidModalHandler}
              />
            ) : (
              displayGraphDepComps && (
                <BidHistory
                  auctionId={auction.nounId.toString()}
                  max={3}
                  classes={bidHistoryClasses}
                />
              )
            )}
            {/* If no bids, show nothing. If bids avail:graph is stable? show bid history modal,
            else show etherscan contract link */}
            {isLastAuction &&
              !auction.amount.eq(0) &&
              (displayGraphDepComps ? (
                <BidHistoryBtn onClick={showBidModalHandler} />
              ) : (
                <BidHistoryBtn onClick={openEtherscanBidHistory} />
              ))}
          </Col>
        </Row>
      </AuctionActivityWrapper>
    </>
  )
}

export default AuctionActivity
