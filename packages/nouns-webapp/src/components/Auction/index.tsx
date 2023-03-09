import React, { useCallback, useMemo } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import AuctionActivity from '@/components/AuctionActivity'
import { LoadingNoun } from '@/components/Noun'
import NounderNounContent from '@/components/NounderNounContent'
import { StandaloneNounWithSeed } from '@/components/StandaloneNoun'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  setNextOnDisplayAuctionNounId,
  setPrevOnDisplayAuctionNounId,
} from '@/state/slices/onDisplayAuction'
import { isNounderNoun } from '@/utils/nounderNoun'
import { Auction as IAuction } from '@/wrappers/nounsAuction'

import classes from './Auction.module.css'

interface AuctionProps {
  auction?: IAuction
}

const Auction: React.FC<AuctionProps> = (props) => {
  const { auction: currentAuction } = props

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const stateBgColor = useAppSelector(
    (state) => state.application.stateBackgroundColor,
  )
  const lastNounId = useAppSelector(
    (state) => state.onDisplayAuction.lastAuctionNounId,
  )

  const prevAuctionHandler = useCallback(() => {
    dispatch(setPrevOnDisplayAuctionNounId())
    currentAuction && navigate(`/noun/${currentAuction.nounId.toNumber() - 1}`)
  }, [dispatch, , currentAuction])

  const nextAuctionHandler = useCallback(() => {
    dispatch(setNextOnDisplayAuctionNounId())
    currentAuction && navigate(`/noun/${currentAuction.nounId.toNumber() + 1}`)
  }, [dispatch, , currentAuction])

  const currentAuctionActivityContent = useMemo(
    () =>
      !currentAuction || !lastNounId ? null : (
        <AuctionActivity
          auction={currentAuction}
          isFirstAuction={currentAuction.nounId.eq(0)}
          isLastAuction={currentAuction.nounId.eq(lastNounId)}
          onPrevAuctionClick={prevAuctionHandler}
          onNextAuctionClick={nextAuctionHandler}
          displayGraphDepComps={true}
        />
      ),
    [currentAuction, lastNounId, prevAuctionHandler, nextAuctionHandler],
  )

  const nounderNounContent = useMemo(
    () =>
      !currentAuction || !lastNounId ? null : (
        <NounderNounContent
          mintTimestamp={currentAuction.startTime}
          nounId={currentAuction.nounId}
          isFirstAuction={currentAuction.nounId.eq(0)}
          isLastAuction={currentAuction.nounId.eq(lastNounId)}
          onPrevAuctionClick={prevAuctionHandler}
          onNextAuctionClick={nextAuctionHandler}
        />
      ),
    [currentAuction, lastNounId, prevAuctionHandler, nextAuctionHandler],
  )

  return (
    <div style={{ backgroundColor: stateBgColor }} className={classes.wrapper}>
      <Container fluid="xl">
        <Row>
          <Col lg={{ span: 6 }} className={classes.nounContentCol}>
            {!!currentAuction ? (
              <div className={classes.nounWrapper}>
                <StandaloneNounWithSeed
                  nounId={currentAuction.nounId}
                  shouldLinkToProfile={false}
                />
              </div>
            ) : (
              <div className={classes.nounWrapper}>
                <LoadingNoun />
              </div>
            )}
          </Col>
          <Col lg={{ span: 6 }} className={classes.auctionActivityCol}>
            {currentAuction &&
              (isNounderNoun(currentAuction.nounId)
                ? nounderNounContent
                : currentAuctionActivityContent)}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Auction
