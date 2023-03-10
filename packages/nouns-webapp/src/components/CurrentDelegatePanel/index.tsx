import { Trans } from '@lingui/macro'
import React, { useMemo } from 'react'

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton'
import ShortAddress from '@/components/ShortAddress'
import { useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useUserDelegatee, useUserNounTokenBalance } from '@/wrappers/nounToken'
import { toShortAddress } from '@/utils/addressAndChainNameDisplayUtils'

import classes from './CurrentDelegatePanel.module.css'

interface CurrentDelegatePanelProps {
  onPrimaryBtnClick: () => void
  onSecondaryBtnClick: () => void
}

const CurrentDelegatePanel: React.FC<CurrentDelegatePanelProps> = (props) => {
  const { onPrimaryBtnClick, onSecondaryBtnClick } = props
  const { contractAddresses } = useContractAddresses()

  const { activeAccount: maybeAccount } = useAppSelector(
    (state) => state.account,
  )

  const delegateCall = useUserDelegatee(contractAddresses)
  const delegate = useMemo(() => delegateCall, [delegateCall])
  const account = delegate ?? maybeAccount ?? ''
  const shortAccount = toShortAddress(account)

  const hasNounBalanceCall =
    (useUserNounTokenBalance(contractAddresses) ?? 0) > 0
  const hasNounBalance = useMemo(() => hasNounBalanceCall, [hasNounBalanceCall])

  return (
    <div className={classes.wrapper}>
      <div>
        <div className={classes.header}>
          <h1 className={classes.title}>
            <Trans>Delegation</Trans>
          </h1>

          <p className={classes.copy}>
            <Trans>
              Noun votes are not transferable, but are{' '}
              <span className={classes.emph}>delegatable</span>, which means you
              can assign your vote to someone else as long as you own your Noun.
            </Trans>
          </p>
        </div>

        <div className={classes.contentWrapper}>
          <div className={classes.current}>
            <Trans>Current Delegate</Trans>
          </div>
          <div className={classes.delegateInfoWrapper}>
            <div className={classes.ens}>
              <ShortAddress address={account} avatar={true} size={39} />
            </div>
            <div className={classes.shortAddress}>{shortAccount}</div>
          </div>
        </div>
      </div>

      <div className={classes.buttonWrapper}>
        <NavBarButton
          buttonText={<Trans>Close</Trans>}
          buttonStyle={NavBarButtonStyle.DELEGATE_BACK}
          onClick={onSecondaryBtnClick}
        />
        <NavBarButton
          buttonText={<Trans>Update Delegate</Trans>}
          buttonStyle={
            hasNounBalance
              ? NavBarButtonStyle.DELEGATE_PRIMARY
              : NavBarButtonStyle.DELEGATE_DISABLED
          }
          onClick={onPrimaryBtnClick}
          disabled={!hasNounBalance}
        />
      </div>
    </div>
  )
}

export default CurrentDelegatePanel
