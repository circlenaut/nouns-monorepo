import BigNumber from 'bignumber.js'
import { constants, utils } from 'ethers'
import React from 'react'

const TruncatedAmount: React.FC<{ amount: BigNumber }> = (props) => {
  const { amount } = props

  const eth = new BigNumber(utils.formatEther(amount.toString())).toFixed(2)
  return (
    <>
      {constants.EtherSymbol} {`${eth}`}
    </>
  )
}
export default TruncatedAmount
