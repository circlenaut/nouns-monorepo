// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/components/Chain.tsx

import type { Web3ReactHooks } from '@web3-react/core'
import React from 'react'

import { DEFAULT_CHAIN_ID } from '@/configs'
import { CHAINS } from '@/connectors/chains'
import { useConfig } from '@/hooks/useConfig'

interface ChainProps {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
}

export const Chain: React.FC<ChainProps> = ({ chainId }) => {
  const { envs } = useConfig()
  const defaultChainId = envs
    ? parseInt(envs.CHAIN_ID)
    : Number(DEFAULT_CHAIN_ID)

  const name = chainId ? CHAINS[chainId]?.name : CHAINS[defaultChainId].name

  return name ? (
    <>
      <b>{name}</b>
    </>
  ) : !!chainId ? (
    <>
      chain ID <b>{chainId}</b>
    </>
  ) : null
}
