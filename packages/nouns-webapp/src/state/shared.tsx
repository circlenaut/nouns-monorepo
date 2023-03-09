import { useState } from 'react'

import { WALLET_TYPE } from '@/components/WalletButton'

export const useShareableWalletType = () => {
  const [walletType, setWalletType] = useState<WALLET_TYPE | null>()
  // console.debug(`Setting walletType to: ${walletType}`);
  return {
    walletType,
    setWalletType,
  }
}

export const useShareableAuctionId = () => {
  const [auctionId, setAuctionId] = useState<string>()
  // console.debug(`Setting auction ID: ${auctionId}`);
  return {
    auctionId,
    setAuctionId,
  }
}

export const useShareableAuctionBidState = () => {
  const [isAuctionBidding, setIsAuctionBidding] = useState<boolean>(false)
  // console.debug(`Is auction bidding? ${isAuctionBidding}`);
  return {
    isAuctionBidding,
    setIsAuctionBidding,
  }
}

export const useShareableAuctionExtensionState = () => {
  const [isAuctionExtended, setIsAuctionExtended] = useState<boolean>(false)
  // console.debug(`Is auction extended? ${isAuctionExtended}`);
  return {
    isAuctionExtended,
    setIsAuctionExtended,
  }
}

export const useShareableAuctionCreationState = () => {
  const [isAuctionCreated, setIsAuctionCreated] = useState<boolean>(false)
  // console.debug(`Is auction created? ${isAuctionCreated}`);
  return {
    isAuctionCreated,
    setIsAuctionCreated,
  }
}

export const useShareableAuctionSettlementState = () => {
  const [isAuctionSettled, setIsAuctionSettled] = useState<boolean>(false)
  // console.debug(`is auction settled? ${isAuctionSettled}`);
  return {
    isAuctionSettled,
    setIsAuctionSettled,
  }
}

export const useShareableShortAddressLoader = () => {
  const [isLoading, setIsLoading] = useState<boolean | null>(null)
  console.debug(`Setting Short Address countdown to: ${isLoading}`)
  return {
    isLoading,
    setIsLoading,
  }
}

export const useShareableIsCountdownActive = () => {
  const [isCountdownActive, setIsCountdownActive] = useState<boolean | null>(
    null,
  )
  console.debug(`Setting countdown state to: ${isCountdownActive}`)
  return {
    isCountdownActive,
    setIsCountdownActive,
  }
}
