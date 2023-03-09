import { Trans } from '@lingui/macro'
import { useContractFunction } from '@usedapp/core'
import { connectContractToSigner } from '@usedapp/core/dist/cjs/src/hooks'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBN, constants, Contract, utils } from 'ethers'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, Col, FormControl, InputGroup, Spinner } from 'react-bootstrap'
import Countdown, { type CountdownTimeDelta } from 'react-countdown'
import { useWeb3React } from '@web3-react/core'

import {
  NounsAuctionHouseABI,
  NounsAuctionHouseFactory,
  type NounsAuctionHouse,
} from '@nouns/sdk'

import SettleManuallyBtn from '@/components/SettleManuallyBtn'
import WalletConnectModal from '@/components/WalletConnectModal'
import { FOMO_NOUNS_URL, MIN_BID_ETH } from '@/configs'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import { useContractAddresses } from '@/hooks/useAddresses'
import { AlertModal, setAlertModal } from '@/state/slices/application'
import {
  Auction,
  AuctionHouseContractFunction,
  useAuctionMinBidIncPercentage,
} from '@/wrappers/nounsAuction'
import { Locales } from '@/i18n/locales'
import { AUCTION_SETTLEMENT_TIMEOUT } from '@/configs/constants'

// tslint:disable:ordered-imports
import classes from './Bid.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'

interface BidButtonContent {
  loading: boolean
  content: JSX.Element
}

const abi = NounsAuctionHouseABI && new utils.Interface(NounsAuctionHouseABI)

const computeMinimumNextBid = (
  currentBid: BigNumber,
  minBidIncPercentage: BigNumber | undefined,
): BigNumber => {
  if (!minBidIncPercentage) {
    return new BigNumber(0)
  }
  return currentBid
    .times(minBidIncPercentage.div(100).plus(1))
    .decimalPlaces(0, BigNumber.ROUND_UP)
}

const minBidEth = (minBid?: BigNumber): string => {
  if (!minBid || minBid.isZero()) {
    return MIN_BID_ETH
  }

  const eth = utils.formatEther(EthersBN.from(minBid.toString()))
  return new BigNumber(eth).toFixed(2, BigNumber.ROUND_CEIL)
}

const currentBid = (bidInputRef: React.RefObject<HTMLInputElement>) => {
  if (!bidInputRef.current || !bidInputRef.current.value) {
    return new BigNumber(0)
  }
  return new BigNumber(utils.parseEther(bidInputRef.current.value).toString())
}

