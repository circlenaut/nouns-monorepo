import React, { useCallback, useMemo } from 'react'

import { useActiveLocale } from '@/hooks/useActivateLocale'
import { DEFAULT_LOCALE, Locales } from '@/i18n/locales'
import {
  isValidENSSuffix,
  isValidNNSSuffix,
  toShortENS,
  toShortNNS,
  toVeryShortENS,
  toVeryShortNNS,
} from '@/utils/addressAndChainNameDisplayUtils'
import { containsBlockedText } from '@/utils/moderation/containsBlockedText'

interface Web3Name {
  name?: string
}

const Web3Name: React.FC<Web3Name> = ({ name }) => {
  const activeLocaleCall = useActiveLocale()
  const activeLocale = useMemo(
    () => activeLocaleCall ?? DEFAULT_LOCALE,
    [activeLocaleCall],
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

  const ensMatchesBlocklistRegex =
    (name && containsBlockedText(name, 'en')) ?? false

  const displayName = useMemo(
    () =>
      name && !ensMatchesBlocklistRegex
        ? isValidNNSSuffix(name)
          ? renderNNS(name)
          : isValidENSSuffix(name)
          ? renderENS(name)
          : null
        : null,
    [name],
  )

  // return <>{!!displayName ? displayName : <Spinner animation="border" />}</>
  return <>{!!displayName ? displayName : <></>}</>
}

export default Web3Name
