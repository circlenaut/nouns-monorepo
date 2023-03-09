import { useConfig } from '@/hooks/useConfig'
import { useQuery } from '@/wrappers/subgraph'
import { ScaleIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'

import HorizontalStackedNouns from '@/components/HorizontalStackedNouns'
import ShortAddress from '@/components/ShortAddress'
import { delegateNounsAtBlockQuery } from '@/wrappers/subgraph'

import classes from './DelegateHoverCard.module.css'

interface DelegateHoverCardProps {
  delegateId: string
  proposalCreationBlock: number
}

const DelegateHoverCard: React.FC<DelegateHoverCardProps> = (props) => {
  const { delegateId, proposalCreationBlock } = props
  const { app } = useConfig()

  const queryClient = useQueryClient()

  const unwrappedDelegateId = delegateId
    ? delegateId.replace('delegate-', '')
    : ''

  const fetchDelegateNounsAtBlock = useCallback(async () => {
    if (!unwrappedDelegateId || !proposalCreationBlock) return

    const query = print(
      delegateNounsAtBlockQuery([unwrappedDelegateId], proposalCreationBlock),
    )
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [unwrappedDelegateId, proposalCreationBlock])

  useEffect(
    () =>
      void (unwrappedDelegateId && proposalCreationBlock) &&
      queryClient.prefetchQuery({
        queryKey: [
          delegateNounsAtBlockQuery(
            [unwrappedDelegateId],
            proposalCreationBlock,
          ),
        ],
        queryFn: fetchDelegateNounsAtBlock,
      }),
    [unwrappedDelegateId, proposalCreationBlock, queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [
      delegateNounsAtBlockQuery([unwrappedDelegateId], proposalCreationBlock),
    ],
    queryFn: fetchDelegateNounsAtBlock,
  })

  if (loading || !data || data === undefined || data.delegates.length === 0) {
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

  const numVotesForProp = data.delegates[0].nounsRepresented.length

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

      <div className={classes.nounInfoWrapper}>
        <ScaleIcon height={20} width={20} className={classes.icon} />
        {numVotesForProp === 1 ? (
          <Trans>
            Voted with<span className={classes.bold}>{numVotesForProp}</span>
            Noun
          </Trans>
        ) : (
          <Trans>
            Voted with<span className={classes.bold}>{numVotesForProp}</span>
            Nouns
          </Trans>
        )}
      </div>
    </div>
  )
}

export default DelegateHoverCard
