// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/connectors/network.ts

import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

import { URLS } from '@/connectors/chains'

export const [network, hooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: URLS }),
)
