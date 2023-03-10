import React, { ReactNode, TouchEvent } from 'react'

import classes from './MobileNounActivityRow.module.css'

interface MobileNounActivityRowProps {
  onClick: (event: TouchEvent) => void
  icon: ReactNode
  primaryContent: ReactNode
  secondaryContent?: ReactNode
}

const MobileNounActivityRow: React.FC<MobileNounActivityRowProps> = (props) => {
  const { onClick, icon, primaryContent, secondaryContent } = props

  return (
    <div
      className={classes.wrapper}
      onTouchStart={onClick}
      onTouchEnd={(e) => {
        e.preventDefault()
        onClick(e)
      }}
    >
      <div className={classes.icon}>{icon}</div>

      <div className={classes.content}>
        <div>{primaryContent}</div>
        <div>{secondaryContent}</div>
      </div>
    </div>
  )
}

export default MobileNounActivityRow
