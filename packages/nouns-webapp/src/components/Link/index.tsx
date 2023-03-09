import React, { ReactNode } from 'react'
import { Link as ReactLink } from 'react-router-dom'

import classes from './Link.module.css'

const Link: React.FC<{ text: ReactNode; url: string; leavesPage: boolean }> = (
  props,
) => {
  const { text, url, leavesPage } = props
  return (
    <ReactLink
      className={classes.link}
      to={url}
      target={leavesPage ? '_blank' : '_self'}
      rel={leavesPage ? 'noreferrer' : ''}
    >
      {text}
    </ReactLink>
  )
}
export default Link
