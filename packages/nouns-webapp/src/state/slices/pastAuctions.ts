import { BigNumber as EthersBN, BigNumberish, constants } from 'ethers'

import { Bid } from '@/utils/types'
import { BigNumber } from '@ethersproject/bignumber'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { AuctionState } from './auction'

export interface PastAuctionsState {
  pastAuctions: AuctionState[]
}

const initialState: PastAuctionsState = {
  pastAuctions: [],
}

interface AuctionBid {
  id: string
  amount: BigNumber
  bidder: {
    id: string
  }
  blockNumber: number
  blockTimestamp: number
  txIndex?: number
  noun: {
    id: number
    startTime?: BigNumberish
    endTime?: BigNumberish
    settled?: boolean
  } | null
  endTime: EthersBN
  startTime: EthersBN
  nounId: EthersBN
  settled: boolean
  bids: ExtendedBid[]
}

interface AuctionData {
  data?: {
    auctions?: AuctionBid[]
  }
}

interface ExtendedBid extends Bid {
  id: string
  amount: BigNumber
  bidder: {
    id: string
  }
  blockNumber: number
  blockTimestamp: number
  txIndex?: number
  noun: {
    id: number
    startTime?: BigNumberish
    endTime?: BigNumberish
    settled?: boolean
  } | null
  endTime: EthersBN
  startTime: EthersBN
  nounId: EthersBN
  settled: boolean
}

const reduxSafePastAuctions = (data: AuctionData): AuctionState[] => {
  const auctions = data?.data?.auctions as AuctionBid[]
  if (auctions.length < 0) return []
  const pastAuctions: AuctionState[] = auctions.map((auction) => {
    auction.bids
    return {
      activeAuction: {
        amount: BigNumber.from(auction.amount).toJSON(),
        bidder: auction.bidder ? auction.bidder.id : constants.AddressZero,
        startTime: BigNumber.from(auction.startTime).toJSON(),
        endTime: BigNumber.from(auction.endTime).toJSON(),
        nounId: BigNumber.from(auction.id).toJSON(),
        settled: false,
      },
      bids: auction.bids.map((bid: ExtendedBid) => {
        return {
          nounId: BigNumber.from(auction.id).toJSON(),
          sender: bid.bidder.id,
          value: BigNumber.from(bid.amount).toJSON(),
          extended: false,
          transactionHash: bid.id,
          timestamp: BigNumber.from(bid.blockTimestamp).toJSON(),
        }
      }),
    }
  })
  return pastAuctions
}

const pastAuctionsSlice = createSlice({
  name: 'pastAuctions',
  initialState: initialState,
  reducers: {
    addPastAuctions: (state, action: PayloadAction<AuctionData>) => {
      state.pastAuctions = reduxSafePastAuctions(action.payload)
    },
  },
})

export const { addPastAuctions } = pastAuctionsSlice.actions

const pastAuctionsReducer = pastAuctionsSlice.reducer
export default pastAuctionsReducer
