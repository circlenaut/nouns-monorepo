import { constants } from 'ethers'
import React, { useEffect, useMemo, useState } from 'react'

import Identicon from '@/components/Identicon'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  isValidAddressFormat,
  isValidNameFormat,
  toDynamicShortAddress,
  toShortAddress,
} from '@/utils/addressAndChainNameDisplayUtils'
import { useReverseNameServiceLookUp } from '@/utils/nameLookup'
import Web3Name from '../Web3Name'

import { setActiveName } from '@/state/slices/account'
import { useEthers } from '@usedapp/core'
import classes from '../ShortAddress/ShortAddress.module.css'
import { containsBlockedText } from '@/utils/moderation/containsBlockedText'

const MIN_WINDOW_WIDTH = 554

interface DisplayNameProps {
  address: string
  avatar?: boolean
  size?: number
  delay?: number
  renderCountdown?: boolean
  showZero?: boolean
  fetchIsCountdownRunning?: (state: boolean) => void
  showDynamicLength?: boolean
}
const DisplayName: React.FC<DisplayNameProps> = ({
  address,
  avatar,
  size = 24,
  delay = 5,
  renderCountdown = true,
  fetchIsCountdownRunning,
  showZero = false,
  showDynamicLength = false,
}) => {
  const { library: provider } = useEthers()
  const [displayName, setDisplayName] = useState<string>()
  const dispatch = useAppDispatch()
  const { activeAccount, activeName } = useAppSelector((state) => state.account)

  const memoName = useReverseNameServiceLookUp(
    address,
    address === constants.AddressZero ||
      !!activeName ||
      isValidNameFormat(address),
  )
  const name = useMemo(() => memoName, [memoName])

  useEffect(() => {
    if (!provider) return
    ;(async () => {
      !!name && !ensMatchesBlocklistRegex && setDisplayName(name)
    })()
  }, [provider, name])

  const ensMatchesBlocklistRegex = containsBlockedText(name || '', 'en');
  const validAddress = isValidAddressFormat(address)

  const [addressLength, setAddressLength] = useState(
    window.innerWidth > MIN_WINDOW_WIDTH
      ? 4 + (window.innerWidth - MIN_WINDOW_WIDTH)
      : 4,
  )

  const shortAddress =
    address !== constants.AddressZero && validAddress
      ? showZero || addressLength > 0
        ? showDynamicLength
          ? toDynamicShortAddress(address, addressLength)
          : toShortAddress(address)
        : ''
      : ''

  useEffect(() => {
    if (address === constants.AddressZero && !activeAccount) return
    if (!activeAccount) dispatch(setActiveName(null))
    dispatch(setActiveName(displayName || shortAddress))
  }, [dispatch, address, activeAccount, displayName, shortAddress])

  useEffect(() => {
    const handleResize = () => {
      setAddressLength(
        window.innerWidth > MIN_WINDOW_WIDTH
          ? 4 + (window.innerWidth - MIN_WINDOW_WIDTH)
          : 4,
      )
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (avatar) {
    return (
      <div className={classes.shortAddress}>
        {avatar && (
          <div key={address}>
            <Identicon size={size} address={address} provider={provider} />
          </div>
        )}
        {displayName ? <Web3Name name={displayName}></Web3Name> : shortAddress}
      </div>
    )
  }

  return (
    <>
      {(displayName) ? (
        <Web3Name name={displayName}></Web3Name>
      ) : !showZero ? (
        shortAddress
      ) : null}
    </>
  )
}

export default DisplayName
