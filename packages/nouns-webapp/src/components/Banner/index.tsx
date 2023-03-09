import { Trans } from '@lingui/macro'
import React from 'react'
import { Col } from 'react-bootstrap'

import Noun from '@/components/Noun'
import Section from '@/layout/Section'

import classes from './Banner.module.css'

import calendar_noun from '@/assets/calendar_noun.png'

const Banner: React.FC = () => {
  return (
    <Section fullWidth={false} className={classes.bannerSection}>
      <Col lg={6}>
        <div className={classes.wrapper}>
          <h1 className="h1-title">
            <Trans>ONE NOUN,</Trans>
            <br />
            <Trans>EVERY DAY,</Trans>
            <br />
            <Trans>FOREVER.</Trans>
          </h1>
        </div>
      </Col>
      <Col lg={6}>
        <div style={{ padding: '2rem' }}>
          <Noun imgPath={calendar_noun} alt="noun" />
        </div>
      </Col>
    </Section>
  )
}

export default Banner
