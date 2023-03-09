import { useContractAddresses } from '@/hooks/useAddresses'
import { toShortAddress } from '@/utils/addressAndChainNameDisplayUtils'
import { useReverseENSLookUp } from '@/utils/ensLookup'
import { containsBlockedText } from '@/utils/moderation/containsBlockedText'
import { resolveNounContractAddress } from '@/utils/resolveNounsContractAddress'
import { useEthers } from '@usedapp/core'
import React from 'react'
import Identicon from '../Identicon'
import classes from './ShortAddress.module.css'

const ShortAddress: React.FC<{
  address: string
  avatar?: boolean
  size?: number
}> = (props) => {
  const { address, avatar, size = 24 } = props
  const { library: provider } = useEthers()

  const { contractAddresses } = useContractAddresses()

  const ens =
    useReverseENSLookUp(address) ||
    resolveNounContractAddress(address, contractAddresses)
  const ensMatchesBlocklistRegex = containsBlockedText(ens || '', 'en')
  const shortAddress = toShortAddress(address)

  if (avatar) {
    return (
      <div className={classes.shortAddress}>
        {avatar && (
          <div key={address}>
            <Identicon size={size} address={address} provider={provider} />
          </div>
        )}
        <span>{ens && !ensMatchesBlocklistRegex ? ens : shortAddress}</span>
      </div>
    )
  }

  return <>{ens && !ensMatchesBlocklistRegex ? ens : shortAddress}</>
}

export default ShortAddress
