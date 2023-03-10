import { useEthers } from '@usedapp/core'
import { constants, utils } from 'ethers'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import Countdown, {
  type CountdownRenderProps,
  type CountdownTimeDelta,
} from 'react-countdown'

import Identicon from '@/components/Identicon'
// import { useShareableIsCountdownActive } from '@/state/shared'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import { Locales } from '@/i18n/locales'
import { useReverseENSLookUp } from '@/utils/ensLookup'
import { containsBlockedText } from '@/utils/moderation/containsBlockedText'
import { useNounsNameService } from '@/wrappers/nounsNameService'
import {
  isValidNameFormat,
  toShortAddress,
  toShortENS,
  toShortNNS,
  toVeryShortAddress,
  toVeryShortENS,
  toVeryShortNNS,
} from '@/utils/addressAndChainNameDisplayUtils'

import classes from './ShortAddress.module.css'

interface ShortAddressProps {
  address: string
  avatar?: boolean
  size?: number
  delay?: number
  renderCountdown?: boolean
  showZero?: boolean
  fetchIsCountdownRunning?: (state: boolean) => void
}

const ShortAddress: React.FC<ShortAddressProps> = ({
  address,
  avatar,
  size = 24,
  delay = 5,
  renderCountdown = true,
  fetchIsCountdownRunning,
  showZero = true,
}) => {
  // const fetchIsLoading = useCallback((state: boolean) => {
  // }, [])

  // return (<Web3Name
  //   name={address}
  // ></Web3Name>)
  const { library: provider } = useEthers()

  const activeLocale = useActiveLocale()

  // const { setIsCountdownActive } = useBetween(useShareableIsCountdownActive)

  const [validAddress, setValidAddress] = useState<string>(
    constants.AddressZero,
  )
  const [displayName, setDisplayName] = useState<string | null | undefined>(
    null,
  )

  const [remainingTime, setRemainingTime] = useState<number>(delay)
  const [isCountdownComplete, setIsCountdownComplete] = useState(true)

  const shortAddressCall = useMemo(
    () => toShortAddress(validAddress),
    [validAddress],
  )
  const shortAddress = useMemo(() => shortAddressCall, [shortAddressCall])

  const countdown = useRef(Date.now() + delay * 1000)
  const countdownRef = React.createRef<Countdown>()

  const ensCall = useReverseENSLookUp(validAddress)
  const ethName = useMemo(() => ensCall, [ensCall])

  const nnsCall = useNounsNameService(validAddress)
  const nounsName = useMemo(() => nnsCall, [nnsCall])

  const renderAddress = useCallback(
    (addr: string) =>
      activeLocale === Locales.ja_JP ? toVeryShortAddress(addr) : shortAddress,
    [activeLocale, shortAddress],
  )

  const renderENS = useCallback(
    (ens: string) =>
      activeLocale === Locales.ja_JP ? toVeryShortENS(ens) : toShortENS(ens),
    [activeLocale],
  )

  const renderNNS = useCallback(
    (nns: string) =>
      activeLocale === Locales.ja_JP ? toVeryShortNNS(nns) : toShortNNS(nns),
    [activeLocale],
  )

  useEffect(() => {
    try {
      !isValidNameFormat(address) && setValidAddress(utils.getAddress(address))
    } catch (error) {}
  }, [address])

  useEffect(() => {
    setDisplayName(address)
    const name = nounsName
      ? renderNNS(nounsName)
      : ethName
      ? renderENS(ethName)
      : null
    const ensMatchesBlocklistRegex = containsBlockedText(name || '', 'en')
    if (!ensMatchesBlocklistRegex && isValidNameFormat(nounsName || ethName)) {
      setDisplayName(name)
      fetchIsCountdownRunning && fetchIsCountdownRunning(false)
    }
  }, [nounsName, ethName])

  const handleIsCounterActiveState = useCallback(
    (state: boolean) => {
      if (!countdownRef.current || countdownRef.current === null) return
      // setIsCountdownActive(state)
      fetchIsCountdownRunning && fetchIsCountdownRunning(state)
    },
    [countdownRef, displayName, fetchIsCountdownRunning],
  )

  useEffect(() => {
    console.debug(`ShortAddress: counting down(${remainingTime}) ...`)
    if (remainingTime <= 1) {
      console.debug('Countdown done')
    }
  }, [remainingTime])

  useEffect(
    () =>
      isCountdownComplete && fetchIsCountdownRunning
        ? fetchIsCountdownRunning(false)
        : undefined,
    [isCountdownComplete],
  )

  // @NOTE: Don't change this function's name => breaks Countdown
  const Completionist = useCallback(() => {
    return (
      <span
        className={classes.shortAddress}
        key={validAddress}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {avatar && validAddress !== constants.AddressZero && (
          <span style={{ marginRight: '8px' }}>
            <Identicon size={size} address={validAddress} provider={provider} />
          </span>
        )}
        <span
          style={{
            minWidth: '80px',
            display: 'inline-block',
            marginLeft: avatar ? '0px' : '-2px',
          }}
        >
          {!!displayName
            ? displayName
            : validAddress !== constants.AddressZero || showZero
            ? renderAddress(validAddress)
            : null}
        </span>
      </span>
    )
  }, [validAddress, displayName, provider, avatar, showZero])

  const renderer = (props: CountdownRenderProps) => {
    // eslint-disable-next-line react/prop-types
    const { completed } = props
    if (completed) {
      return <Completionist />
    }
    return <Spinner animation="border" />
  }

  const onTick = useCallback((delta: CountdownTimeDelta) => {
    setRemainingTime(delta.seconds)
  }, [])

  const onStart = useCallback(() => {
    handleIsCounterActiveState(true)
    setRemainingTime(delay)
    setIsCountdownComplete(false)
  }, [])

  // opt => (delta:timeDelta: CountdownTimeDelta)
  const onComplete = useCallback(async () => {
    handleIsCounterActiveState(false)
    setRemainingTime(delay)
    setIsCountdownComplete(true)
  }, [])

  const onStop = useCallback(() => {
    handleIsCounterActiveState(false)
    setRemainingTime(delay)
  }, [])

  return (
    <>
      {renderCountdown && !displayName ? (
        <Countdown
          ref={countdownRef}
          date={countdown.current}
          autoStart={true}
          onTick={onTick}
          renderer={renderer}
          onStart={onStart}
          onStop={onStop}
          onComplete={onComplete}
        />
      ) : (
        <Completionist />
      )}
    </>
  )
}

ShortAddress.propTypes = {
  address: PropTypes.any,
  avatar: PropTypes.any,
  delay: PropTypes.number,
  fetchIsCountdownRunning: PropTypes.func,
  renderCountdown: PropTypes.bool,
  size: PropTypes.number,
}

export default ShortAddress
