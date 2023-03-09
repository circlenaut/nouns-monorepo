import { useWeb3React } from '@web3-react/core'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useEffect } from 'react'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
// import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

import AlertModal from '@/components/Modal'
import NetworkAlert from '@/components/NetworkAlert'
import { getWeb3ReactConnectorName } from '@/components/WalletConnectModal/utils'
import { CHAIN_ID } from '@/configs'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  setActiveAccount,
  setActiveChainId,
  setActiveWallet,
} from '@/state/slices/account'
import { setAlertModal } from '@/state/slices/application'

import {
  coinbaseWallet,
  hooks as coinbaseWalletHooks,
} from '@/connectors/coinbaseWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '@/connectors/gnosisSafe'
import { hooks as metaMaskHooks, metaMask } from '@/connectors/metaMask'
import { hooks as networkHooks, network } from '@/connectors/network'
import {
  hooks as walletConnectHooks,
  walletConnect,
} from '@/connectors/walletConnect'
// import { hooks as walletConnectHooks, walletConnectV2 } from './connectors/walletConnectV2';

export const ConnectionProvider: React.FC = () => {
  const { account, chainId, connector } = useWeb3React()
  const dispatch = useAppDispatch()

  const walletName = getWeb3ReactConnectorName(connector)

  console.debug(`Utilizing ${walletName} as a wallet`)

  dayjs.extend(relativeTime)

  useEffect(() => void dispatch(setActiveAccount(account)), [account, dispatch])
  useEffect(() => void dispatch(setActiveChainId(chainId)), [chainId, dispatch])
  useEffect(
    () => void dispatch(setActiveWallet(walletName)),
    [walletName, dispatch],
  )

  return null
}

export const connectors: [
  (
    | CoinbaseWallet
    | GnosisSafe
    | MetaMask
    | Network
    // WalletConnectV2,
    | WalletConnect
  ),
  Web3ReactHooks,
][] = [
  [coinbaseWallet, coinbaseWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
  [metaMask, metaMaskHooks],
  [network, networkHooks],
  // [walletConnectV2, walletConnectHooks],
  [walletConnect, walletConnectHooks],
]

export const NetworkCheck: React.FC = () => {
  const dispatch = useAppDispatch()

  const alertModal = useAppSelector((state) => state.application.alertModal)
  const { activeChainId } = useAppSelector((state) => state.account)

  return (
    <>
      {activeChainId && CHAIN_ID !== activeChainId && <NetworkAlert />}
      {alertModal?.show && (
        <AlertModal
          title={alertModal?.title}
          content={<p>{alertModal?.message}</p>}
          onDismiss={() =>
            // dispatch(setAlertModal({ ...alertModal, show: false }))
            dispatch(setAlertModal({ show: false, title: '', message: '' }))
          }
        />
      )}
    </>
  )
}
