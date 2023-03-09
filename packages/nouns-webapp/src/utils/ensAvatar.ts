import { useEthers } from '@usedapp/core'
import { useEffect, useState } from 'react'

export const useEnsAvatarLookup = (address: string) => {
  const { library } = useEthers()
  const [ensAvatar, setEnsAvatar] = useState<string>()

  useEffect(() => {
    ;(async () => {
      let mounted = true
      if (address && library) {
        await library
          .lookupAddress(address)
          .then((name) => {
            if (!name) return
            library.getResolver(name).then((resolver) => {
              if (!resolver) return
              resolver
                .getText('avatar')
                .then((avatar) => {
                  if (mounted) {
                    setEnsAvatar(avatar)
                  }
                })
                .catch((error) => {
                  console.error(`error resolving ens avatar: `, error)
                })
            })
          })
          .catch((error) => {
            console.error(`error resolving reverse ens lookup: `, error)
          })
      }

      return () => {
        setEnsAvatar('')
        mounted = false
      }
    })()
  }, [address, library])

  return ensAvatar
}
