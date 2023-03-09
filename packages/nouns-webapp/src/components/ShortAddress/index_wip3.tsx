import { useEthers } from '@usedapp/core'
import { constants, utils } from 'ethers'
import React, { useEffect, useMemo, useState } from 'react'

import Identicon from '@/components/Identicon'
// import { useShareableIsCountdownActive } from '@/state/shared'
import { useReverseENSLookUp } from '@/utils/ensLookup'
import { useNounsNameService } from '@/wrappers/nounsNameService'
import {
  isValidNameFormat,
  toShortAddress,
} from '../../utils/addressAndChainNameDisplayUtils'
import Web3Name from '../Web3Name'

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
  showZero = false,
}) => {
  const { library: provider } = useEthers()

  const [validAddress, setValidAddress] = useState<string>(
    constants.AddressZero,
  )

  const shortAddress = toShortAddress(validAddress)

  const ensCall = useReverseENSLookUp(
    validAddress,
    validAddress === constants.AddressZero,
  )
  const ethName = useMemo(() => ensCall, [ensCall])

  const nnsCall = useNounsNameService(
    validAddress,
    validAddress === constants.AddressZero,
  )
  const nounsName = useMemo(() => nnsCall, [nnsCall])
  const name = nounsName || ethName
  useEffect(() => {
    try {
      !isValidNameFormat(address) && setValidAddress(utils.getAddress(address))
    } catch (error) {}
  }, [address])

  if (avatar) {
    return (
      <div className={classes.shortAddress}>
        {avatar && (
          <div key={address}>
            <Identicon size={size} address={address} provider={provider} />
          </div>
        )}
        {name ? <Web3Name name={name}></Web3Name> : <span>{shortAddress}</span>}
      </div>
    )
  }

  return (
    <>
      {name ? <Web3Name name={name}></Web3Name> : <span>{shortAddress}</span>}
    </>
  )
}

export default ShortAddress
