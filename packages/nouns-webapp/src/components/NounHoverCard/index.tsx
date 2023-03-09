import { Trans } from '@lingui/macro'

import { useConfig } from '@/hooks/useConfig'
import { useQuery } from '@/wrappers/subgraph'
import { BigNumber } from '@ethersproject/bignumber'
import { CakeIcon, HeartIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'

import { getNounBirthday } from '@/components/NounInfoRowBirthday'
import ShortAddress from '@/components/ShortAddress'
import { StandaloneNounCircular } from '@/components/StandaloneNoun'
import { useAppSelector } from '@/hooks'
import { isNounderNoun } from '@/utils/nounderNoun'
import { nounQuery } from '@/wrappers/subgraph'

import classes from './NounHoverCard.module.css'

interface NounHoverCardProps {
  nounId: string
}

const NounHoverCard: React.FC<NounHoverCardProps> = (props) => {
  const { nounId } = props

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const fetchNoun = useCallback(async () => {
    if (!nounId) return

    const query = print(nounQuery(nounId))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [nounId])

  useEffect(
    () =>
      void !!nounId &&
      queryClient.prefetchQuery({
        queryKey: [nounQuery(nounId)],
        queryFn: fetchNoun,
      }),
    [nounId, queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [nounQuery(nounId)],
    queryFn: fetchNoun,
  })

  const pastAuctions = useAppSelector(
    (state) => state.pastAuctions.pastAuctions,
  )
  if (!pastAuctions || !pastAuctions.length) {
    return <></>
  }

  if (loading || !data || !nounId) {
    return (
      <div className={classes.spinnerWrapper}>
        <div className={classes.spinner}>
          <Spinner animation="border" />
        </div>
      </div>
    )
  }
  const numericNounId = parseInt(nounId)
  const nounIdForQuery = isNounderNoun(BigNumber.from(nounId))
    ? numericNounId + 1
    : numericNounId
  const startTime = getNounBirthday(nounIdForQuery, pastAuctions)

  if (error || !startTime) {
    return <>Failed to fetch</>
  }
  const birthday = new Date(Number(startTime._hex) * 1000)

  return (
    <div className={classes.wrapper}>
      {/* First Row */}
      <div className={classes.titleWrapper}>
        <div className={classes.nounWrapper}>
          <StandaloneNounCircular nounId={BigNumber.from(nounId)} />
        </div>
        <div>
          <h1>Noun {nounId}</h1>
        </div>
      </div>

      {/* Noun birthday */}
      <div className={classes.nounInfoWrapper}>
        <CakeIcon height={20} width={20} className={classes.icon} />
        <Trans>Born</Trans>{' '}
        <span className={classes.bold}>{i18n.date(birthday)}</span>
      </div>

      {/* Current holder */}
      <div className={clsx(classes.nounInfoWrapper, classes.currentHolder)}>
        <HeartIcon height={20} width={20} className={classes.icon} />
        <span>
          <Trans>Held by</Trans>
        </span>
        <span className={classes.bold}>
          <ShortAddress address={data.noun.owner.id} />
        </span>
      </div>
    </div>
  )
}

export default NounHoverCard
