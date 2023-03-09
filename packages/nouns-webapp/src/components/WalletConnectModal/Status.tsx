// Adapted from here: https://github.com/Uniswap/web3-react/blob/main/example/components/Status.tsx

import type { Web3ReactHooks } from '@web3-react/core'
import React from 'react'

interface StatusProps {
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error?: Error
  showIconOnly?: boolean
}

export const Status: React.FC<StatusProps> = ({
  isActivating,
  isActive,
  error,
  showIconOnly,
}: StatusProps) => {
  return (
    <>
      {error ? (
        <>
          {showIconOnly ? '🔴' : error.name ?? 'Error'}
          {!showIconOnly ? (error.message ? `: ${error.message}` : null) : ''}
        </>
      ) : isActivating ? (
        <> {showIconOnly ? '🟡' : 'Connecting'}</>
      ) : isActive ? (
        <> {showIconOnly ? '🟢' : 'Connected'}</>
      ) : (
        <> {showIconOnly ? '⚪️' : 'Disconnected'}</>
      )}
    </>
  )
}
