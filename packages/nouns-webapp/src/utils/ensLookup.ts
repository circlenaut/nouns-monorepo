import { useEthers } from '@usedapp/core'
import { useEffect, useState } from 'react'

import { cache, cacheKey, CHAIN_ID } from '@/configs'

import { isValidNameFormat } from './addressAndChainNameDisplayUtils'
import { lookupNNSOrENS } from './lookupNNSOrENS'

export const ensCacheKey = (address: string) => {
  if (!cache.ens) return
  return cacheKey(cache.ens, CHAIN_ID, address)
}

export const useReverseENSLookUp = (address: string, skip?: boolean) => {
  const { library: provider } = useEthers()

  const [ens, setEns] = useState<string>()

  useEffect(() => {
    if (skip) return

    let mounted = true
    if (address && provider) {
      // Look for resolved ENS in local storage (result of pre-fetching)
      const catchKey = ensCacheKey(address)
      if (!catchKey) return

      const maybeCachedENSResultRaw = localStorage.getItem(catchKey)
      if (maybeCachedENSResultRaw) {
        const maybeCachedENSResult = JSON.parse(maybeCachedENSResultRaw)
        if (parseInt(maybeCachedENSResult.expires) > Date.now() / 1000) {
          setEns(maybeCachedENSResult.name)
        } else {
          localStorage.removeItem(catchKey)
        }
      }

      // If address not in local storage, attempt to resolve via RPC call.
      // At this stage if the item is in local storage we know it isn't expired.
      if (!localStorage.getItem(catchKey)) {
        lookupNNSOrENS(provider, address)
          .then((name) => {
            if (!name) return
            if (mounted) {
              localStorage.setItem(
                catchKey,
                JSON.stringify({
                  name,
                  expires: Date.now() / 1000 + 30 * 60,
                }),
              )
              setEns(name)
            }
          })
          .catch((error) => {
            console.error(`error resolving reverse ens lookup: `, error)
            localStorage.clear()
          })
      }
    }

    return () => {
      setEns('')
      mounted = false
    }
  }, [address, provider])

  if (isValidNameFormat(address)) return address

  return ens
}
