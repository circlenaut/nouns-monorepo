import React, { useMemo } from 'react'

import { containsBlockedText } from '@/utils/moderation/containsBlockedText'
import { useReverseNameServiceLookUp } from '@/utils/nameLookup'

interface NnsOrEnsOrLongAddressProps {
  address: string
}

/**
 * Resolves ENS for address if one exists, otherwise falls back to full address
 */
const NnsOrEnsOrLongAddress: React.FC<NnsOrEnsOrLongAddressProps> = ({
  address,
}) => {
  const nameMemo = useReverseNameServiceLookUp(address)
  const name = useMemo(() => nameMemo, [nameMemo])
  const ensMatchesBlocklistRegex = containsBlockedText(name || '', 'en')
  return <>{name && !ensMatchesBlocklistRegex ? name : address}</>
}

export default NnsOrEnsOrLongAddress
