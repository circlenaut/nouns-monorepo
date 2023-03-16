// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/components/connectorCards/MetaMaskCard.tsx

import React, { useEffect, useMemo, useState } from 'react'

import { hooks, metaMask } from '@/connectors/metaMask'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  // useENSNames,
} = hooks

interface MetaMaskCardProps {
  connect?: boolean
}

export const MetaMaskCard: React.FC<MetaMaskCardProps> = ({ connect }) => {
  const chainIdMemo = useChainId()
  const chainId = useMemo(() => chainIdMemo, [chainIdMemo])
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()
  // onIsActive && onIsActive(!isActive);

  const provider = useProvider()
  // const ENSNames = useENSNames(provider)

  const [error, setError] = useState<Error | undefined>(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!connect) return
    void metaMask.connectEagerly().catch(() => {
      console.error('Failed to connect eagerly to MetaMask')
    })
  }, [connect])

  return (
    <Card
      connector={metaMask}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      // ENSNames={ENSNames}
    />
  )
}
