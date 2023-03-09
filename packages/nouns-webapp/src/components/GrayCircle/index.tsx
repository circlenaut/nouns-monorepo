import Noun from '@/components/Noun'
import React from 'react'

// tslint:disable:ordered-imports
import nounClasses from '@/components/Noun/Noun.module.css'
import classes from './GrayCircle.module.css'

import { getGrayBackgroundSVG } from '@/utils/grayBackgroundSVG'

interface GrayCircleProps {
  isDelegateView?: boolean
}

export const GrayCircle: React.FC<GrayCircleProps> = (props) => {
  const { isDelegateView } = props
  return (
    <div className={isDelegateView ? classes.wrapper : ''}>
      <Noun
        imgPath={getGrayBackgroundSVG()}
        alt={''}
        wrapperClassName={
          isDelegateView
            ? nounClasses.delegateViewCircularNounWrapper
            : nounClasses.circularNounWrapper
        }
        className={
          isDelegateView
            ? nounClasses.delegateViewCircular
            : nounClasses.circular
        }
      />
    </div>
  )
}
