import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import { constants } from 'ethers'
import React from 'react'

import { NavBarButtonStyle } from '@/components/NavBarButton'

import classes from './NavBarTreasury.module.css'

interface NavBarTreasuryProps {
  treasuryBalance: string
  treasuryStyle: NavBarButtonStyle
}

const NavBarTreasury: React.FC<NavBarTreasuryProps> = (props) => {
  const { treasuryBalance, treasuryStyle } = props

  let treasuryStyleClass
  switch (treasuryStyle) {
    case NavBarButtonStyle.WARM_INFO:
      treasuryStyleClass = classes.warmInfo
      break
    case NavBarButtonStyle.COOL_INFO:
      treasuryStyleClass = classes.coolInfo
      break
    case NavBarButtonStyle.WHITE_INFO:
    default:
      treasuryStyleClass = classes.whiteInfo
      break
  }

  return (
    <div className={`${classes.wrapper} ${treasuryStyleClass}`}>
      <div className={classes.button}>
        <div
          className="d-flex flex-row justify-content-around"
          style={{
            paddingTop: '1px',
          }}
        >
          <div
            className={clsx(
              classes.treasuryHeader,
              treasuryStyle === NavBarButtonStyle.WHITE_INFO
                ? classes.whiteTreasuryHeader
                : '',
            )}
          >
            <Trans>Treasury</Trans>
          </div>
          <div className={classes.treasuryBalance}>
            {constants.EtherSymbol} {i18n.number(Number(treasuryBalance))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBarTreasury
