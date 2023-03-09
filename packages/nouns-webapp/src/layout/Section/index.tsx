import React, { CSSProperties } from 'react'
import { Container, Row } from 'react-bootstrap'

import classes from './Section.module.css'

interface SectionProps {
  fullWidth: boolean
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

const Section: React.FC<SectionProps> = (props) => {
  const { fullWidth, className, children, style } = props
  return (
    <div className={`${classes.container} ${className}`} style={style}>
      <Container fluid={fullWidth ? true : 'lg'}>
        <Row className="align-items-center">{children}</Row>
      </Container>
    </div>
  )
}
export default Section
