import React from 'react'

import classes from './NavBarItem.module.css'

interface NavBarItemProps {
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const NavBarItem: React.FC<NavBarItemProps> = (props) => {
  const { onClick, children, className } = props
  return (
    <button
      type="button"
      className={` ${classes.navBarItem} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default NavBarItem
