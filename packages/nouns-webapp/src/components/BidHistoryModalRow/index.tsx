import Davatar from '@davatar/react'
import { BigNumber as EthersBN } from '@ethersproject/bignumber'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { useEthers } from '@usedapp/core'
import BigNumber from 'bignumber.js'
import clsx from 'clsx'
import React from 'react'
import { Link } from 'react-router-dom'

import TruncatedAmount from '@/components/TruncatedAmount'
import { useReverseENSLookUp } from '@/utils/ensLookup'
import { buildEtherscanTxLink } from '@/utils/etherscan'
import { containsBlockedText } from '@/utils/moderation/containsBlockedText'
import { Bid } from '@/utils/types'

// tslint:disable:ordered-imports
import classes from './BidHistoryModalRow.module.css'
import auctionActivityClasses from '@/components/AuctionActivity/BidHistory.module.css'

import _trophy from '@/assets/icons/trophy.svg'
import ShortAddress from '../ShortAddress'

interface BidHistoryModalRowProps {
  bid: Bid
  index: number
}

const BidHistoryModalRow: React.FC<BidHistoryModalRowProps> = (props) => {
  const { bid, index } = props
  const txLink = buildEtherscanTxLink(bid.transactionHash)
  const { library: provider } = useEthers()

  const bidAmount = (
    <TruncatedAmount
      amount={new BigNumber(EthersBN.from(bid.value).toString())}
    />
  )

  return (
    <li className={clsx(auctionActivityClasses.bidRowCool, classes.bidRow)}>
      <div className={auctionActivityClasses.bidItem}>
        <div className={auctionActivityClasses.leftSectionWrapper}>
          <div className={auctionActivityClasses.bidder}>
            <div className={classes.bidderInfoWrapper}>
              <Davatar size={40} address={bid.sender} provider={provider} />
              <ShortAddress size={40} address={bid.sender} />
              <div className={classes.bidderInfoText}>
                <span>
                  <ShortAddress size={40} address={bid.sender} />
                  {index === 0 && (
                    <img
                      src={_trophy}
                      alt="Winning bidder"
                      className={classes.trophy}
                      height={16}
                      width={16}
                    />
                  )}
                  <br />
                  <div className={classes.bidDate}>
                    {i18n.date(
                      new Date(EthersBN.from(bid.timestamp).toNumber() * 1000),
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      },
                    )}
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={auctionActivityClasses.rightSectionWrapper}>
          <div
            className={clsx(
              classes.bidAmount,
              auctionActivityClasses.bidAmount,
            )}
          >
            {bidAmount}
          </div>
          <div className={auctionActivityClasses.linkSymbol}>
            <Link to={txLink} target="_blank" rel="noreferrer">
              <div className={classes.linkIcon}>
                <ExternalLinkIcon height={24} width={24} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}

export default BidHistoryModalRow
