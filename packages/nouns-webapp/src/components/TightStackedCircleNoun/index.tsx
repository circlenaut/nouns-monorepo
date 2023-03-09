import { BigNumber } from 'ethers'
import React, { useMemo } from 'react'

import { LoadingNoun } from '@/components/Noun'
import { getNoun } from '@/components/StandaloneNoun'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useNounSeed } from '@/wrappers/nounToken'

interface TightStackedCircleNounProps {
  nounId: number
  index: number
  square: number
  shift: number
}

const TightStackedCircleNoun: React.FC<TightStackedCircleNounProps> = (
  props,
) => {
  const { nounId, index, square, shift } = props
  const { contractAddresses } = useContractAddresses()
  const seedCall = useNounSeed(contractAddresses, BigNumber.from(nounId))
  const seed = useMemo(() => seedCall, [seedCall])

  if (!seed) {
    return <LoadingNoun />
  }

  const nounData = getNoun(BigNumber.from(nounId), seed)
  const image = nounData.image

  return (
    <g key={index}>
      <clipPath id={`clipCircleNoun${nounId}`}>
        <circle
          id={`${nounId}`}
          r="20"
          cx={28 + index * shift}
          cy={square - 21 - index * shift}
          style={{
            fill: 'none',
            stroke: 'white',
            strokeWidth: '2',
          }}
        />
      </clipPath>

      <use xlinkHref={`#${nounId}`} />
      <image
        clipPath={`url(#clipCircleNoun${nounId})`}
        x={8 + index * shift}
        y={14 - index * shift}
        width="40"
        height="40"
        href={image}
      ></image>
    </g>
  )
}

export default TightStackedCircleNoun
