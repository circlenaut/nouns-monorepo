import { Trans } from '@lingui/macro'
import Davatar from '@davatar/react'
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import clsx from 'clsx'
import React, { MouseEventHandler, useCallback, useMemo, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useEthers } from '@usedapp/core'

import {
  getNavBarButtonVariant,
  NavBarButtonStyle,
} from '@/components/NavBarButton'
import WalletConnectModal from '@/components/WalletConnectModal'
import { usePickByState } from '@/utils/colorResponsiveUIUtils'
import WalletConnectButton from './WalletConnectButton'
import ShortAddress from '../ShortAddress'
import { useAppSelector } from '@/hooks'
import DisplayName from '../DisplayName'

// tslint:disable:ordered-imports
import classes from './NavWallet.module.css'
import navDropdownClasses from '@/components/NavWallet/NavBarDropdown.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'

interface NavWalletProps {
  address?: string
  buttonStyle?: NavBarButtonStyle
}

type Props = {
  onClick: MouseEventHandler<HTMLDivElement>
  value: string
}

type RefType = number

type CustomMenuProps = {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  labeledBy?: string
}

const NavWallet: React.FC<NavWalletProps> = (props) => {
  const { address, buttonStyle } = props

  const [buttonUp, setButtonUp] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  // const [showConnectModalCards, setShowConnectModalCards] = useState(false);
  const location = useLocation()

  const { library: provider } = useEthers()
  const { connector } = useWeb3React()
  const { activeAccount } = useAppSelector((state) => state.account)

  const setModalStateHandler = (state: boolean) => {
    setShowConnectModal(state)
  }

  // const setModalDisplayHandler = (state: boolean) => {
  //   setShowConnectModalCards(state);
  // };

  const handleWalletDeactivation = useCallback(
    () =>
      connector?.deactivate
        ? void connector?.deactivate()
        : void connector?.resetState(),
    [connector],
  )

  const switchWalletHandler = useCallback(() => {
    setButtonUp(false)
    // handleWalletDeactivation();
    // setShowConnectModal(false);
    setShowConnectModal(true)
    // setShowConnectModalCards(true);
  }, [])

  const disconectWalletHandler = useCallback(() => {
    setShowConnectModal(false)
    setButtonUp(false)
    handleWalletDeactivation()
  }, [handleWalletDeactivation])

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

  const mobileTextColor = usePickByState(
    'rgba(140, 141, 146, 1)',
    'rgba(121, 128, 156, 1)',
    'rgba(142, 129, 127, 1)',
    location,
  )

  const mobileBorderColor = usePickByState(
    'rgba(140, 141, 146, .5)',
    'rgba(121, 128, 156, .5)',
    'rgba(142, 129, 127, .5)',
    location,
  )

  const connectWalletButtonStyle = usePickByState(
    NavBarButtonStyle.WHITE_WALLET as unknown as string,
    NavBarButtonStyle.COOL_WALLET as unknown as string,
    NavBarButtonStyle.WARM_WALLET as unknown as string,
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
          onKeyDown={(e?) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              // onClick(e)
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={navDropdownClasses.button}>
            <div className={classes.icon}>
              {' '}
              {address && (
                <Davatar size={21} address={address} provider={provider} />
              )}
            </div>
            <div className={navDropdownClasses.dropdownBtnContent}>
              {address && <ShortAddress address={address} />}
              {/* {address && <DisplayName address={address} />} */}
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
          <div>
            <div
              onClick={switchWalletHandler}
              onKeyDown={switchWalletHandler}
              role="button"
              tabIndex={0}
              className={clsx(
                classes.dropDownTop,
                navDropdownClasses.button,
                navDropdownClasses.dropdownPrimaryText,
                usePickByState(
                  navDropdownClasses.whiteInfoSelectedTop,
                  navDropdownClasses.coolInfoSelected,
                  navDropdownClasses.warmInfoSelected,
                  location,
                ),
              )}
            >
              <Trans>Switch wallet</Trans>
            </div>

            <div
              onClick={disconectWalletHandler}
              onKeyDown={disconectWalletHandler}
              role="button"
              tabIndex={0}
              className={clsx(
                classes.dropDownBottom,
                navDropdownClasses.button,
                usePickByState(
                  navDropdownClasses.whiteInfoSelectedBottom,
                  navDropdownClasses.coolInfoSelected,
                  navDropdownClasses.warmInfoSelected,
                  location,
                ),
                classes.disconnectText,
              )}
            >
              <Trans>Disconnect</Trans>
            </div>
          </div>
        </div>
      )
    },
  )
  CustomMenu.displayName = 'CustomMenu'

  const walletConnectedContentMobile = (
    <div
      className={clsx(
        navDropdownClasses.nounsNavLink,
        responsiveUiUtilsClasses.mobileOnly,
      )}
    >
      <div
        className={'d-flex flex-row justify-content-between'}
        style={{
          justifyContent: 'space-between',
        }}
      >
        <div className={navDropdownClasses.connectContentMobileWrapper}>
          <div
            className={clsx(
              navDropdownClasses.wrapper,
              getNavBarButtonVariant(buttonStyle),
            )}
          >
            <div className={navDropdownClasses.button}>
              <div className={classes.icon}>
                {' '}
                {address && (
                  <Davatar size={21} address={address} provider={provider} />
                )}
              </div>
              <div className={navDropdownClasses.dropdownBtnContent}>
                {address && <ShortAddress address={address} />}
                {/* {address && <DisplayName address={address} />} */}
              </div>
            </div>
          </div>
        </div>

        <div className={`d-flex flex-row  ${classes.connectContentMobileText}`}>
          <div
            style={{
              borderRight: `1px solid ${mobileBorderColor}`,
              color: mobileTextColor,
            }}
            className={classes.mobileSwitchWalletText}
            onClick={switchWalletHandler}
            onKeyDown={switchWalletHandler}
            role="button"
            tabIndex={0}
          >
            <Trans>Switch</Trans>
          </div>
          <div
            className={classes.disconnectText}
            onClick={disconectWalletHandler}
            onKeyDown={disconectWalletHandler}
            role="button"
            tabIndex={0}
          >
            <Trans>Sign out</Trans>
          </div>
        </div>
      </div>
    </div>
  )

  const walletConnectedContentDesktop = (
    <Dropdown
      className={clsx(
        navDropdownClasses.nounsNavLink,
        responsiveUiUtilsClasses.desktopOnly,
      )}
      onToggle={() => setButtonUp(!buttonUp)}
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
  )

  return (
    <>
      {showConnectModal && (
        <WalletConnectModal
          onDismiss={() => setModalStateHandler(false)}
          autoConnect={activeAccount !== undefined}
        />
      )}
      {activeAccount ? (
        <>
          {walletConnectedContentDesktop}
          {walletConnectedContentMobile}
        </>
      ) : (
        <WalletConnectButton
          className={clsx(
            navDropdownClasses.nounsNavLink,
            navDropdownClasses.connectBtn,
          )}
          onClickHandler={() => setModalStateHandler(true)}
          buttonStyle={connectWalletButtonStyle as unknown as NavBarButtonStyle}
        />
      )}
    </>
  )
}

export default NavWallet
