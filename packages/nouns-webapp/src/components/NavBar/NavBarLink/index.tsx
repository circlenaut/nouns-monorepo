import React from 'react'
import { Link } from 'react-router-dom'

import classes from './NavBarLink.module.css'

interface NavBarLinkProps {
  to: string
  className?: string
  children?: React.ReactNode
}

const NavBarLink: React.FC<NavBarLinkProps> = (props) => {
  const { to, children, className } = props
  // hacks to make React Router work with external links
  const onClick = () => (/http/.test(to) ? (window.location.href = to) : null)
  const target = /http/.test(to) ? '_blank' : ''
  return (
    <Link
      to={to}
      className={`${classes.navBarLink} ${className}`}
      onClick={onClick}
      target={target}
    >
      <div>{children}</div>
    </Link>
  )
}
export default NavBarLink
