/**
 * LanguageProvider.tsx is a modified version of https://github.com/Uniswap/interface/blob/main/src/lib/i18n.tsx
 */
import React, { ReactNode, useCallback } from 'react'

import { initialLocale, useActiveLocale } from '@/hooks/useActivateLocale'
import { SupportedLocale } from '@/i18n/locales'
import { dynamicActivate, NounsI18nProvider } from '@/i18n/NounsI18nProvider'

dynamicActivate(initialLocale)

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode
}) => {
  const locale = useActiveLocale()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      dynamicActivate(locale)
    },
    [locale, dynamicActivate],
  )

  return (
    <NounsI18nProvider
      locale={locale}
      forceRenderAfterLocaleChange={true}
      onActivate={onActivate}
    >
      {children}
    </NounsI18nProvider>
  )
}
