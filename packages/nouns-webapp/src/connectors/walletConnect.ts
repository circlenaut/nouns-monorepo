// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/connectors/walletConnect.ts

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { environmentVariables } from '@/hooks/useEnv'
import { MAINNET_CHAINS } from './chains'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        projectId: environmentVariables.WALLET_CONNECT_PROJECT_ID ?? '',
        chains: Object.keys(MAINNET_CHAINS).map(Number),
      },
    }),
)
