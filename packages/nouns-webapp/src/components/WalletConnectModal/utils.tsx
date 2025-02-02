// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/utils.ts

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import type { Connector } from '@web3-react/types'
// import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { WalletConnect } from '@web3-react/walletconnect'

export const getWeb3ReactConnectorName = (connector: Connector) => {
  if (connector instanceof MetaMask) return 'MetaMask'
  // if (connector instanceof WalletConnectV2) return 'WalletConnect'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof GnosisSafe) return 'Gnosis Safe'
  return 'Unknown'
}
