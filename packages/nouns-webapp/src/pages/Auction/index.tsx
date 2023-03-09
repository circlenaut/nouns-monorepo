import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Auction from '@/components/Auction'
import Documentation from '@/components/Documentation'
import NounsIntroSection from '@/components/NounsIntroSection'
import ProfileActivityFeed from '@/components/ProfileActivityFeed'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { setOnDisplayAuctionNounId } from '@/state/slices/onDisplayAuction'
import { nounPath } from '@/utils/history'
import useOnDisplayAuction from '@/wrappers/onDisplayAuction'

const AuctionPage: React.FC = () => {
  const onDisplayAuction = useOnDisplayAuction()
  const lastAuctionNounId = useAppSelector(
    (state) => state.onDisplayAuction.lastAuctionNounId,
  )
  const onDisplayAuctionNounId =
    onDisplayAuction?.nounId.toNumber() ?? undefined

  const dispatch = useAppDispatch()

  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const initialAuctionId = id ? parseInt(id) : undefined

  useEffect(() => {
    if (initialAuctionId) {
      navigate(`/noun/${initialAuctionId}`)
    }
  }, [initialAuctionId, navigate])

  // useEffect(() => {
  //   window.addEventListener('touchmove', function(event) {
  //     window.scrollTo(0, window.scrollY - event.touches[0].clientY);
  //   }, { passive: false });

  //   window.addEventListener('touchstart', function(event) {
  //     // window.scrollTo(0, window.scrollY - event.touches[0].clientY);
  //   }, { passive: false });
  // }, [])

  useEffect(() => {
    if (!lastAuctionNounId) return

    if (initialAuctionId !== undefined) {
      // handle out of bounds noun path ids
      if (initialAuctionId > lastAuctionNounId || initialAuctionId < 0) {
        dispatch(setOnDisplayAuctionNounId(lastAuctionNounId))
        navigate(nounPath(lastAuctionNounId))
      } else {
        if (onDisplayAuction === undefined) {
          // handle regular noun path ids on first load
          dispatch(setOnDisplayAuctionNounId(initialAuctionId))
        }
      }
    } else {
      // no noun path id set
      if (lastAuctionNounId) {
        dispatch(setOnDisplayAuctionNounId(lastAuctionNounId))
      }
    }
  }, [
    lastAuctionNounId,
    dispatch,
    navigate,
    initialAuctionId,
    onDisplayAuction,
  ])

  const isCoolBackground = useAppSelector(
    (state) => state.application.isCoolBackground,
  )
  const backgroundColor = isCoolBackground
    ? 'var(--brand-cool-background)'
    : 'var(--brand-warm-background)'

  return (
    <>
      <Auction auction={onDisplayAuction} />
      {onDisplayAuctionNounId !== undefined &&
      onDisplayAuctionNounId !== lastAuctionNounId ? (
        <ProfileActivityFeed nounId={onDisplayAuctionNounId} />
      ) : (
        <NounsIntroSection />
      )}
      <Documentation
        backgroundColor={
          onDisplayAuctionNounId === undefined ||
          onDisplayAuctionNounId === lastAuctionNounId
            ? backgroundColor
            : undefined
        }
      />
    </>
  )
}
export default AuctionPage