const Bid: React.FC<{
  auction: Auction
  auctionEnded: boolean
  delay?: number
}> = (props) => {
  const { auction, auctionEnded, delay = AUCTION_SETTLEMENT_TIMEOUT } = props

  const activeAccount = useAppSelector((state) => state.account.activeAccount)
  const { provider } = useWeb3React()
  const { activeChainId } = useAppSelector((state) => state.account)
  const { contractAddresses } = useContractAddresses()

  const countdown = useRef(Date.now() + delay * 1000)
  const countdownRef = React.createRef<Countdown>()

  const activeLocale = useActiveLocale()

  const nounsAuctionHouseFactoryContract =
    new NounsAuctionHouseFactory().attach(
      contractAddresses.nounsAuctionHouseProxy,
    )
  const nounsAuctionHouseContract = new Contract(
    nounsAuctionHouseFactoryContract.address,
    abi,
    provider,
  ) as NounsAuctionHouse

  const signer = useMemo(() => provider?.getSigner(), [provider])
  const signedContract =
    nounsAuctionHouseContract && signer
      ? connectContractToSigner(nounsAuctionHouseContract, undefined, signer)
      : nounsAuctionHouseContract

  const account = useAppSelector((state) => state.account.activeAccount)

  const bidInputRef = useRef<HTMLInputElement>(null)

  const [bidInput, setBidInput] = useState('')

  const [bidButtonContent, setBidButtonContent] = useState<BidButtonContent>({
    loading: false,
    content: <></>,
    // content: auctionEnded ? <Trans>Settle</Trans> : <Trans>Place bid</Trans>,
  })

  const isWinningBidder = useMemo(
    () =>
      activeChainId && auction.bidder?.toLowerCase() === account?.toLowerCase(),
    [activeChainId, auction, account],
  )

  const isWalletConnected = useMemo(
    () => activeAccount !== undefined,
    [activeAccount],
  )

  const handleBidButtonContent = useCallback(
    (state: BidButtonContent) => setBidButtonContent(state),
    [],
  )

  const [showConnectModal, setShowConnectModal] = useState(false)

  const hideModalHandler = useCallback(() => setShowConnectModal(false), [])

  const dispatch = useAppDispatch()
  const setModal = useCallback(
    (modal: AlertModal) => {
      dispatch(setAlertModal(modal))
    },
    [dispatch],
  )

  const minBidIncPercentageCall =
    useAuctionMinBidIncPercentage(contractAddresses)
  const minBidIncPercentage = useMemo(
    () => minBidIncPercentageCall,
    [minBidIncPercentageCall],
  )
  const minBid = useMemo(
    () =>
      minBidIncPercentage &&
      computeMinimumNextBid(
        auction && new BigNumber(auction.amount.toString()),
        minBidIncPercentage,
      ),
    [auction, minBidIncPercentage],
  )

  const minBidEthBN = useMemo(
    () => new BigNumber(utils.parseEther(minBidEth(minBid)).toString()),
    [minBid],
  )

  // console.debug(`Using contract function 'createBid' on signed contract ${signedContract.address}`);
  const { send: placeBid, state: placeBidState } = useContractFunction(
    signedContract,
    AuctionHouseContractFunction.createBid,
  )

  // console.debug(`Using contract function 'settleCurrentAndCreateNewAuction' on signed contract ${signedContract.address}`);
  const { send: settleAuction, state: settleAuctionState } =
    useContractFunction(
      signedContract,
      AuctionHouseContractFunction.settleCurrentAndCreateNewAuction,
    )

  const isStatusMining = useMemo(
    () =>
      placeBidState.status === 'Mining' ||
      settleAuctionState.status === 'Mining' ||
      !activeAccount,
    [placeBidState, settleAuctionState, activeAccount],
  )

  const bidInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value

    // disable more than 2 digits after decimal point
    const result = event.target.value.split('.')?.[1]
    if (input.includes('.') && result && result.length > 2) {
      return
    }

    setBidInput(event.target.value)
  }

  const placeBidHandler = useCallback(async () => {
    if (
      bidButtonContent.loading ||
      !auction ||
      !bidInputRef.current ||
      !bidInputRef.current.value ||
      !minBid
    ) {
      return
    }

    if (currentBid(bidInputRef).isLessThan(minBidEthBN)) {
      setModal({
        show: true,
        title: 'Insufficient bid amount 🤏',
        message: `Please place a bid higher than or equal to the minimum bid amount of ${minBidEth(
          minBid,
        )}${' '}
        ETH`,
      })
      setBidInput(minBidEth(minBid))
      return
    }

    const value =
      bidInputRef?.current &&
      utils.parseEther(bidInputRef.current.value?.toString())

    let gasLimit: EthersBN | undefined
    try {
      gasLimit =
        value && signedContract && signedContract.estimateGas
          ? signedContract.estimateGas.createBid &&
            (await signedContract.estimateGas.createBid(auction.nounId, {
              value,
            }))
          : undefined
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : `Unknown Error: ${error}`
      console.error(errMsg)
      setModal({
        title: 'Error',
        message: 'Insufficient funds for gas 🤏', // TODO: parse error codes
        show: true,
      })
      return
    }

    try {
      await placeBid(auction.nounId, {
        value,
        gasLimit: gasLimit?.add(10_000), // A 10,000 gas pad is used to avoid 'Out of gas' errors
      })
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : `Unknown Error: ${error}`
      console.error(errMsg)
      setModal({
        title: 'Bid Error 😔',
        message: errMsg,
        show: true,
      })
    }
  }, [
    minBidEthBN,
    setModal,
    signedContract,
    auction,
    bidInputRef,
    minBid,
    bidButtonContent,
    placeBid,
  ])

  // const timerRef = useRef<NodeJS.Timer>()
  const [remainingTime, setRemainingTime] = useState<number>(delay)

  const startTimer = useCallback(
    () => void countdownRef.current?.start(),
    [countdownRef],
  )
  const resetTimer = useCallback(
    () => void countdownRef.current?.stop(),
    [countdownRef],
  )

  // const startTimer = () => {
  //   console.debug('starting timer ...')
  //   timerRef.current = setInterval(() => {
  //     setRemainingTime((prevTime) => prevTime - 1)
  //   }, 1000)
  // }

  // const resetTimer = () => {
  //   // clearInterval(timerRef.current)
  //   countdownRef.current?.stop()
  //   setRemainingTime(delay)
  // }

  useEffect(() => {
    if (['None'].includes(settleAuctionState.status)) return

    if (
      remainingTime <= 1 &&
      ['PendingSignature', 'Mining'].includes(settleAuctionState.status)
    ) {
      setModal({
        title: 'Timeout',
        message: `Timed out waiting for auction to settle: ${settleAuctionState.status}`,
        show: true,
      })
      handleBidButtonContent({ loading: false, content: <></> })
      return resetTimer()
    }

    if (['Success', 'Fail', 'Exception'].includes(settleAuctionState.status)) {
      return resetTimer
    }
  }, [remainingTime, settleAuctionState, resetTimer])

  const settleAuctionHandler = useCallback(async () => {
    if (bidButtonContent.loading) return

    try {
      startTimer()
      await settleAuction()
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : `Unknown Error: ${error}`
      console.error(errMsg)
      setModal({
        title: 'Error',
        message: errMsg,
        show: true,
      })
    }
  }, [startTimer, setModal, bidButtonContent, settleAuction])

  const clearBidInput = () => {
    if (bidInputRef.current) {
      bidInputRef.current.value = ''
    }
  }

  // successful bid using redux store state
  useEffect(() => {
    if (!account) return

    // tx state is mining
    const isMiningUserTx = placeBidState.status === 'Mining'
    // allows user to rebid against themselves so long as it is not the same tx
    const isCorrectTx = currentBid(bidInputRef).isEqualTo(
      new BigNumber(auction.amount.toString()),
    )
    if (
      isMiningUserTx &&
      auction.bidder?.toLowerCase() === account?.toLowerCase() &&
      isCorrectTx
    ) {
      placeBidState.status = 'Success'
      setModal({
        title: 'Success',
        message: 'Bid was placed successfully!',
        show: true,
      })
      handleBidButtonContent({
        loading: false,
        content: <Trans>Place bid</Trans>,
      })
      clearBidInput()
    }
  }, [auction, placeBidState, account, setModal])

  const cleanup = useRef(() => {
    setModal({ show: false })
    handleBidButtonContent({ loading: false, content: <></> })
  })

  useEffect(() => {
    const currentCleanup = cleanup.current
    return () => {
      currentCleanup()
    }
  }, [])

  useEffect(() => {
    if (!auctionEnded) return

    if (isWinningBidder) {
      handleBidButtonContent({
        loading: false,
        content: <Trans>Settle Auction</Trans>,
      })
    } else {
      handleBidButtonContent({
        loading: false,
        content: <Trans>Vote for the next Noun ⌐◧-◧</Trans>,
      })
    }
  }, [auctionEnded, isWinningBidder])

  // placing bid transaction state hook
  useEffect(() => {
    switch (!auctionEnded && placeBidState.status) {
      case 'None':
        handleBidButtonContent({
          loading: false,
          content: <Trans>Place bid</Trans>,
        })
        break
      case 'Mining':
        handleBidButtonContent({ loading: true, content: <></> })
        break
      case 'Fail':
        setModal({
          title: 'Transaction Failed',
          message: placeBidState?.errorMessage || 'Please try again.',
          show: true,
        })
        handleBidButtonContent({ loading: false, content: <Trans>Bid</Trans> })
        break
      case 'Exception':
        setModal({
          title: 'Error',
          message: placeBidState?.errorMessage || 'Please try again.',
          show: true,
        })
        handleBidButtonContent({ loading: false, content: <Trans>Bid</Trans> })
        break
    }
  }, [placeBidState, auctionEnded, setModal])

  // settle auction transaction state hook
  useEffect(() => {
    switch (auctionEnded && settleAuctionState.status) {
      case 'None':
        handleBidButtonContent({
          loading: false,
          content: <Trans>Vote for the next Noun ⌐◧-◧</Trans>,
        })
        break
      case 'Mining':
        handleBidButtonContent({ loading: true, content: <></> })
        break
      case 'Success':
        !isWinningBidder &&
          setModal({
            title: 'Success',
            message: 'Settled auction successfully!',
            show: true,
          })
        handleBidButtonContent({
          loading: false,
          content: <Trans>Settle Auction</Trans>,
        })
        settleAuctionState.status = 'None'
        break
      case 'Fail':
        setModal({
          title: 'Transaction Failed',
          message: settleAuctionState?.errorMessage || 'Please try again.',
          show: true,
        })
        handleBidButtonContent({
          loading: false,
          content: <Trans>Settle Auction</Trans>,
        })
        break
      case 'Exception':
        setModal({
          title: 'Error',
          message: settleAuctionState?.errorMessage || 'Please try again.',
          show: true,
        })
        handleBidButtonContent({
          loading: false,
          content: <Trans>Settle Auction</Trans>,
        })
        break
      case 'PendingSignature':
        handleBidButtonContent({ loading: true, content: <></> })
        break
    }
  }, [settleAuctionState, auctionEnded, setModal, isWinningBidder])

  const fomoNounsBtnOnClickHandler = () => {
    // Open Fomo Nouns in a new tab
    window.open(FOMO_NOUNS_URL, '_blank')?.focus()
  }

  const [isCounterRunning, setIsCounterRunning] = useState<boolean | null>(null)

  const handleCounterState = useCallback(
    (state: boolean) => {
      if (!countdownRef.current || countdownRef.current === null) return
      setIsCounterRunning(state)
      if (countdownRef.current.isStarted()) {
        console.debug('starting counter ...')
      }
    },
    [isCounterRunning, countdownRef],
  )

  const onTick = useCallback((delta: CountdownTimeDelta) => {
    // @TODO figure out how to stop the countdown if settleAuctionState.status === 'Success'
    console.debug(`remaining time (${delta.seconds}) ...`)
    setRemainingTime(delta.seconds)
  }, [])

  const onStart = useCallback(() => {
    handleCounterState(true)
    setRemainingTime(delay)
  }, [])

  // opt => (delta:timeDelta: CountdownTimeDelta)
  const onComplete = useCallback(async () => {
    handleCounterState(false)
    setRemainingTime(delay)
  }, [])

  const onStop = useCallback(() => {
    handleCounterState(false)
    setRemainingTime(delay)
  }, [])

  return (
    <>
      <Countdown
        ref={countdownRef}
        date={countdown.current}
        autoStart={false}
        onTick={onTick}
        renderer={() => <></>}
        onStart={onStart}
        onStop={onStop}
        onComplete={onComplete}
      />
      {showConnectModal && activeAccount === undefined && (
        <WalletConnectModal onDismiss={hideModalHandler} />
      )}
      <InputGroup>
        {!auctionEnded && (
          <>
            <span className={classes.customPlaceholderBidAmt}>
              {!auctionEnded && !bidInput && minBid ? (
                <>
                  {constants.EtherSymbol}
                  {minBidEth(minBid)}{' '}
                  <span
                    className={
                      activeLocale === Locales.ja_JP
                        ? responsiveUiUtilsClasses.disableSmallScreens
                        : ''
                    }
                  >
                    <Trans>or more</Trans>
                  </span>
                </>
              ) : (
                ''
              )}
            </span>
            <FormControl
              className={classes.bidInput}
              type="number"
              min="0"
              onChange={bidInputHandler}
              ref={bidInputRef}
              value={bidInput}
            />
          </>
        )}

        {!auctionEnded ? (
          <Button
            className={
              auctionEnded ? classes.bidBtnAuctionEnded : classes.bidBtn
            }
            onClick={async () =>
              auctionEnded
                ? await settleAuctionHandler()
                : await placeBidHandler()
            }
            // disabled={isStatusMining || currentBid(bidInputRef).isLessThan(minBidEthBN)}
            disabled={isStatusMining}
          >
            {bidButtonContent.loading ? (
              <Spinner animation="border" />
            ) : (
              bidButtonContent.content
            )}
          </Button>
        ) : (
          <>
            <Col lg={12} className={classes.voteForNextNounBtnWrapper}>
              <Button
                className={classes.bidBtnAuctionEnded}
                onClick={
                  auction && isWalletConnected && isWinningBidder
                    ? settleAuctionHandler
                    : fomoNounsBtnOnClickHandler
                }
                disabled={bidButtonContent.loading}
              >
                {bidButtonContent.loading ? (
                  <Spinner animation="border" />
                ) : auction && isWalletConnected && isWinningBidder ? (
                  <Trans>Settle Auction</Trans>
                ) : (
                  <Trans>Vote for the next Noun ⌐◧-◧</Trans>
                )}
              </Button>
            </Col>
            {/* Only show force settle button if wallet connected */}
            {auction && isWalletConnected && !isWinningBidder && (
              <Col lg={12}>
                {!bidButtonContent.loading && (
                  <SettleManuallyBtn
                    settleAuctionHandler={settleAuctionHandler}
                    auction={auction}
                  />
                )}
              </Col>
            )}
          </>
        )}
      </InputGroup>
    </>
  )
}
export default Bid
