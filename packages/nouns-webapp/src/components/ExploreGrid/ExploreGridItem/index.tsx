import { BigNumber } from 'ethers'
import React, { useEffect, useState } from 'react'
import { Placeholder } from 'react-bootstrap'

import { StandaloneNounImage } from '@/components/StandaloneNoun'
import { useConfig } from '@/hooks/useConfig'

interface ExploreGridItemProps {
  nounId: number | null
  imgSrc: string | undefined
}

const ExploreGridItem: React.FC<ExploreGridItemProps> = React.forwardRef<
  HTMLButtonElement,
  ExploreGridItemProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>((props, ref) => {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean | undefined>()
  const [isImageError, setIsImageError] = useState<boolean | undefined>()
  const [nounUrl, setNounUrl] = useState<string | null | undefined>()

  const { settings } = useConfig()

  useEffect(() => {
    ;(async () => {
      if (props.nounId === null) return
      setIsImageLoaded(false)
      let url: URL | null
      try {
        url = props.imgSrc
          ? new URL(props.imgSrc)
          : new URL(`${props.nounId}.svg`, settings.nounsPicsUrl)
        if (!(await fetch(url.href)).ok) return setNounUrl(null)

        setNounUrl(url.href)
        setIsImageLoaded(true)
      } catch (error) {
        setNounUrl(null)
      }
    })()
  }, [props.imgSrc, props.nounId, settings.nounsPicsUrl])

  return (
    <>
      {/* 
        Fetch NounPics URL otherwise generate image from seed; 
        show placeholder until the image loads
      */}
      {nounUrl ? (
        <img
          src={nounUrl}
          style={isImageLoaded ? {} : { display: 'none' }}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageError(true)}
          alt={`Noun #${props.nounId}`}
        />
      ) : !isImageLoaded && props.nounId ? (
        <StandaloneNounImage nounId={BigNumber.from(props.nounId)} />
      ) : (
        <div
          style={
            !isImageLoaded && !isImageError
              ? { display: 'block', height: '100%' }
              : { display: 'none' }
          }
        >
          <Placeholder xs={12} animation="glow" />
        </div>
      )}

      {/* If image can't be loaded, fetch Noun image internally */}
      {isImageError && props.nounId && (
        <StandaloneNounImage nounId={BigNumber.from(props.nounId)} />
      )}
    </>
  )
})

ExploreGridItem.displayName = 'ExploreGridItem'
export default ExploreGridItem
