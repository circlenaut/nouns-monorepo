import { WebSocketProvider } from '@ethersproject/providers'
import { BigNumber, constants } from 'ethers'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { NounsAuctionHouseFactory, type NounsAuctionHouse } from '@nouns/sdk'

import { useAppDispatch } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useConfig } from '@/hooks/useConfig'
import {
  appendBid,
  AuctionState,
  reduxSafeAuction,
  reduxSafeBid,
  reduxSafeExtension,
  reduxSafeNewAuction,
  reduxSafeSettlement,
  setActiveAuction,
  setAuctionExtended,
  setAuctionSettled,
  setFullAuction,
} from '@/state/slices/auction'
import {
  OnDisplayAuctionState,
  setLastAuctionNounId,
  setOnDisplayAuctionNounId,
} from '@/state/slices/onDisplayAuction'
// import { convertBigNumberToString } from '@/utils/numbers'
import { fetchEthersError } from '@/errors/ethers'
import { AccountState } from '@/state/slices/account'
import { ApplicationState } from '@/state/slices/application'
import { CacheState } from '@/state/slices/cache'
import { LogsState } from '@/state/slices/logs'
import { PastAuctionsState } from '@/state/slices/pastAuctions'
import { TypedEvent } from '@nouns/contracts/typechain/common'
import { ThunkDispatch } from '@reduxjs/toolkit'
import { AnyAction, CombinedState, Dispatch } from 'redux'

const BLOCKS_PER_DAY = 7_200

const createBidProcessor =
  async (
    dispatch: ThunkDispatch<
      CombinedState<{
        account: AccountState
        application: ApplicationState
        auction: AuctionState
        logs: LogsState
        pastAuctions: PastAuctionsState
        onDisplayAuction: OnDisplayAuctionState
        cache: CacheState
      }>,
      undefined,
      AnyAction
    > &
      Dispatch<AnyAction>,
  ) =>
  async (
    nounId: BigNumber,
    sender: string,
    value: BigNumber,
    extended: boolean,
    event: TypedEvent,
  ) => {
    const timestamp = (await event.getBlock()).timestamp
    const transactionHash = event.transactionHash
    dispatch(
      appendBid(
        reduxSafeBid({
          nounId,
          sender,
          value,
          extended,
          transactionHash,
          timestamp,
        }),
      ),
    )
  }

const createAuctionCreationProcessor =
  (
    dispatch: ThunkDispatch<
      CombinedState<{
        account: AccountState
        application: ApplicationState
        auction: AuctionState
        logs: LogsState
        pastAuctions: PastAuctionsState
        onDisplayAuction: OnDisplayAuctionState
        cache: CacheState
      }>,
      undefined,
      AnyAction
    > &
      Dispatch<AnyAction>,
  ) =>
  (nounId: BigNumber, startTime: BigNumber, endTime: BigNumber) => {
    const creation = setActiveAuction(
      reduxSafeNewAuction({
        amount: BigNumber.from(0),
        bidder: constants.AddressZero,
        nounId,
        startTime,
        endTime,
        settled: false,
      }),
    )
    const nounIdNumber = BigNumber.from(nounId).toNumber()
    dispatch(creation)
    dispatch(setOnDisplayAuctionNounId(nounIdNumber))
    dispatch(setLastAuctionNounId(nounIdNumber))
  }

const createAuctionExtensionProcessor =
  (
    dispatch: ThunkDispatch<
      CombinedState<{
        account: AccountState
        application: ApplicationState
        auction: AuctionState
        logs: LogsState
        pastAuctions: PastAuctionsState
        onDisplayAuction: OnDisplayAuctionState
        cache: CacheState
      }>,
      undefined,
      AnyAction
    > &
      Dispatch<AnyAction>,
  ) =>
  (nounId: BigNumber, endTime: BigNumber) => {
    const extension = setAuctionExtended(
      reduxSafeExtension({
        nounId,
        endTime,
      }),
    )
    dispatch(extension)
  }

const createAuctionSettlementProcessor =
  (
    dispatch: ThunkDispatch<
      CombinedState<{
        account: AccountState
        application: ApplicationState
        auction: AuctionState
        logs: LogsState
        pastAuctions: PastAuctionsState
        onDisplayAuction: OnDisplayAuctionState
        cache: CacheState
      }>,
      undefined,
      AnyAction
    > &
      Dispatch<AnyAction>,
  ) =>
  (nounId: BigNumber, winner: string, amount: BigNumber) => {
    const settlement = setAuctionSettled(
      reduxSafeSettlement({
        nounId,
        winner,
        amount,
      }),
    )
    dispatch(settlement)
  }

