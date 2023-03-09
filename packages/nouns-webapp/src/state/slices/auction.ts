import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  AuctionCreateEvent,
  AuctionExtendedEvent,
  AuctionSettledEvent,
  BidEvent,
} from '@/utils/types'
import { Auction as IAuction } from '@/wrappers/nounsAuction'

export interface AuctionState {
  activeAuction?: IAuction
  bids: BidEvent[]
}

const initialState: AuctionState = {
  activeAuction: undefined,
  bids: [],
}

export const reduxSafeAuction = (auction: IAuction): IAuction => {
  return {
    amount: BigNumber.from(auction.amount).toJSON(),
    bidder: auction.bidder,
    startTime: BigNumber.from(auction.startTime).toJSON(),
    endTime: BigNumber.from(auction.endTime).toJSON(),
    nounId: BigNumber.from(auction.nounId).toJSON(),
    settled: auction.settled,
  }
}

export const reduxSafeBid = (bid: BidEvent): BidEvent => {
  return {
    nounId: BigNumber.from(bid.nounId).toJSON(),
    sender: bid.sender,
    value: BigNumber.from(bid.value).toJSON(),
    extended: bid.extended,
    transactionHash: bid.transactionHash,
    timestamp: bid.timestamp,
  }
}

export const reduxSafeNewAuction = (
  auction: AuctionCreateEvent,
): AuctionCreateEvent => {
  return {
    amount: BigNumber.from(auction.amount).toJSON(),
    bidder: auction.bidder,
    nounId: BigNumber.from(auction.nounId).toJSON(),
    startTime: BigNumber.from(auction.startTime).toJSON(),
    endTime: BigNumber.from(auction.endTime).toJSON(),
    settled: false,
  }
}

export const reduxSafeExtension = (
  extension: AuctionExtendedEvent,
): AuctionExtendedEvent => {
  return {
    nounId: BigNumber.from(extension.nounId).toJSON(),
    endTime: BigNumber.from(extension.endTime).toJSON(),
  }
}

export const reduxSafeSettlement = (
  settlement: AuctionSettledEvent,
): AuctionSettledEvent => {
  return {
    nounId: BigNumber.from(settlement.nounId).toJSON(),
    amount: BigNumber.from(settlement.amount).toJSON(),
    winner: BigNumber.from(settlement.winner).toJSON(),
  }
}

const maxBid = (bids: BidEvent[]): BidEvent => {
  return bids.reduce((prev, current) => {
    return BigNumber.from(prev.value).gt(BigNumber.from(current.value))
      ? prev
      : current
  })
}

const auctionsEqual = (
  a: { nounId: BigNumberish },
  b: { nounId: BigNumberish },
): boolean => {
  if (typeof a.nounId === 'number' && typeof b.nounId === 'number') {
    return a.nounId === b.nounId
  } else {
    const bigA = BigNumber.from(a.nounId)
    const bigB = BigNumber.from(b.nounId)
    return bigA.eq(bigB)
  }
}

const containsBid = (bidEvents: BidEvent[], bidEvent: BidEvent) =>
  bidEvents
    .map((bid) => bid.transactionHash)
    .indexOf(bidEvent.transactionHash) >= 0

/**
 * State of **current** auction (sourced via websocket)
 */
export const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    setActiveAuction: (state, action: PayloadAction<AuctionCreateEvent>) => {
      state.activeAuction = reduxSafeNewAuction(action.payload)
      state.bids = []
      console.debug('processed auction create', action.payload)
    },
    setFullAuction: (state, action: PayloadAction<IAuction>) => {
      console.debug(`from set full auction: `, action.payload)
      state.activeAuction = reduxSafeAuction(action.payload)
    },
    appendBid: (state, action: PayloadAction<BidEvent>) => {
      if (
        !(
          state.activeAuction &&
          auctionsEqual(state.activeAuction, action.payload)
        )
      )
        return
      if (containsBid(state.bids, action.payload)) return
      state.bids = [reduxSafeBid(action.payload), ...state.bids]
      const maxBid_ = maxBid(state.bids)
      state.activeAuction = reduxSafeAuction({
        ...state.activeAuction,
        amount: maxBid_.value,
        bidder: maxBid_.sender,
      })

      console.debug('processed bid', action.payload)
    },
    setAuctionSettled: (state, action: PayloadAction<AuctionSettledEvent>) => {
      if (
        !(
          state.activeAuction &&
          auctionsEqual(state.activeAuction, action.payload)
        )
      )
        return
      state.activeAuction = reduxSafeAuction({
        ...state.activeAuction,
        amount: action.payload.amount,
        bidder: action.payload.winner,
        settled: true,
      })
      console.debug('processed auction settled', action.payload)
    },
    setAuctionExtended: (
      state,
      action: PayloadAction<AuctionExtendedEvent>,
    ) => {
      if (
        !(
          state.activeAuction &&
          auctionsEqual(state.activeAuction, action.payload)
        )
      )
        return
      state.activeAuction = reduxSafeAuction({
        ...state.activeAuction,
        endTime: action.payload.endTime,
      })
      console.debug('processed auction extended', action.payload)
    },
  },
})

export const {
  setActiveAuction,
  appendBid,
  setAuctionExtended,
  setAuctionSettled,
  setFullAuction,
} = auctionSlice.actions

const auctionReducer = auctionSlice.reducer
export default auctionReducer
