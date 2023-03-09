import React from 'react'

import classes from './AuctionActivityWrapper.module.css'

interface Props {
  children: React.ReactNode
}

const AuctionActivityWrapper: React.FC<Props> = (props) => {
  return <div className={classes.wrapper}>{props.children}</div>
}

export default AuctionActivityWrapper
