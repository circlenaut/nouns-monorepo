import React from 'react'
import { Image } from 'react-bootstrap'

import classes from './Noun.module.css'

import loadingNoun from '@/assets/loading-skull-noun.gif'

export const LoadingNoun = () => {
  return (
    <div className={classes.imgWrapper}>
      <Image
        className={classes.img}
        src={loadingNoun}
        alt={'loading noun'}
        fluid
      />
    </div>
  )
}

const Noun: React.FC<{
  imgPath: string
  alt: string
  className?: string
  wrapperClassName?: string
}> = (props) => {
  const { imgPath, alt, className, wrapperClassName } = props
  return (
    <div className={`${classes.imgWrapper} ${wrapperClassName}`}>
      <Image
        className={`${classes.img} ${className}`}
        src={imgPath ? imgPath : loadingNoun}
        alt={alt}
        fluid
      />
    </div>
  )
}

export default Noun
