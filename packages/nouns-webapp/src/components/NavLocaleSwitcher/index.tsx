import { Trans } from '@lingui/macro'
import {
  faCheck,
  faGlobe,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import React, { UIEvent, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

import LanguageSelectionModal from '@/components/LanguageSelectionModal'
import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import {
  LOCALE_LABEL,
  SupportedLocale,
  SUPPORTED_LOCALES,
} from '@/i18n/locales'
import { setLocale } from '@/i18n/setLocale'
import { usePickByState } from '@/utils/colorResponsiveUIUtils'

// tslint:disable:ordered-imports
import classes from './NavLocalSwitcher.module.css'
import navDropdownClasses from '@/components/NavWallet/NavBarDropdown.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'

interface NavLocalSwitcherProps {
  buttonStyle?: NavBarButtonStyle
}

type Props = {
  onClick: (e: UIEvent) => void
  value: string
}

type RefType = number

type CustomMenuProps = {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  labeledBy?: string
}

const NavLocaleSwitcher: React.FC<NavLocalSwitcherProps> = (props) => {
  const { buttonStyle } = props

  const [buttonUp, setButtonUp] = useState(false)
  const location = useLocation()
  const [showLanguagePickerModal, setShowLanguagePickerModal] = useState(false)
  const activeLocale = useActiveLocale()

  const statePrimaryButtonClass = usePickByState(
    navDropdownClasses.whiteInfo,
    navDropdownClasses.coolInfo,
    navDropdownClasses.warmInfo,
    location,
  )

  const stateSelectedDropdownClass = usePickByState(
    navDropdownClasses.whiteInfoSelected,
    navDropdownClasses.dropdownActive,
    navDropdownClasses.dropdownActive,
    location,
  )

  const buttonStyleTop = usePickByState(
    navDropdownClasses.whiteInfoSelectedTop,
    navDropdownClasses.coolInfoSelected,
    navDropdownClasses.warmInfoSelected,
    location,
  )

  const buttonStyleBottom = usePickByState(
    navDropdownClasses.whiteInfoSelectedBottom,
    navDropdownClasses.coolInfoSelected,
    navDropdownClasses.warmInfoSelected,
    location,
  )

  const customDropdownToggle = React.forwardRef<RefType, Props>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ onClick, value }, ref) => (
      <>
        <div
          className={clsx(
            navDropdownClasses.wrapper,
            buttonUp ? stateSelectedDropdownClass : statePrimaryButtonClass,
          )}
          onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
          onKeyDown={(e) => e.key === 'Enter' && onClick(e)}
          role="button"
          tabIndex={0}
        >
          <div className={navDropdownClasses.button}>
            <div className={navDropdownClasses.dropdownBtnContent}>
              {<FontAwesomeIcon icon={faGlobe} />}
            </div>
            <div
              className={
                buttonUp
                  ? navDropdownClasses.arrowUp
                  : navDropdownClasses.arrowDown
              }
            >
              <FontAwesomeIcon icon={buttonUp ? faSortUp : faSortDown} />{' '}
            </div>
          </div>
        </div>
      </>
    ),
  )
  customDropdownToggle.displayName = 'customDropdownToggle'

  const CustomMenu = React.forwardRef(
    (props: CustomMenuProps, ref: React.Ref<HTMLDivElement>) => {
      return (
        <div
          ref={ref}
          style={props.style}
          className={props.className}
          aria-labelledby={props.labeledBy}
        >
          {SUPPORTED_LOCALES.map((locale: SupportedLocale, index: number) => {
            let dropDownStyle
            let buttonStyle

            switch (index) {
              case 0:
                dropDownStyle = classes.dropDownTop
                buttonStyle = buttonStyleTop
                break
              case SUPPORTED_LOCALES.length - 1:
                dropDownStyle = classes.dropDownBottom
                buttonStyle = buttonStyleBottom
                break
              default:
                dropDownStyle = classes.dropDownInterior
                buttonStyle = buttonStyleBottom
            }

            return (
              <div
                key={locale}
                className={clsx(
                  navDropdownClasses.button,
                  navDropdownClasses.dropdownPrimaryText,
                  buttonStyle,
                  dropDownStyle,
                  classes.desktopLanguageButton,
                )}
                onClick={() => setLocale(locale)}
                onKeyDown={() => setLocale(locale)}
                role="button"
                tabIndex={0}
              >
                {LOCALE_LABEL[locale]}
                {activeLocale === locale && (
                  <FontAwesomeIcon icon={faCheck} height={24} width={24} />
                )}
              </div>
            )
          })}
        </div>
      )
    },
  )
  CustomMenu.displayName = 'CustomMenu'

  return (
    <>
      {showLanguagePickerModal && (
        <LanguageSelectionModal
          onDismiss={() => setShowLanguagePickerModal(false)}
        />
      )}

      <div
        className={clsx(
          navDropdownClasses.nounsNavLink,
          responsiveUiUtilsClasses.mobileOnly,
        )}
        onClick={() => setShowLanguagePickerModal(true)}
        onKeyDown={() => setShowLanguagePickerModal(true)}
        role="button"
        tabIndex={0}
      >
        <NavBarButton
          buttonText={<Trans>Language</Trans>}
          buttonIcon={<FontAwesomeIcon icon={faGlobe} />}
          buttonStyle={buttonStyle}
        />
      </div>

      <Dropdown
        className={clsx(
          navDropdownClasses.nounsNavLink,
          responsiveUiUtilsClasses.desktopOnly,
        )}
        onToggle={() => setButtonUp(!buttonUp)}
        autoClose={true}
      >
        <Dropdown.Toggle
          as={customDropdownToggle}
          id="dropdown-custom-components"
        />
        <Dropdown.Menu
          className={`${navDropdownClasses.desktopDropdown} `}
          as={CustomMenu}
        />
      </Dropdown>
    </>
  )
}

export default NavLocaleSwitcher
