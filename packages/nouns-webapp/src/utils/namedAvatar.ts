import { useEthers } from '@usedapp/core'
import { useEffect, useMemo, useState } from 'react'
import { useReverseNameServiceLookUp } from './nameLookup'

export const useNamedAvatarLookup = (address: string) => {
  const { library: provider } = useEthers()
  const [namedAvatar, setNamedAvatar] = useState<string>()

  const nameMemo = useReverseNameServiceLookUp(address)
  const name = useMemo(() => nameMemo, [nameMemo])

  useEffect(() => {
    if (!provider) return
    ;(async () => {
      let mounted = true
      if (!name) return
      provider.getResolver(name).then((resolver) => {
        if (!resolver) return
        resolver
          .getText('avatar')
          .then((avatar) => {
            if (mounted) {
              setNamedAvatar(avatar)
            }
          })
          .catch((error) => {
            console.error(`error resolving named avatar: `, error)
          })
      })
      return () => {
        setNamedAvatar('')
        mounted = false
      }
    })()
  }, [address, provider])

  return namedAvatar
}
