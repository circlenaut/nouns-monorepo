import BigNumber from 'bignumber.js'
import React from 'react'

import TruncatedAmount from '@/components/TruncatedAmount'

import classes from './MinBid.module.css'

import nounPointerImg from '@/assets/noun-pointer.png'

const MinBid: React.FC<{ minBid: BigNumber; onClick: () => void }> = (
  props,
) => {
  const { minBid, onClick } = props

  return (
    <div
      className={classes.minBidWrapper}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => event.key === 'Enter' && onClick()}
    >
      <img src={nounPointerImg} alt="Pointer noun" />
      <h3 className={classes.minBid}>
        You must bid at least {minBid && <TruncatedAmount amount={minBid} />}
      </h3>
    </div>
  )
}
export default MinBid
