import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { Trans } from '@lingui/macro'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChainId } from '@usedapp/core'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'

import { SETTLEMENT_TIMEOUT } from '@/configs/constants'
import { useAppSelector } from '@/hooks'
import { Auction } from '@/wrappers/nounsAuction'

import classes from './SettleManuallyBtn.module.css'

const SettleManuallyBtn: React.FC<{
  settleAuctionHandler: () => Promise<void>
  auction: Auction
}> = (props) => {
  const { settleAuctionHandler, auction } = props

  const { activeChainId: chainId } = useAppSelector((state) => state.account)

  const MINS_TO_ENABLE_MANUAL_SETTLEMENT = SETTLEMENT_TIMEOUT

  const [settleEnabled, setSettleEnabled] = useState(false)
  const [auctionTimer, setAuctionTimer] = useState(
    MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60,
  )
  const auctionTimerRef = useRef(auctionTimer) // to access within setTimeout
  auctionTimerRef.current = auctionTimer

  const timerDuration = dayjs.duration(auctionTimerRef.current, 's')

  // timer logic
  useEffect(() => {
    // Allow immediate manual settlement when testing
    if (chainId && chainId !== ChainId.Mainnet) {
      setSettleEnabled(true)
      setAuctionTimer(0)
      return
    }

    // prettier-ignore
    const timeLeft = MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60 - (dayjs().unix() - (auction && Number(auction.endTime)));

    setAuctionTimer(auction && timeLeft)

    if (chainId && auction && timeLeft <= 0) {
      setSettleEnabled(true)
      setAuctionTimer(0)
      return
    } else {
      const timer = setTimeout(() => {
        setAuctionTimer(auctionTimerRef.current - 1)
      }, 1_000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [MINS_TO_ENABLE_MANUAL_SETTLEMENT, auction, auctionTimer, chainId])

  const mins = timerDuration.minutes()

  return (
    <p className={classes.emergencySettleWrapper}>
      <button
        onClick={async () => await settleAuctionHandler()}
        className={classes.emergencySettleButton}
        disabled={!settleEnabled}
      >
        {settleEnabled ? (
          <>
            <Trans>Settle manually</Trans>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faInfoCircle} />
            {mins !== 0 ? (
              <Trans>You can settle manually in {mins + 1} minutes</Trans>
            ) : (
              <Trans>You can settle manually in 1 minute</Trans>
            )}
          </>
        )}
      </button>
    </p>
  )
}

export default SettleManuallyBtn
