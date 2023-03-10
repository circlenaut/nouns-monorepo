import { XIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import React from 'react'
import ReactDOM from 'react-dom'

import BidHistoryModalRow from '@/components/BidHistoryModalRow'
import { StandaloneNounRoundedCorners } from '@/components/StandaloneNoun'
import { Bid } from '@/utils/types'
import { Auction } from '@/wrappers/nounsAuction'
import { useAuctionBids } from '@/wrappers/onDisplayAuction'

import classes from './BidHistoryModal.module.css'

export const Backdrop: React.FC<{ onDismiss: () => void }> = ({
  onDismiss,
}) => {
  return (
    <div
      className={classes.backdrop}
      onClick={onDismiss}
      onKeyDown={(e) => e.key === 'Enter' && onDismiss()}
      role="button"
      tabIndex={0}
    />
  )
}

const BidHistoryModalOverlay: React.FC<{
  auction: Auction
  onDismiss: () => void
}> = (props) => {
  const { onDismiss, auction } = props

  const bids = useAuctionBids(auction.nounId)
  return (
    <>
      <div className={classes.closeBtnWrapper}>
        <button onClick={onDismiss} className={classes.closeBtn}>
          <XIcon className={classes.icon} />
        </button>
      </div>

      <div className={classes.modal}>
        <div className={classes.content}>
          <div className={classes.header}>
            <div className={classes.nounWrapper}>
              <StandaloneNounRoundedCorners
                nounId={auction && auction.nounId}
              />
            </div>

            <div className={classes.title}>
              <h2>
                <Trans>Bids for</Trans>
              </h2>
              <h1>Noun {auction && auction.nounId.toString()}</h1>
            </div>
          </div>
          <div className={classes.bidWrapper}>
            {bids && bids.length > 0 ? (
              <ul>
                {bids?.map((bid: Bid, i: number) => {
                  return (
                    <BidHistoryModalRow
                      key={`${auction.bidder}_${bid.timestamp}`}
                      index={i}
                      bid={bid}
                    />
                  )
                })}
              </ul>
            ) : (
              <div className={classes.nullStateText}>
                <Trans>Bids will appear here</Trans>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const backdropRoot = document.getElementById('backdrop-root')
const overlayRoot = document.getElementById('overlay-root')

const BidHistoryModal: React.FC<{
  auction: Auction
  onDismiss: () => void
}> = (props) => {
  const { onDismiss, auction } = props
  return (
    <>
      {backdropRoot &&
        ReactDOM.createPortal(<Backdrop onDismiss={onDismiss} />, backdropRoot)}
      {overlayRoot &&
        ReactDOM.createPortal(
          <BidHistoryModalOverlay onDismiss={onDismiss} auction={auction} />,
          overlayRoot,
        )}
    </>
  )
}

export default BidHistoryModal
