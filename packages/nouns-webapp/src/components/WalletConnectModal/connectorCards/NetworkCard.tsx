// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/components/connectorCards/NetworkCard.tsx

import React, { useEffect, useState } from 'react'

import { hooks, network } from '@/connectors/network'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks

interface NetworkCardProps {
  connect?: boolean
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ connect }) => {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()
  // onIsActive && onIsActive(!isActive);

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState<Error | undefined>(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!connect) return
    void network.activate().catch(() => {
      console.error('Failed to connect to Network')
    })
  }, [connect])

  return (
    <Card
      connector={network}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  )
}
