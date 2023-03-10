import { constants } from 'ethers'
import React, { useEffect, useMemo } from 'react'

import Identicon from '@/components/Identicon'
// import { useShareableIsCountdownActive } from '@/state/shared'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useReverseENSLookUp } from '@/utils/ensLookup'
import { useNounsNameService } from '@/wrappers/nounsNameService'
import { toShortAddress } from '@/utils/addressAndChainNameDisplayUtils'
import Web3Name from '../Web3Name'

import { setActiveName } from '@/state/slices/account'
import { useWeb3React } from '@web3-react/core'
import classes from '../ShortAddress/ShortAddress.module.css'

interface DisplayNameProps {
  address: string
  avatar?: boolean
  size?: number
  delay?: number
  renderCountdown?: boolean
  showZero?: boolean
  fetchIsCountdownRunning?: (state: boolean) => void
}
const DisplayName: React.FC<DisplayNameProps> = ({
  address,
  avatar,
  size = 24,
  delay = 5,
  renderCountdown = true,
  fetchIsCountdownRunning,
  showZero = false,
}) => {
  // const { library: provider } = useEthers();
  const { provider } = useWeb3React()
  // onst [displayName, setDisplayName] = useState<string>()
  const dispatch = useAppDispatch()
  const { activeAccount, activeName } = useAppSelector((state) => state.account)
  console.warn('activeName', activeName, activeAccount)

  const nns = useNounsNameService(
    address,
    address === constants.AddressZero || !!activeName,
  )
  const nounsName = useMemo(() => nns, [nns])

  const ens = useReverseENSLookUp(
    address,
    address === constants.AddressZero || !!activeName,
  )
  const ethName = useMemo(() => ens, [ens])
  const name = nounsName || ethName

  // const ensMatchesBlocklistRegex = containsBlockedText(ens || '', 'en');
  const shortAddress = toShortAddress(address)
  console.warn('address', address, nns, ens, shortAddress)

  useEffect(() => {
    if (address === constants.AddressZero && !activeAccount) return
    if (!activeAccount) dispatch(setActiveName(null))

    dispatch(setActiveName(nounsName || ethName || shortAddress))
  }, [dispatch, address, activeAccount, nounsName, ethName, shortAddress])

  if (avatar) {
    return (
      <div className={classes.shortAddress}>
        {avatar && (
          <div key={address}>
            <Identicon size={size} address={address} provider={provider} />
          </div>
        )}
        {/* <span>{ens && !ensMatchesBlocklistRegex ? ens : shortAddress}</span> */}
        {name ? <Web3Name name={name}></Web3Name> : shortAddress}
      </div>
    )
  }

  // return <>{ens && !ensMatchesBlocklistRegex ? ens : shortAddress}</>;
  return (
    <>
      {name ? (
        <Web3Name name={name}></Web3Name>
      ) : !showZero ? (
        shortAddress
      ) : null}
    </>
  )
}

export default DisplayName
