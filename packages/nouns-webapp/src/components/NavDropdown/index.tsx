import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import React, { UIEvent, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import { usePickByState } from '@/utils/colorResponsiveUIUtils'

// tslint:disable:ordered-imports
import classes from './NavDropdown.module.css'
import navDropdownClasses from '@/components/NavWallet/NavBarDropdown.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'

interface NavDropDownProps {
  buttonStyle?: NavBarButtonStyle
  buttonIcon?: React.ReactNode
  children?: React.ReactNode
}

type Props = {
  onClick: (e: UIEvent) => void
  value: string
}

type RefType = number

const NavDropDown: React.FC<NavDropDownProps> = (props) => {
  const { buttonStyle } = props

  const [buttonUp, setButtonUp] = useState(false)
  const location = useLocation()

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

  const customDropdownToggle: React.FC<Props> = React.forwardRef<
    RefType,
    Props
  >(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ onClick, value }, ref) => (
      <>
        <div
          className={clsx(classes.wrapper)}
          onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
          onKeyDown={(e) => e.key === 'Enter' && onClick(e)}
          role="button"
          tabIndex={0}
        >
          <NavBarButton
            buttonText={<Trans>Explore</Trans>}
            buttonIcon={props.buttonIcon}
            buttonStyle={buttonStyle}
            isDropdown={true}
            isButtonUp={buttonUp}
          />
        </div>
      </>
    ),
  )
  customDropdownToggle.displayName = 'customDropdownToggle'

  return (
    <>
      <Dropdown
        className={clsx(
          classes.dropdownButton,
          navDropdownClasses.nounsNavLink,
          responsiveUiUtilsClasses.desktopOnly,
        )}
        onToggle={() => setButtonUp(!buttonUp)}
        autoClose={true}
      >
        <Dropdown.Toggle as={customDropdownToggle} id="dropdown" />
        <Dropdown.Menu
          className={clsx(
            classes.menu,
            stateSelectedDropdownClass,
            buttonUp ? stateSelectedDropdownClass : statePrimaryButtonClass,
          )}
        >
          {props.children}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default NavDropDown
