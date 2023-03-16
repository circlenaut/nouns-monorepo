import { containsBlockedText } from '@/utils/moderation/containsBlockedText'
import { useReverseNameServiceLookUp } from '@/utils/nameLookup'
import React from 'react'

interface NnsOrEnsOrLongAddressProps {
  address: string
}

/**
 * Resolves ENS for address if one exists, otherwise falls back to full address
 */
const NnsOrEnsOrLongAddress: React.FC<NnsOrEnsOrLongAddressProps> = ({
  address,
}) => {
  const name = useReverseNameServiceLookUp(address)
  const ensMatchesBlocklistRegex = containsBlockedText(name || '', 'en')
  return <>{name && !ensMatchesBlocklistRegex ? name : address}</>
}

export default NnsOrEnsOrLongAddress
