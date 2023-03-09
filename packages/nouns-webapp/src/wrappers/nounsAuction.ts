import { WebSocketProvider } from '@ethersproject/providers'
import { NounsAuctionHouseABI, type NounsAuctionHouse } from '@nouns/sdk'
import { useEthers } from '@usedapp/core'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBN, Contract, utils } from 'ethers'

import { ContractAddresses } from '@/configs'
import { useAppSelector } from '@/hooks'
import { AuctionState } from '@/state/slices/auction'
import { isNounderNoun } from '@/utils/nounderNoun'
import { useCachedCall } from './contracts'

export enum AuctionHouseContractFunction {
  auction = 'auction',
  duration = 'duration',
  minBidIncrementPercentage = 'minBidIncrementPercentage',
  nouns = 'nouns',
  createBid = 'createBid',
  settleCurrentAndCreateNewAuction = 'settleCurrentAndCreateNewAuction',
}

export interface Auction {
  amount: EthersBN
  bidder: string
  endTime: EthersBN
  startTime: EthersBN
  nounId: EthersBN
  settled: boolean
}

const abi = NounsAuctionHouseABI && new utils.Interface(NounsAuctionHouseABI)

export const useAuction = (
  auctionHouseProxyAddress: string,
  provider?: WebSocketProvider,
): Auction | undefined => {
  const { library } = useEthers()
  const contract = new Contract(
    auctionHouseProxyAddress,
    abi,
    provider ?? library,
  ) as NounsAuctionHouse

  // console.debug(`Calling function 'auction' on contract ${contract.address}`);
  const { value: auction, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'auction',
        args: [],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return auction
}

export const useAuctionMinBidIncPercentage = (addresses: ContractAddresses) => {
  const { library: provider } = useEthers()

  const contract = new Contract(
    addresses.nounsAuctionHouseProxy,
    abi,
    provider,
  ) as NounsAuctionHouse

  const { value: minBidIncrement, error } =
    useCachedCall(
      contract && {
        contract: contract,
        method: 'minBidIncrementPercentage',
        args: [],
      },
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  if (!minBidIncrement) {
    return
  }
  return new BigNumber(minBidIncrement[0])
}

/**
 * Computes timestamp after which a Noun could vote
 * @param nounId TokenId of Noun
 * @returns Unix timestamp after which Noun could vote
 */
export const useNounCanVoteTimestamp = (nounId: number) => {
  const nextNounId = nounId + 1

  const nextNounIdForQuery = isNounderNoun(EthersBN.from(nextNounId))
    ? nextNounId + 1
    : nextNounId

  const pastAuctions = useAppSelector(
    (state) => state.pastAuctions.pastAuctions,
  )

  const maybeNounCanVoteTimestamp = pastAuctions.find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (auction: AuctionState, i: number) => {
      const maybeNounId = auction.activeAuction?.nounId
      return maybeNounId
        ? EthersBN.from(maybeNounId).eq(EthersBN.from(nextNounIdForQuery))
        : false
    },
  )?.activeAuction?.startTime

  if (!maybeNounCanVoteTimestamp) {
    // This state only occurs during loading flashes
    return EthersBN.from(0)
  }

  return EthersBN.from(maybeNounCanVoteTimestamp)
}
