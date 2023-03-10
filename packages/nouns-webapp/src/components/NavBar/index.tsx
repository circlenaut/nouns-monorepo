import { Trans } from '@lingui/macro'
import {
  faBookOpen,
  faComments,
  faPlay,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChainId, useEtherBalance } from '@usedapp/core'
import clsx from 'clsx'
import { BigNumber, utils } from 'ethers'
import React, { useState } from 'react'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import NavBarTreasury from '@/components/NavBarTreasury'
import NavDropdown from '@/components/NavDropdown'
import NavLocaleSwitcher from '@/components/NavLocaleSwitcher'
import NavWallet from '@/components/NavWallet'
import { CHAIN_ID, ETH_DECIMAL_PLACES } from '@/configs'
import { useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import useLidoBalance from '@/hooks/useLidoBalance'
import useTokenBuyerBalance from '@/hooks/useTokenBuyerBalance'
import { usePickByState } from '@/utils/colorResponsiveUIUtils'
import { buildEtherscanHoldingsLink } from '@/utils/etherscan'
import { ExternalURL, externalURL } from '@/utils/externalURL'
// import { useTreasuryBalance } from '@/hooks/useTreasuryBalance';

// tslint:disable:ordered-imports
import classes from './NavBar.module.css'
import navDropdownClasses from '@/components/NavWallet/NavBarDropdown.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'

// import Noggles from '@/assets/icons/Noggles.svg'
// import logo from '@/assets/logo.svg'
import testnetNoun from '@/assets/testnet-noun.png'
import noggles from '@/assets/noggles.svg'
// import { ReactComponent as Noggles } from '@/assets/icons/Noggles.svg';

const Noggles: React.FC<{ fill?: string }> = ({
  fill = 'currentColor',
  ...props
}) => (
  <svg viewBox="0 0 24 24" fill={fill} {...props}>
    <path
      d="M19,9h-1h-1h-1h-1h-1v1v1h-1v-1V9h-1h-1h-1H9H8H7v1v1H6H5H4v1v1v1h1v-1v-1h1h1v1v1v1h1h1h1h1h1h1v-1v-1v-1h1v1v1v1h1h1h1h1
  h1h1v-1v-1v-1v-1v-1V9H19z M9,14H8v-1v-1v-1v-1h1h1v1v1v1v1H9z M16,14h-1v-1v-1v-1v-1h1h1v1v1v1v1H16z"
    />
  </svg>
)
const NavBar: React.FC = () => {
  const activeAccount = useAppSelector((state) => state.account.activeAccount)

  const stateBgColor = useAppSelector(
    (state) => state.application.stateBackgroundColor,
  )
  const isCool = useAppSelector((state) => state.application.isCoolBackground)
  const location = useLocation()

  // Setting default address to avoid hook order error on useEtherBalance and useTreasuryBalance
  const { contractAddresses } = useContractAddresses()

  const ethBalance = useEtherBalance(contractAddresses.nounsDaoExecutor)
  const lidoBalanceAsETH = useLidoBalance()
  const tokenBuyerBalanceAsETH = useTokenBuyerBalance()
  const zero = BigNumber.from(0)
  const treasuryBalance =
    ethBalance
      ?.add(lidoBalanceAsETH ?? zero)
      .add(tokenBuyerBalanceAsETH ?? zero) ?? zero

  const daoEtherscanLink = contractAddresses
    ? buildEtherscanHoldingsLink(contractAddresses.nounsDaoExecutor)
    : null

  const [isNavExpanded, setIsNavExpanded] = useState(false)

  const useStateBg =
    (location && location.pathname && location.pathname === '/') ||
    location.pathname?.includes('/noun/') ||
    location.pathname?.includes('/auction/')

  const nonWalletButtonStyle = !useStateBg
    ? NavBarButtonStyle.WHITE_INFO
    : isCool
    ? NavBarButtonStyle.COOL_INFO
    : NavBarButtonStyle.WARM_INFO

  const closeNav = () => setIsNavExpanded(false)

  return (
    <div className={classes.wrapper}>
      <Navbar
        expand="xl"
        style={{ backgroundColor: `${useStateBg ? stateBgColor : 'white'}` }}
        className={classes.navBarCustom}
        expanded={isNavExpanded}
      >
        <Container style={{ maxWidth: 'unset' }}>
          <div className={classes.brandAndTreasuryWrapper}>
            <Navbar.Brand as={Link} to="/" className={classes.navBarBrand}>
              <img
                src={noggles}
                className={classes.navBarLogo}
                alt="Nouns DAO noggles"
              />
            </Navbar.Brand>
            {Number(CHAIN_ID) !== ChainId.Mainnet && (
              <Nav.Item>
                <img
                  className={classes.testnetImg}
                  src={testnetNoun}
                  alt="testnet noun"
                />
                TESTNET
              </Nav.Item>
            )}
            <Nav.Item>
              {daoEtherscanLink && treasuryBalance && (
                <Nav.Link
                  as={Link}
                  to={daoEtherscanLink}
                  className={classes.nounsNavLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <NavBarTreasury
                    treasuryBalance={Number(
                      utils.formatEther(treasuryBalance),
                    ).toFixed(ETH_DECIMAL_PLACES)}
                    treasuryStyle={nonWalletButtonStyle}
                  />
                </Nav.Link>
              )}
            </Nav.Item>
          </div>
          <Navbar.Toggle
            className={classes.navBarToggle}
            aria-controls="basic-navbar-nav"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          />
          <Navbar.Collapse className="justify-content-end">
            <Nav.Link
              as={Link}
              to="/vote"
              className={classes.nounsNavLink}
              onClick={closeNav}
            >
              <NavBarButton
                buttonText={<Trans>DAO</Trans>}
                buttonIcon={<FontAwesomeIcon icon={faUsers} />}
                buttonStyle={nonWalletButtonStyle}
              />
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={externalURL(ExternalURL.nounsCenter)}
              className={classes.nounsNavLink}
              target="_blank"
              rel="noreferrer"
              onClick={closeNav}
            >
              <NavBarButton
                buttonText={<Trans>Docs</Trans>}
                buttonIcon={<FontAwesomeIcon icon={faBookOpen} />}
                buttonStyle={nonWalletButtonStyle}
              />
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={externalURL(ExternalURL.discourse)}
              className={classes.nounsNavLink}
              target="_blank"
              rel="noreferrer"
              onClick={closeNav}
            >
              <NavBarButton
                buttonText={<Trans>Discourse</Trans>}
                buttonIcon={<FontAwesomeIcon icon={faComments} />}
                buttonStyle={nonWalletButtonStyle}
              />
            </Nav.Link>
            <div className={clsx(responsiveUiUtilsClasses.mobileOnly)}>
              <Nav.Link
                as={Link}
                to="/playground"
                className={classes.nounsNavLink}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Playground</Trans>}
                  buttonIcon={<FontAwesomeIcon icon={faPlay} />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/explore"
                className={clsx(classes.nounsNavLink, classes.exploreButton)}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Nouns &amp; Traits</Trans>}
                  buttonIcon={<Noggles />}
                  // buttonIcon={<img src="/assets/icons/Noggles.svg"></img>}
                  // buttonIcon="/assets/icons/Noggles.svg"
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
            </div>
            <div className={clsx(responsiveUiUtilsClasses.desktopOnly)}>
              <NavDropdown
                buttonIcon={<Noggles />}
                // buttonIcon="/assets/icons/Noggles.svg"
                buttonStyle={nonWalletButtonStyle}
              >
                <Dropdown.Item
                  as={Link}
                  className={clsx(
                    usePickByState(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                      location,
                    ),
                  )}
                  to="/explore"
                >
                  Nouns &amp; Traits
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  className={clsx(
                    usePickByState(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                      location,
                    ),
                  )}
                  to="/playground"
                >
                  Playground
                </Dropdown.Item>
              </NavDropdown>
            </div>
            <NavLocaleSwitcher buttonStyle={nonWalletButtonStyle} />
            <NavWallet
              address={activeAccount}
              buttonStyle={nonWalletButtonStyle}
            />{' '}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavBar
