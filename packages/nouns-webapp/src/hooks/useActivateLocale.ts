/**
 * useActiveLocale.ts is a modified version of https://github.com/Uniswap/interface/blob/main/src/hooks/useActiveLocale.ts
 */
import {
  DEFAULT_LOCALE,
  SupportedLocale,
  SUPPORTED_LOCALES,
} from '@/i18n/locales'
import { fromNavigator } from '@lingui/detect-locale'
import { useMemo } from 'react'

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
const parseLocale = (
  maybeSupportedLocale: unknown,
): SupportedLocale | undefined => {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale: string) =>
      locale.toLowerCase() === lowerMaybeSupportedLocale ||
      locale.split('-')[0] === lowerMaybeSupportedLocale,
  )
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
export const getNavigatorLocale = (): SupportedLocale | undefined => {
  if (!navigator.language) return undefined

  const [language, region] = navigator.language.split('-')

  if (region) {
    return (
      parseLocale(`${language}-${region.toUpperCase()}`) ??
      parseLocale(language)
    )
  }

  return parseLocale(language)
}

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
const getStoreLocale = (): SupportedLocale | undefined =>
  localStorage.getItem('lang') ?? undefined

export const initialLocale =
  parseLocale(getStoreLocale()) ?? getNavigatorLocale() ?? DEFAULT_LOCALE

export const useActiveLocale = (): SupportedLocale => {
  const storeLocale = useMemo(() => getStoreLocale(), [])
  const navigatorLocale = useMemo(() => getNavigatorLocale(), [])

  return storeLocale ?? navigatorLocale ?? fromNavigator() ?? DEFAULT_LOCALE
}
