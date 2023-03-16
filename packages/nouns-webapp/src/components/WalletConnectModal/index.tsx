// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/components/Card.tsx
import { Trans } from '@lingui/macro'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
// import clsx from 'clsx';

import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import type { Connector } from '@web3-react/types'

import WalletButton, { WALLET_TYPE } from '@/components/WalletButton'
import WalletModal from './WalletModal'

import { CoinbaseWalletCard } from '@/components/WalletConnectModal/connectorCards/CoinbaseWalletCard'
import { GnosisSafeCard } from '@/components/WalletConnectModal/connectorCards/GnosisSafeCard'
import { MetaMaskCard } from '@/components/WalletConnectModal/connectorCards/MetaMaskCard'
import { NetworkCard } from '@/components/WalletConnectModal/connectorCards/NetworkCard'
import { WalletConnectCard } from '@/components/WalletConnectModal/connectorCards/WalletConnectCard'

import {
  coinbaseWallet,
  hooks as coinbaseHooks,
} from '@/connectors/coinbaseWallet'
import { gnosisSafe, hooks as gnosisSafeHooks } from '@/connectors/gnosisSafe'
import { hooks as metamaskHooks, metaMask } from '@/connectors/metaMask'
import { hooks as networkHooks, network } from '@/connectors/network'
// import { hooks as walletConnectHooks, walletConnectV2 } from '@/connectors/walletConnectV2';
import {
  hooks as walletConnectHooks,
  walletConnect,
} from '@/connectors/walletConnect'
import { useAppDispatch } from '@/hooks'

// import { URI_AVAILABLE } from '@web3-react/walletconnect-v2';
import { URI_AVAILABLE } from '@web3-react/walletconnect'

// import { useShareableWalletType } from '@/state/shared';
import { AlertModal, setAlertModal } from '@/state/slices/application'

import classes from './WalletConnectModal.module.css'

export const getWalletType = (connector: Connector) => {
  const walletTypes = Object.values(WALLET_TYPE)
  const connectorName = connector?.constructor.name
  if (walletTypes.includes(connectorName as WALLET_TYPE)) {
    return connectorName as WALLET_TYPE
  } else {
    return null // or whatever you want to return if there is no match
  }
}

interface Props {
  onDismiss: () => void
  autoConnect?: boolean
}

const setUseEagerConnection = false

