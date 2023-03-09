// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/connectors/metaMask.ts

import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions }),
)
