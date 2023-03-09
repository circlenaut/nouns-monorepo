import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import classes from './Tooltip.module.css'

interface TooltipProps {
  tooltipContent: (dataTip: string) => React.ReactNode
  tip: string
  id: string
  children?: React.ReactNode
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const { tooltipContent, tip, id } = props

  return (
    <>
      <ReactTooltip
        id={id}
        className={classes.hover}
        content={`${tooltipContent(tip)}`}
      />
      <div data-tip={tip} data-for={id}>
        {props.children}
      </div>
    </>
  )
}

export default Tooltip
