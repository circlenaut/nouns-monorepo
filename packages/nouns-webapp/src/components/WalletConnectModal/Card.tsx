// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/components/Card.tsx

import { ChainId } from '@usedapp/core'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import React, { useCallback, useState } from 'react'
// import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { WalletConnect } from '@web3-react/walletconnect'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useAppSelector } from '@/hooks'
import { Accounts } from './Accounts'
import { Chain } from './Chain'
import { ConnectWithSelect } from './ConnectWithSelect'
import { Status } from './Status'

export interface CardProps {
  // connector: MetaMask | WalletConnectV2 | CoinbaseWallet | Network | GnosisSafe
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  accounts?: string[]
}

export const Card: React.FC<CardProps> = ({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  accounts,
  provider,
}: CardProps) => {
  const { activeWallet } = useAppSelector((state) => state.account)

  dayjs.extend(relativeTime)

  const [isConnectRequested, setIsConnectRequested] = useState(false)
  const handleConnectClick = useCallback(() => {
    setIsConnectRequested(true)
  }, [])

  const handleDisconnectClick = useCallback(() => {
    setIsConnectRequested(false)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '1px solid',
        borderRadius: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginRight: '5px' }}>
          <Status
            isActivating={isActivating}
            isActive={isActive}
            error={error}
            showIconOnly={true}
          />
        </div>
        {activeWallet}
        {chainId && chainId !== ChainId.Goerli && (
          <div style={{ marginLeft: '2.5px' }}>
            <Status
              isActivating={isActivating}
              isActive={isActive}
              error={error}
              showIconOnly={false}
            />
          </div>
        )}
      </div>

      {chainId !== ChainId.Goerli && <Chain chainId={chainId} />}
      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <Accounts
          chainId={chainId}
          isActive={isActive}
          accounts={accounts}
          provider={provider}
          ENSNames={ENSNames}
          isConnectRequested={isConnectRequested}
        />
      </div>
      <ConnectWithSelect
        connector={connector}
        chainId={chainId}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
        setError={setError}
        onConnectClick={handleConnectClick}
        onDisconnectClick={handleDisconnectClick}
      />
    </div>
  )
}
