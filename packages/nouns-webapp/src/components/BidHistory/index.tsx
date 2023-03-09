import { BigNumber as EthersBN } from '@ethersproject/bignumber'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import React from 'react'
import { Link } from 'react-router-dom'

import ShortAddress from '@/components/ShortAddress'
import TruncatedAmount from '@/components/TruncatedAmount'
import { useAppSelector } from '@/hooks'
import { buildEtherscanTxLink } from '@/utils/etherscan'
import { Bid } from '@/utils/types'
import { useAuctionBids } from '@/wrappers/onDisplayAuction'

import LinkSvg from '@/assets/icons/Link.svg'

const bidItem = (
  bid: Bid,
  index: number,
  classes: CSSModuleClasses,
  isCool?: boolean,
) => {
  const bidAmount = (
    <TruncatedAmount
      amount={new BigNumber(EthersBN.from(bid.value).toString())}
    />
  )
  const date = `${dayjs(EthersBN.from(bid.timestamp).toNumber() * 1000).format(
    'MMM DD',
  )} at ${dayjs(EthersBN.from(bid.timestamp).toNumber() * 1000).format(
    'hh:mm a',
  )}`

  const txLink = buildEtherscanTxLink(bid.transactionHash)
  const isMobile = window.innerWidth < 992

  return (
    <li
      key={index}
      className={isCool ? classes.bidRowCool : classes.bidRowWarm}
    >
      <div className={classes.bidItem}>
        <div className={classes.leftSectionWrapper}>
          <div className={classes.bidder}>
            <div>
              <ShortAddress
                address={bid.sender}
                avatar={isMobile ? false : true}
              />
            </div>
          </div>
          <div className={classes.bidDate}>{date}</div>
        </div>
        <div className={classes.rightSectionWrapper}>
          <div className={classes.bidAmount}>{bidAmount}</div>
          <div className={classes.linkSymbol}>
            <Link to={txLink}>
              <img src={LinkSvg} width={24} alt="link symbol" />
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}

const BidHistory: React.FC<{
  auctionId: string
  max: number
  classes?: CSSModuleClasses
}> = (props) => {
  const { auctionId, max, classes } = props
  const isCool = useAppSelector((state) => state.application.isCoolBackground)
  const bids = useAuctionBids(EthersBN.from(auctionId))
  const bidContent =
    bids &&
    classes &&
    bids
      .sort(
        (bid1: Bid, bid2: Bid) =>
          -1 *
          (EthersBN.from(bid1.timestamp).toNumber() -
            EthersBN.from(bid2.timestamp).toNumber()),
      )
      .map((bid: Bid, i: number) => {
        return bidItem(bid, i, classes, isCool)
      })
      .slice(0, max)

  return <ul className={classes && classes.bidCollection}>{bidContent}</ul>
}

export default BidHistory
