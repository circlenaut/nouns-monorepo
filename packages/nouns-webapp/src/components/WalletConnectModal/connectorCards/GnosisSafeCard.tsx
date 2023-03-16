// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/components/connectorCards/GnosisSafeCard.tsx

import React, { useEffect, useMemo, useState } from 'react'

import { gnosisSafe, hooks } from '@/connectors/gnosisSafe'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  // useENSNames,
} = hooks

interface GnosisSafeCardProps {
  connect?: boolean
}

export const GnosisSafeCard: React.FC<GnosisSafeCardProps> = ({ connect }) => {
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
    void gnosisSafe.connectEagerly().catch(() => {
      console.error('Failed to connect eagerly to Gnosis Safe')
    })
  }, [connect])

  return (
    <Card
      connector={gnosisSafe}
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
