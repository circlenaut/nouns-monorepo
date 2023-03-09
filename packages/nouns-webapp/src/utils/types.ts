import { BigNumber } from '@ethersproject/bignumber'

import { Auction } from '@/wrappers/nounsAuction'

export interface Bid {
  nounId: BigNumber
  sender: string
  value: BigNumber
  extended: boolean
  transactionHash: string
  timestamp: number
}

export type BidEvent = Bid

export interface BidFilterEvent extends BidEvent {
  event: unknown
}

export type AuctionCreateEvent = Auction

export interface AuctionExtendedEvent {
  nounId: BigNumber
  endTime: BigNumber
}

export interface AuctionSettledEvent {
  nounId: BigNumber
  winner: string
  amount: BigNumber
}
