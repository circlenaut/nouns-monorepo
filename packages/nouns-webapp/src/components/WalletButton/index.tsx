import React from 'react'
import { Button } from 'react-bootstrap'

import classes from './WalletButton.module.css'

import coinbaseWalletLogo from '@/assets/wallet-brand-assets/coinbase-wallet-dot.svg'
import gnosisSafeLogo from '@/assets/wallet-brand-assets/fortmatic.svg'
import networkLogo from '@/assets/wallet-brand-assets/ledger.svg'
import metamaskLogo from '@/assets/wallet-brand-assets/metamask-fox.svg'
import walletconnectLogo from '@/assets/wallet-brand-assets/walletconnect-logo.svg'

export enum WALLET_TYPE {
  coinbaseWallet = 'Coinbase Wallet',
  gnosisSafe = 'Gnosis Safe',
  metamask = 'Metamask',
  network = 'Network',
  walletconnect = 'Wallet Connect',
}

const logo = (walletType: WALLET_TYPE) => {
  switch (walletType) {
    case WALLET_TYPE.coinbaseWallet:
      return coinbaseWalletLogo
    case WALLET_TYPE.gnosisSafe:
      return gnosisSafeLogo
    case WALLET_TYPE.metamask:
      return metamaskLogo
    case WALLET_TYPE.network:
      return networkLogo
    case WALLET_TYPE.walletconnect:
      return walletconnectLogo
    default:
      return ''
  }
}

interface WalletButtonInterface {
  onClick: () => void
  walletType: WALLET_TYPE
}

const WalletButton: React.FC<WalletButtonInterface> = (props) => {
  const { onClick, walletType } = props
  return (
    <Button className={classes.walletButton} onClick={onClick}>
      <img src={logo(walletType)} alt={`${walletType} logo`} />
      {walletType}
    </Button>
  )
}
export default WalletButton
