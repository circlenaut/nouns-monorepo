import { BigNumber } from 'ethers'

import { IBid } from '@/wrappers/subgraph'

const blockMultiple = BigNumber.from(1_000_000)

const generateBidScore = (bid: IBid) =>
  BigNumber.from(bid.blockNumber)
    .mul(blockMultiple)
    .add(BigNumber.from(bid.txIndex))

export const compareBids = (bidA: IBid, bidB: IBid): number => {
  const aScore = generateBidScore(bidA)
  const bScore = generateBidScore(bidB)
  return aScore.sub(bScore).toNumber()
}
