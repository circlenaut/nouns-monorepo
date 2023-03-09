import React, { useRef } from 'react'

import { useReadonlyProvider } from '@/hooks/useReadonlyProvider'
import { toShortAddress } from '@/utils/addressAndChainNameDisplayUtils'
import Identicon from '../Identicon'

import { constants } from 'ethers'
import classes from './ShortAddress.module.css'

const ShortAddress: React.FC<{
  address: string
  avatar?: boolean
  size?: number
  showZero?: boolean
}> = (props) => {
  const { address, avatar, size = 24, showZero = false } = props
  const provider = useRef(useReadonlyProvider())

  const shortAddress = toShortAddress(
    address === constants.AddressZero && showZero ? constants.AddressZero : '',
  )

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
