// Borrowed from: https://github.com/Uniswap/web3-react/blob/main/example/components/connectorCards/WalletConnectCard.tsx

// import { URI_AVAILABLE } from '@web3-react/walletconnect-v2'
import { URI_AVAILABLE } from '@web3-react/walletconnect'
import React, { useEffect, useMemo, useState } from 'react'

// import { hooks, walletConnectV2 } from '@/connectors/walletConnectV2'
import { hooks, walletConnect } from '@/connectors/walletConnect'
import { Card } from '../Card'

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks

interface WalletConnectCardProps {
  connect?: boolean
}

export const WalletConnectCard: React.FC<WalletConnectCardProps> = ({
  connect,
}) => {
  const chainIdMemo = useChainId()
  const chainId = useMemo(() => chainIdMemo, [chainIdMemo])
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()
  // onIsActive && onIsActive(!isActive);

  const provider = useProvider()
  // const ENSNames = useENSNames(provider)

  const [error, setError] = useState<Error | undefined>(undefined)

  // log URI when available
  useEffect(() => {
    if (!connect) return
    // walletConnectV2.events.on(URI_AVAILABLE, (uri: string) => {
    walletConnect.events.on(URI_AVAILABLE, (uri: string) => {
      console.info(`uri: ${uri}`)
    })
  }, [connect])

  // attempt to connect eagerly on mount
  useEffect(() => {
    // walletConnectV2.connectEagerly().catch(() => {
    walletConnect.connectEagerly().catch(() => {
      console.error('Failed to connect eagerly to WalletConnect')
    })
  }, [])

  return (
    <Card
      // connector={walletConnectV2}
      connector={walletConnect}
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
