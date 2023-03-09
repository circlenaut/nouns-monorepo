// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/components/Chain.tsx

import type { Web3ReactHooks } from '@web3-react/core'
import React from 'react'

import { CHAINS } from '@/connectors/chains'

interface ChainProps {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
}

export const Chain: React.FC<ChainProps> = ({ chainId }) => {
  if (chainId === undefined) return null

  const name = chainId ? CHAINS[chainId]?.name : undefined

  return name ? (
    <div>
      {' '}
      Chain: <b>{name}</b>{' '}
    </div>
  ) : (
    <div>
      Chain Id: <b>{chainId}</b>{' '}
    </div>
  )
}
