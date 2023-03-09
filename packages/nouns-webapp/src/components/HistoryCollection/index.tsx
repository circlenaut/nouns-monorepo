import clsx from 'clsx'
import { BigNumber, BigNumberish } from 'ethers'
import React from 'react'
import { Container, Row } from 'react-bootstrap'

import { LoadingNoun } from '@/components/Noun'
import StandaloneNoun from '@/components/StandaloneNoun'
import { useConfig } from '@/hooks/useConfig'
import Section from '@/layout/Section'

import classes from '@/components/HistoryCollection.module.css'

interface HistoryCollectionProps {
  historyCount: number
  latestNounId: BigNumberish
}

const HistoryCollection: React.FC<HistoryCollectionProps> = (
  props: HistoryCollectionProps,
) => {
  const { historyCount, latestNounId } = props

  const { app } = useConfig()

  if (!latestNounId) return null

  const startAtZero = BigNumber.from(latestNounId).sub(historyCount).lt(0)

  let nounIds: Array<BigNumber | null> = new Array(historyCount)
  nounIds = nounIds.fill(null).map((_, i) => {
    if (BigNumber.from(i).lt(latestNounId)) {
      const index = startAtZero
        ? BigNumber.from(0)
        : BigNumber.from(Number(latestNounId) - historyCount)
      return index.add(i)
    } else {
      return null
    }
  })

  const nounsContent = nounIds.map((nounId, i) => {
    return !nounId ? (
      <LoadingNoun key={i} />
    ) : (
      <StandaloneNoun key={i} nounId={nounId} />
    )
  })

  return (
    <Section fullWidth={true}>
      <Container fluid>
        <Row className="justify-content-md-center">
          <div className={clsx(classes.historyCollection)}>
            {app.enableHistory && nounsContent}
          </div>
        </Row>
      </Container>
    </Section>
  )
}

export default HistoryCollection
