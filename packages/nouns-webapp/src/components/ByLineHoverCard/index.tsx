import { ScaleIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'

import HorizontalStackedNouns from '@/components/HorizontalStackedNouns'
import ShortAddress from '@/components/ShortAddress'
import { useConfig } from '@/hooks/useConfig'
import { currentlyDelegatedNouns, useQuery } from '@/wrappers/subgraph'

import classes from './ByLineHoverCard.module.css'

interface ByLineHoverCardProps {
  proposerAddress: string
}

const MAX_NOUN_IDS_SHOWN = 12

const ByLineHoverCard: React.FC<ByLineHoverCardProps> = (props) => {
  const { proposerAddress } = props

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const fetchCurrentlyDelegatedNouns = useCallback(async () => {
    if (!proposerAddress) return

    const query = print(currentlyDelegatedNouns(proposerAddress))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [proposerAddress])

  useEffect(
    () =>
      void !!proposerAddress &&
      queryClient.prefetchQuery({
        queryKey: [currentlyDelegatedNouns(proposerAddress)],
        queryFn: fetchCurrentlyDelegatedNouns,
      }),
    [proposerAddress, queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [currentlyDelegatedNouns(proposerAddress)],
    queryFn: fetchCurrentlyDelegatedNouns,
  })

  if (loading || (data && data.delegates.length === 0)) {
    return (
      <div className={classes.spinnerWrapper}>
        <div className={classes.spinner}>
          <Spinner animation="border" />
        </div>
      </div>
    )
  }
  if (error) {
    return <>Error fetching Vote info</>
  }

  const sortedNounIds = data.delegates[0].nounsRepresented
    .map((noun: { id: string }) => {
      return parseInt(noun.id)
    })
    .sort((a: number, b: number) => {
      return a - b
    })

  return (
    <div className={classes.wrapper}>
      <div className={classes.stackedNounWrapper}>
        <HorizontalStackedNouns
          nounIds={data.delegates[0].nounsRepresented.map(
            (noun: { id: string }) => noun.id,
          )}
        />
      </div>

      <div className={classes.address}>
        <ShortAddress address={data ? data.delegates[0].id : ''} />
      </div>

      <div className={classes.nounsRepresented}>
        <div>
          <ScaleIcon height={15} width={15} className={classes.icon} />
          {sortedNounIds.length === 1 ? (
            <Trans>
              <span>Delegated Noun: </span>
            </Trans>
          ) : (
            <Trans>
              <span>Delegated Nouns: </span>
            </Trans>
          )}

          {sortedNounIds
            .slice(0, MAX_NOUN_IDS_SHOWN)
            .map((nounId: number, i: number) => {
              return (
                <span className={classes.bold} key={nounId.toString()}>
                  {nounId}
                  {i !==
                    Math.min(MAX_NOUN_IDS_SHOWN, sortedNounIds.length) - 1 &&
                    ', '}{' '}
                </span>
              )
            })}
          {sortedNounIds.length > MAX_NOUN_IDS_SHOWN && (
            <span>
              <Trans>
                ... and {sortedNounIds.length - MAX_NOUN_IDS_SHOWN} more
              </Trans>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ByLineHoverCard
