// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/connectors/gnosisSafe.ts

import { initializeConnector } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'

export const [gnosisSafe, hooks] = initializeConnector<GnosisSafe>(
  (actions) => new GnosisSafe({ actions }),
)
