import { CHAIN_ID } from '@/configs'
import { useConfig } from '@usedapp/core'
import { providers } from 'ethers'
import { useMemo } from 'react'

/**
 * Returns a provider that's constructed using the readonly RPC URL.
 */
export const useReadonlyProvider = ():
  | providers.JsonRpcProvider
  | undefined => {
  const config = useConfig()
  const rpcURL = config?.readOnlyUrls?.[CHAIN_ID] as string | undefined
  return useMemo(() => {
    if (!rpcURL) {
      return
    }
    return new providers.JsonRpcProvider(rpcURL)
  }, [rpcURL])
}
