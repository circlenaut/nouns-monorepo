// Adapted from here: https://github.com/Uniswap/web3-react/blob/main/example/components/Status.tsx

import type { Web3ReactHooks } from '@web3-react/core'
import React, { useMemo } from 'react'

import { DEFAULT_CHAIN_ID } from '@/configs'
import { CHAINS } from '@/connectors/chains'
import { fetchProviderRpcError } from '@/errors/rpc'
import { useAppSelector } from '@/hooks'
import { useConfig } from '@/hooks/useConfig'

export enum Display {
  IconOnly,
  TextOnly,
  IconAndText,
}

interface StatusProps {
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  display?: Display
  error?: Error
  chainId?: number
}

export const Status: React.FC<StatusProps> = ({
  isActivating,
  isActive,
  error,
  display = Display.IconAndText,
  chainId,
}: StatusProps) => {
  const { devMode } = useAppSelector((state) => state.application)

  const { envs } = useConfig()
  const defaultChainId = envs
    ? parseInt(envs.CHAIN_ID)
    : Number(DEFAULT_CHAIN_ID)

  const chainName = chainId
    ? CHAINS[chainId]?.name
    : CHAINS[defaultChainId]?.name

  const constructDisplay = (_display: Display, icon: string, text: string) => {
    const iconAndText = `${icon} ${text}`
    switch (_display) {
      case Display.IconOnly:
        return icon
      case Display.TextOnly:
        return text
      case Display.IconAndText:
        return iconAndText
      default:
        return iconAndText
    }
  }

  const errorMessage = useMemo(
    () =>
      ((_err) =>
        !!_err
          ? devMode
            ? `RPC Error (${_err.code}): ${_err.message}`
            : _err?.message
          : `Unknown Error: ${error?.toString()}`)(
        fetchProviderRpcError(error),
      ),
    [error, devMode],
  )

  return (
    <>
      {error ? (
        <>{constructDisplay(display, '🔴', `${errorMessage}`)}</>
      ) : isActivating ? (
        <>
          {constructDisplay(
            display,
            '🟡',
            `Connecting to ${chainName ?? chainId}`,
          )}
        </>
      ) : isActive ? (
        <>
          {constructDisplay(
            display,
            '🟢',
            `Connected to ${chainName ?? chainId}`,
          )}
        </>
      ) : (
        <>
          {constructDisplay(
            display,
            '⚪️',
            `Disconnected from ${chainName ?? chainId}`,
          )}
        </>
      )}
    </>
  )
}
