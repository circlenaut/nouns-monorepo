// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/connectors/url.ts

import { initializeConnector } from '@web3-react/core'
import { Url } from '@web3-react/url'

import { URLS } from '@/connectors/chains'

export const [url, hooks] = initializeConnector<Url>(
  (actions) => new Url({ actions, url: URLS[1]?.[0] ?? '' }),
)
