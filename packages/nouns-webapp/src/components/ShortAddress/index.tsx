import { useReadonlyProvider } from '@/hooks/useReadonlyProvider'
import {
  isValidAddressFormat,
  toDynamicShortAddress,
  toShortAddress,
} from '@/utils/addressAndChainNameDisplayUtils'
import { constants } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import Identicon from '../Identicon'
import classes from './ShortAddress.module.css'

const MIN_WINDOW_WIDTH = 554

const ShortAddress: React.FC<{
  address: string
  avatar?: boolean
  size?: number
  showZero?: boolean
  showDynamicLength?: boolean
}> = ({
  address,
  avatar,
  size = 24,
  showZero = false,
  showDynamicLength = false,
}) => {
  const provider = useRef(useReadonlyProvider())

  const validAddress = isValidAddressFormat(address)

  const [addressLength, setAddressLength] = useState(
    window.innerWidth > MIN_WINDOW_WIDTH
      ? 4 + (window.innerWidth - MIN_WINDOW_WIDTH)
      : 4,
  )

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

  const shortAddress =
    address !== constants.AddressZero && validAddress
      ? showZero || addressLength > 0
        ? showDynamicLength
          ? toDynamicShortAddress(address, addressLength)
          : toShortAddress(address)
        : ''
      : ''

  if (avatar) {
    return (
      <div className={classes.shortAddress}>
        {avatar && (
          <div key={address}>
            <Identicon
              size={size}
              address={address}
              provider={provider.current}
            />
          </div>
        )}
        <span>{shortAddress}</span>
      </div>
    )
  }

  return <>{shortAddress}</>
}

export default ShortAddress
