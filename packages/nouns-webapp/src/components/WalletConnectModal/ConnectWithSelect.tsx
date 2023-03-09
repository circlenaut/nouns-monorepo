// Adapted from here: https://github.com/Uniswap/web3-react/blob/main/example/components/ConnectWithSelect.tsx

import type { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import type { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import type { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
// import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { ChainId } from '@usedapp/core'
import { WalletConnect } from '@web3-react/walletconnect'
import React, { useCallback, useState } from 'react'

import { DEFAULT_CHAIN_ID } from '@/configs'
import { CHAINS, getAddChainParameters, URLS } from '@/connectors/chains'

import classes from './WalletConnectModal.module.css'

const ChainSelect = ({
  chainId,
  switchChain,
  displayDefault,
  chainIds,
}: {
  chainId: number
  switchChain?: (chainId: number) => void | undefined
  displayDefault: boolean
  chainIds: number[]
}) => {
  return (
    <div className={classes.selectBox}>
      <select
        value={chainId}
        onChange={(event) => {
          switchChain?.(Number(event.target.value))
        }}
        disabled={switchChain === undefined}
      >
        {displayDefault ? <option value={-1}>Default Chain</option> : null}
        {chainIds.map((chainId) => (
          <option key={chainId} value={chainId}>
            {CHAINS[chainId]?.name ?? chainId}
          </option>
        ))}
      </select>
    </div>
  )
}

interface ConnectWithSelectProps {
  // connector: MetaMask | WalletConnectV2 | CoinbaseWallet | Network | GnosisSafe
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  onConnectClick: () => void
  onDisconnectClick: () => void
}

export const ConnectWithSelect: React.FC<ConnectWithSelectProps> = ({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  onConnectClick,
  onDisconnectClick,
}: ConnectWithSelectProps) => {
  const isNetwork = connector instanceof Network
  const displayDefault = !isNetwork
  const chainIds = (isNetwork ? Object.keys(URLS) : Object.keys(CHAINS)).map(
    (chainId) => Number(chainId),
  )

  const [desiredChainId, setDesiredChainId] = useState<number>(
    isNetwork ? 1 : -1,
  )

  const switchChain = useCallback(
    (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }

      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

      // if (connector instanceof WalletConnectV2 || connector instanceof Network) {
      if (connector instanceof WalletConnect || connector instanceof Network) {
        connector
          .activate(desiredChainId === -1 ? undefined : desiredChainId)
          .then(() => setError(undefined))
          .catch(setError)
      } else {
        connector
          .activate(
            desiredChainId === -1
              ? undefined
              : getAddChainParameters(desiredChainId),
          )
          .then(() => setError(undefined))
          .catch(setError)
      }
    },
    [connector, chainId, setError],
  )

  const handleTryAgain = useCallback((): void => {
    onConnectClick()
    setError(undefined)
    if (connector instanceof GnosisSafe) {
      connector
        .activate()
        .then(() => setError(undefined))
        .catch(setError)
    } else if (
      connector instanceof WalletConnect ||
      connector instanceof Network
    ) {
      // } else if (connector instanceof WalletConnectV2 || connector instanceof Network) {
      connector
        .activate(desiredChainId === -1 ? undefined : desiredChainId)
        .then(() => setError(undefined))
        .catch(setError)
    } else {
      connector
        .activate(
          desiredChainId === -1
            ? undefined
            : getAddChainParameters(desiredChainId),
        )
        .then(() => setError(undefined))
        .catch(setError)
    }
  }, [connector, desiredChainId, setError])

  const handleConnect = useCallback(() => {
    onConnectClick()
    if (isActivating) return

    return connector instanceof GnosisSafe
      ? void connector
          .activate()
          .then(() => setError(undefined))
          .catch(setError)
      : // : connector instanceof WalletConnectV2 || connector instanceof Network
      connector instanceof WalletConnect || connector instanceof Network
      ? connector
          .activate(desiredChainId === -1 ? undefined : desiredChainId)
          .then(() => setError(undefined))
          .catch(setError)
      : connector
          .activate(
            desiredChainId === -1
              ? undefined
              : getAddChainParameters(desiredChainId),
          )
          .then(() => setError(undefined))
          .catch(setError)
  }, [isActivating, connector, desiredChainId, setError])

  const handleDisconnect = useCallback(() => {
    onDisconnectClick()
    if (connector?.deactivate) {
      void connector?.deactivate()
    } else {
      void connector?.resetState()
    }
  }, [connector])

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(chainId ? chainId !== ChainId.Goerli : false) && (
          <>
            {!(connector instanceof GnosisSafe) && (
              <ChainSelect
                chainId={desiredChainId}
                switchChain={switchChain}
                displayDefault={displayDefault}
                chainIds={chainIds}
              />
            )}
            <div style={{ marginBottom: '1rem' }} />
          </>
        )}
        <button onClick={handleTryAgain}>Try Again?</button>
      </div>
    )
  } else if (isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(chainId ? chainId !== ChainId.Goerli : false) && (
          <>
            {!(connector instanceof GnosisSafe) && (
              <ChainSelect
                chainId={
                  desiredChainId === -1 ? -1 : chainId ?? DEFAULT_CHAIN_ID
                }
                switchChain={switchChain}
                displayDefault={displayDefault}
                chainIds={chainIds}
              />
            )}
            <div style={{ marginBottom: '1rem' }} />
          </>
        )}
        <div className={classes.connectionBox}>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      </div>
    )
  } else {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(chainId ? chainId !== ChainId.Goerli : false) && (
          <>
            {!(connector instanceof GnosisSafe) && (
              <ChainSelect
                chainId={desiredChainId}
                switchChain={isActivating ? undefined : switchChain}
                displayDefault={displayDefault}
                chainIds={chainIds}
              />
            )}
            <div style={{ marginBottom: '1rem' }} />
          </>
        )}
        <div className={classes.connectionBox}>
          <button onClick={handleConnect} disabled={isActivating}>
            Connect
          </button>
        </div>
      </div>
    )
  }
}
