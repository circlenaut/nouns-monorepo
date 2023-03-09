import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import classes from './HoverCard.module.css'

interface HoverCardProps {
  hoverCardContent: (dataTip: string) => React.ReactNode
  tip: string
  id: string
  children?: React.ReactNode
}

const HoverCard: React.FC<HoverCardProps> = (props) => {
  const { hoverCardContent, tip, id } = props
  const renderHoverCardContent = (dataTip: string) => {
    return <div>{hoverCardContent(dataTip)}</div>
  }

  return (
    <>
      <ReactTooltip
        id={id}
        // arrowColor={'rgba(0,0,0,0)'}
        className={classes.hover}
        // effect={'solid'}
        content={`${renderHoverCardContent(tip)}`}
        place={'top'}
      />
      <div data-tip={tip} data-for={id}>
        {props.children}
      </div>
    </>
  )
}

export default HoverCard
