import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Trans } from '@lingui/macro'
import React from 'react'

import Modal from '@/components/Modal'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import {
  LOCALE_LABEL,
  SupportedLocale,
  SUPPORTED_LOCALES,
} from '@/i18n/locales'
import { setLocale } from '@/i18n/setLocale'

import classes from './LanguageSelectionModal.module.css'

interface LanguageSelectionModalProps {
  onDismiss: () => void
}

/**
 * Note: This is only used on mobile. On desktop, language is selected via a dropdown.
 */
const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = (
  props,
) => {
  const { onDismiss } = props
  const activeLocale = useActiveLocale()

  const modalContent = (
    <div className={classes.LanguageSelectionModal}>
      {SUPPORTED_LOCALES.map((locale: SupportedLocale) => {
        return (
          <div
            className={classes.languageButton}
            key={locale}
            role="button"
            tabIndex={0}
            onClick={() => {
              setLocale(locale)
              onDismiss()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                setLocale(locale)
                onDismiss()
              }
            }}
          >
            {LOCALE_LABEL[locale]}
            {locale === activeLocale && (
              <FontAwesomeIcon
                icon={faCheck}
                height={24}
                width={24}
                className={classes.icon}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <Modal
      title={<Trans>Select Language</Trans>}
      content={modalContent}
      onDismiss={onDismiss}
    />
  )
}
export default LanguageSelectionModal