const WalletConnectModal: React.FC<Props> = (props) => {
  const { onDismiss, autoConnect } = props
  const [walletType, setWalletType] = useState<WALLET_TYPE | null>(null)

  const [isConnectFailed, setIsConnectFailed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<ReactNode>('')
  const [cardToDisplay, setCardToDisplay] = useState<React.ReactElement | null>(
    null,
  )

  const isCoinbaseActive = coinbaseHooks.useIsActive()
  const isCoinbaseActivating = coinbaseHooks.useIsActivating()

  const isGnosisSafeActive = gnosisSafeHooks.useIsActive()
  const isGnosisSafeActivating = gnosisSafeHooks.useIsActivating()

  const isMetaMaskActive = metamaskHooks.useIsActive()
  const isMetaMaskActivating = metamaskHooks.useIsActivating()

  const isNetworkActive = networkHooks.useIsActive()
  const isNetworkActivating = networkHooks.useIsActivating()

  const isWalletConnectActive = walletConnectHooks.useIsActive()
  const isWalletConnectActivating = walletConnectHooks.useIsActivating()

  const { connector } = useWeb3React()

  const dispatch = useAppDispatch()
  const setModal = useCallback(
    (modal: AlertModal) => {
      dispatch(setAlertModal(modal))
    },
    [dispatch],
  )

  const [showWalletCard, setShowWalletCard] = useState(false)

  useEffect(() => {
    const activeWalletType = connector && getWalletType(connector)
    activeWalletType && setWalletType(activeWalletType)
  }, [connector])

  const handleShowWalletCard = useCallback((state: boolean) => {
    setShowWalletCard(state)
  }, [])

  const handleCardToDisplay = useCallback(
    (_walletType?: WALLET_TYPE | null, _connect?: boolean) => {
      switch (_walletType) {
        case WALLET_TYPE.coinbaseWallet:
          setCardToDisplay(
            <CoinbaseWalletCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
        case WALLET_TYPE.gnosisSafe:
          setCardToDisplay(
            <GnosisSafeCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
        case WALLET_TYPE.metamask:
          setCardToDisplay(
            <MetaMaskCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
        case WALLET_TYPE.network:
          setCardToDisplay(
            <NetworkCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
        case WALLET_TYPE.walletconnect:
          setCardToDisplay(
            <WalletConnectCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
        default:
          setCardToDisplay(
            <MetaMaskCard
              connect={_connect && autoConnect && !showWalletCard}
            />,
          )
          break
      }
    },
    [autoConnect, showWalletCard, handleShowWalletCard],
  )

  const handleClick = useCallback(
    (_walletType?: WALLET_TYPE | null) => {
      setShowWalletCard(!showWalletCard)
      handleCardToDisplay(_walletType, false)
    },
    [showWalletCard, handleCardToDisplay],
  )

  const handleAutoConnect = useCallback(
    async (_walletType: WALLET_TYPE, _connect: boolean) => {
      switch (_walletType) {
        case WALLET_TYPE.coinbaseWallet:
          autoConnect && _connect
            ? !isCoinbaseActive && !isCoinbaseActivating
              ? (async () => {
                  try {
                    void setUseEagerConnection
                      ? await coinbaseWallet.connectEagerly()
                      : await coinbaseWallet.activate()
                    onDismiss()
                  } catch (error) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : `Unknown Error: ${error}`
                    console.error(errMsg)
                    setModal({
                      title: 'Error',
                      message:
                        errMsg ||
                        `Failed to connect ${
                          setUseEagerConnection ? 'eagerly' : ''
                        } to Coinbase Wallet`,
                      show: true,
                    })
                  }
                })()
              : onDismiss()
            : handleShowWalletCard(!showWalletCard)
          break
        case WALLET_TYPE.gnosisSafe:
          autoConnect && _connect
            ? !isGnosisSafeActive && !isGnosisSafeActivating
              ? (async () => {
                  try {
                    void setUseEagerConnection
                      ? await gnosisSafe.connectEagerly()
                      : await gnosisSafe.activate()
                    onDismiss()
                  } catch (error) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : `Unknown Error: ${error}`
                    console.error(errMsg)
                    setModal({
                      title: 'Error',
                      message:
                        errMsg ||
                        `Failed to connect ${
                          setUseEagerConnection ? 'eagerly' : ''
                        } to Gnosis Safe`,
                      show: true,
                    })
                  }
                })()
              : onDismiss()
            : handleShowWalletCard(!showWalletCard)
          break
        case WALLET_TYPE.metamask:
          autoConnect && _connect
            ? !isMetaMaskActive && !isMetaMaskActivating
              ? (async () => {
                  try {
                    void setUseEagerConnection
                      ? await metaMask.connectEagerly()
                      : await metaMask.activate()
                    onDismiss()
                  } catch (error) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : `Unknown Error: ${error}`
                    console.error(errMsg)
                    setModal({
                      title: 'Error',
                      message:
                        errMsg ||
                        `Failed to connect ${
                          setUseEagerConnection ? 'eagerly' : ''
                        } to metamask`,
                      show: true,
                    })
                  }
                })()
              : onDismiss()
            : handleShowWalletCard(!showWalletCard)
          break
        case WALLET_TYPE.network:
          autoConnect && _connect
            ? !isNetworkActive && !isNetworkActivating
              ? (async () => {
                  try {
                    void (await network.activate())
                    onDismiss()
                  } catch (error) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : `Unknown Error: ${error}`
                    console.error(errMsg)
                    setModal({
                      title: 'Error',
                      message:
                        errMsg ||
                        `Failed to connect ${
                          setUseEagerConnection ? 'eagerly' : ''
                        } to Coinbase Wallet`,
                      show: true,
                    })
                  }
                })()
              : onDismiss()
            : handleShowWalletCard(!showWalletCard)
          break
        case WALLET_TYPE.walletconnect:
          autoConnect && _connect
            ? !isWalletConnectActive && !isWalletConnectActivating
              ? (async () => {
                  try {
                    void (await network.activate())
                    // void walletConnectV2.events.on(URI_AVAILABLE, (uri: string) => {
                    void walletConnect.events.on(
                      URI_AVAILABLE,
                      (uri: string) => {
                        console.info(`uri: ${uri}`)
                      },
                    )
                    onDismiss()
                  } catch (error) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : `Unknown Error: ${error}`
                    console.error(errMsg)
                    setModal({
                      title: 'Error',
                      message:
                        errMsg ||
                        `Failed to connect ${
                          setUseEagerConnection ? 'eagerly' : ''
                        } to Coinbase Wallet`,
                      show: true,
                    })
                  }
                })()
              : onDismiss()
            : handleShowWalletCard(!showWalletCard)
          break
        default:
          break
      }
    },
    [
      autoConnect,
      showWalletCard,
      handleShowWalletCard,
      isCoinbaseActive,
      isGnosisSafeActive,
      isCoinbaseActivating,
      isGnosisSafeActivating,
      isMetaMaskActivating,
      isMetaMaskActive,
      isNetworkActivating,
      isNetworkActive,
      isWalletConnectActivating,
      isWalletConnectActive,
      onDismiss,
      setModal,
      // isWalletConnectActive
    ],
  )

  const loadWallet = useCallback(
    (_walletType: WALLET_TYPE, _connect: boolean, timeout = 5000) => {
      try {
        console.info(`Loading ${_walletType} ...`)
        setWalletType(_walletType)

        handleCardToDisplay(_walletType, _connect)
        handleAutoConnect(_walletType, _connect)
      } catch (error) {
        setErrorMessage(<Trans>Error: Failed To Connect!</Trans>)
        setIsConnectFailed(true)
        setTimeout(() => {
          console.error(
            `Failed to make wallet connection, closing in ${
              timeout / 1000
            } seconds`,
          )
          onDismiss()
          setShowWalletCard(false)
        }, timeout)
      }
    },
    [handleAutoConnect, handleCardToDisplay, onDismiss],
  )

  const wallets = useMemo(
    () => (
      <div className={classes.walletConnectModal}>
        <WalletButton
          onClick={async () => {
            loadWallet(WALLET_TYPE.coinbaseWallet, isCoinbaseActive)
          }}
          walletType={WALLET_TYPE.coinbaseWallet}
        />
        <WalletButton
          onClick={async () => {
            loadWallet(WALLET_TYPE.gnosisSafe, isGnosisSafeActive)
          }}
          walletType={WALLET_TYPE.gnosisSafe}
        />
        <WalletButton
          onClick={async () => {
            loadWallet(WALLET_TYPE.metamask, isMetaMaskActive)
          }}
          walletType={WALLET_TYPE.metamask}
        />
        <WalletButton
          onClick={async () => {
            loadWallet(WALLET_TYPE.network, isNetworkActive)
          }}
          walletType={WALLET_TYPE.network}
        />
        <WalletButton
          onClick={async () => {
            loadWallet(WALLET_TYPE.walletconnect, isWalletConnectActive)
          }}
          walletType={WALLET_TYPE.walletconnect}
        />
      </div>
    ),
    [
      loadWallet,
      isCoinbaseActive,
      isGnosisSafeActive,
      isMetaMaskActive,
      isNetworkActive,
      isWalletConnectActive,
    ],
  )

  const showWallets = useCallback(() => {
    return (
      <>
        {wallets}
        <button
          onClick={() => handleClick(walletType)}
          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <FontAwesomeIcon
            icon={faChevronUp}
            style={{ transform: 'rotate(180deg)' }}
            className={classes.toggleWalletDetailDisplay}
          />
        </button>
        {showWalletCard && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {cardToDisplay}
          </div>
        )}
      </>
    )
  }, [wallets, handleClick, walletType, showWalletCard, cardToDisplay])

  const cleanup = useRef(() => {
    setModal({ show: false })
    setShowWalletCard(false)
  })

  useEffect(() => {
    const currentCleanup = cleanup.current
    return () => {
      currentCleanup()
    }
  }, [])

  return (
    <WalletModal
      title={<Trans>Connect your wallet</Trans>}
      content={isConnectFailed ? errorMessage : showWallets()}
      onDismiss={onDismiss}
    />
  )
}
export default WalletConnectModal
