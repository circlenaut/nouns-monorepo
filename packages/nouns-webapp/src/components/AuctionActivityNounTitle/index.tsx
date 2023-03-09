import { Trans } from '@lingui/macro'
import { BigNumber } from 'ethers'
import React from 'react'

import classes from './AuctionActivityNounTitle.module.css'

const AuctionActivityNounTitle: React.FC<{
  nounId: BigNumber
  isCool?: boolean
}> = (props) => {
  const { nounId } = props
  return (
    <div className={classes.wrapper}>
      <h1 className="h1-title">
        <Trans>Noun {nounId.toString()}</Trans>
      </h1>
    </div>
  )
}
export default AuctionActivityNounTitle
