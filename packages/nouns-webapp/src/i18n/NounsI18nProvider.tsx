/**
 * NounsI18nProvier.tsx is a modified version of https://github.com/Uniswap/interface/blob/main/src/lib/i18n.tsx
 */
import { i18n, Messages } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { en, ja, PluralCategory } from 'make-plural/plurals'
import React, { ReactNode, useEffect } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from './locales'

type LocalePlural = {
  [key in SupportedLocale]: (n: number, ordinal?: boolean) => PluralCategory
}

const plurals: LocalePlural = {
  en: en,
  'en-US': en,
  'en-Us': en,
  ja: ja,
  'ja-JP': ja,
  'ja-Jp': ja,
  pseudo: en,
}

export const wrapPlural = (
  locale: SupportedLocale,
): ((n: number, ordinal?: boolean) => PluralCategory) => {
  const plural = plurals[locale]
  if (plural === undefined) {
    throw new Error(`Unsupported locale: ${locale}`)
  }
  return plural
}

interface Catalog {
  messages?: Messages
}

export const dynamicActivate = async (locale?: SupportedLocale) => {
  if (!locale) return
  i18n.loadLocaleData(locale, { plurals: wrapPlural(locale) })
  try {
    let catalog: {
      messages?: Messages
      default: Catalog
    } | null = null
    try {
      catalog = await import(`../locales/${locale}.js`)
    } catch (error) {
      if (error instanceof Error) {
        console.warn(
          `Could not find locale ${locale}, falling back to ${
            locale.split('-')[0]
          }`,
        )
        catalog = await import(`../locales/${locale.split('-')[0]}.js`)
      } else {
        console.error(
          error instanceof Error ? error.message : `Unknown Error: ${error}`,
        )
      }
    }
    // Bundlers will either export it as default or as a named export named default.
    //  i18n.load(locale, catalog?.messages || catalog?.default.messages)
    // catalog?.messages
    //   ? i18n.load(locale, catalog?.messages)
    //   : (catalog?.default.messages)
    //   && i18n.load(locale, catalog?.default.messages)
    if (catalog?.messages) {
      return i18n.load(locale, catalog?.messages)
    }
    if (catalog?.default.messages) {
      return i18n.load(locale, catalog?.default.messages)
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : `Unknown Error: ${error}`,
    )
  }
  console.info('activating: ', locale)
  i18n.activate(locale)
}

interface ProviderProps {
  locale: SupportedLocale
  forceRenderAfterLocaleChange?: boolean
  onActivate?: (locale: SupportedLocale) => void
  children: ReactNode
}

export const NounsI18nProvider: React.FC<ProviderProps> = ({
  locale,
  forceRenderAfterLocaleChange = true,
  onActivate,
  children,
}: ProviderProps): JSX.Element => {
  useEffect(() => {
    ;(async () => {
      if (!locale) return
      try {
        await dynamicActivate(locale)
        onActivate?.(locale)
      } catch (error) {
        console.error('Failed to activate locale', locale, error)
      }
    })()
  }, [locale, onActivate])

  // Initialize the locale immediately if it is DEFAULT_LOCALE, so that keys are shown while the translation messages load.
  // This renders the translation _keys_, not the translation _messages_, which is only acceptable while loading the DEFAULT_LOCALE,
  // as [there are no "default" messages](https://github.com/lingui/js-lingui/issues/388#issuecomment-497779030).
  // See https://github.com/lingui/js-lingui/issues/1194#issuecomment-1068488619.
  if (!i18n.locale && locale === DEFAULT_LOCALE) {
    i18n.loadLocaleData(DEFAULT_LOCALE, { plurals: wrapPlural(DEFAULT_LOCALE) })
    i18n.load(DEFAULT_LOCALE, {})
    i18n.activate(DEFAULT_LOCALE)
  }

  return (
    <I18nProvider
      forceRenderOnLocaleChange={forceRenderAfterLocaleChange}
      i18n={i18n}
    >
      {children}
    </I18nProvider>
  )
}
