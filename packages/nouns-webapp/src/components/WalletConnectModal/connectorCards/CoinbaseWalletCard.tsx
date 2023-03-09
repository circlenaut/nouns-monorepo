// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/components/connectorCards/CoinbaseWalletCard.tsx

import React, { useEffect, useState } from 'react'

import { coinbaseWallet, hooks } from '@/connectors/coinbaseWallet'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks

interface CoinbaseWalletCardProps {
  connect?: boolean
}

export const CoinbaseWalletCard: React.FC<CoinbaseWalletCardProps> = ({
  connect,
}) => {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState<Error | undefined>(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (!connect) return
    void coinbaseWallet.connectEagerly().catch(() => {
      console.error('Failed to connect eagerly to Coinbase wallet')
    })
  }, [connect])

  return (
    <Card
      connector={coinbaseWallet}
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