const ChainSubscriber: React.FC = () => {
  const dispatch = useAppDispatch()

  const { app } = useConfig()
  const { contractAddresses } = useContractAddresses()

  const wsProvider = useMemo(
    () => (app?.wsRpcUri ? new WebSocketProvider(app.wsRpcUri) : undefined),
    [app],
  )
  const nounsAuctionHouseContract: NounsAuctionHouse | null = useMemo(
    () =>
      wsProvider && contractAddresses
        ? NounsAuctionHouseFactory.connect(
            contractAddresses.nounsAuctionHouseProxy,
            wsProvider,
          )
        : null,
    [wsProvider, contractAddresses],
  )

  const bidProcessor = useRef<ReturnType<typeof createBidProcessor>>()
  const creationProcessor =
    useRef<ReturnType<typeof createAuctionCreationProcessor>>()
  const extensionProcessor =
    useRef<ReturnType<typeof createAuctionExtensionProcessor>>()
  const settlementProcessor =
    useRef<ReturnType<typeof createAuctionSettlementProcessor>>()

  const fetchCurrentAuction = useCallback(
    async () =>
      wsProvider &&
      nounsAuctionHouseContract &&
      (await nounsAuctionHouseContract.auction()),
    [wsProvider, nounsAuctionHouseContract],
  )

  const createBidProcessorWrapper = async (
    dispatch: ThunkDispatch<
      CombinedState<{
        account: AccountState
        application: ApplicationState
        auction: AuctionState
        logs: LogsState
        pastAuctions: PastAuctionsState
        onDisplayAuction: OnDisplayAuctionState
        cache: CacheState
      }>,
      undefined,
      AnyAction
    > &
      Dispatch<AnyAction>,
  ) => {
    return await createBidProcessor(dispatch)
  }

  const processBidFilter = useCallback(
    async (
      nounId: BigNumber,
      sender: string,
      value: BigNumber,
      extended: boolean,
      event: TypedEvent,
    ) => {
      const createBidProcessor =
        (await bidProcessor.current) ??
        (await createBidProcessorWrapper(dispatch))
      await createBidProcessor(nounId, sender, value, extended, event)
    },
    [dispatch, nounsAuctionHouseContract],
  )

  const processAuctionCreated = useCallback(
    creationProcessor.current ?? createAuctionCreationProcessor(dispatch),
    [dispatch, setActiveAuction],
  )

  const processAuctionExtended = useCallback(
    extensionProcessor.current ?? createAuctionExtensionProcessor(dispatch),
    [dispatch, setAuctionExtended],
  )

  const processAuctionSettled = useCallback(
    settlementProcessor.current ?? createAuctionSettlementProcessor(dispatch),
    [dispatch, setAuctionSettled],
  )

  const bidFilter = useMemo(
    () =>
      nounsAuctionHouseContract?.filters.AuctionBid(null, null, null, null) ??
      null,
    [nounsAuctionHouseContract],
  )
  const extendedFilter = useMemo(
    () =>
      nounsAuctionHouseContract?.filters.AuctionExtended(null, null) ?? null,
    [nounsAuctionHouseContract],
  )
  const createdFilter = useMemo(
    () =>
      nounsAuctionHouseContract?.filters.AuctionCreated(null, null, null) ??
      null,
    [nounsAuctionHouseContract],
  )
  const settledFilter = useMemo(
    () =>
      nounsAuctionHouseContract?.filters.AuctionSettled(null, null, null) ??
      null,
    [nounsAuctionHouseContract],
  )

  const loadState = useCallback(async () => {
    const currentAuction = await fetchCurrentAuction()
    if (!currentAuction) return

    dispatch(setFullAuction(reduxSafeAuction(currentAuction)))
    dispatch(setLastAuctionNounId(currentAuction.nounId?.toNumber()))

    const previousBids =
      nounsAuctionHouseContract &&
      bidFilter &&
      (await nounsAuctionHouseContract.queryFilter(
        bidFilter,
        0 - BLOCKS_PER_DAY,
      ))

    previousBids &&
      processBidFilter &&
      (await Promise.all(
        previousBids
          .filter((b: TypedEvent) => b.args)
          .map(async (b: TypedEvent) =>
            processBidFilter(b.args[0], b.args[1], b.args[2], b.args[3], b),
          ),
      ))

    bidFilter &&
      processBidFilter &&
      nounsAuctionHouseContract?.on(
        bidFilter,
        async (
          nounId: BigNumber,
          sender: string,
          value: BigNumber,
          extended: boolean,
          event: TypedEvent,
        ) => await processBidFilter(nounId, sender, value, extended, event),
      )

    createdFilter &&
      nounsAuctionHouseContract?.on(
        createdFilter,
        (
          nounId: BigNumber,
          startTime: BigNumber,
          endTime: BigNumber,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          event: TypedEvent,
        ) => processAuctionCreated(nounId, startTime, endTime),
      )

    extendedFilter &&
      nounsAuctionHouseContract?.on(
        extendedFilter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (nounId: BigNumber, endTime: BigNumber, event: TypedEvent) =>
          processAuctionExtended(nounId, endTime),
      )

    settledFilter &&
      nounsAuctionHouseContract?.on(
        settledFilter,
        (
          nounId: BigNumber,
          winner: string,
          amount: BigNumber,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          event: TypedEvent,
        ) => processAuctionSettled(nounId, winner, amount),
      )
  }, [
    dispatch,
    bidFilter,
    createdFilter,
    extendedFilter,
    settledFilter,
    nounsAuctionHouseContract,
    processBidFilter,
    processAuctionCreated,
    processAuctionExtended,
    processAuctionSettled,
    fetchCurrentAuction,
  ])

  useEffect(() => {
    try {
      ;(async () => await loadState())()
    } catch (error) {
      fetchEthersError(error)
    }
  }, [loadState])

  return <></>
}

export default ChainSubscriber
