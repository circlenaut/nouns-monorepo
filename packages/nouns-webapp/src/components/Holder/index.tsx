import { useConfig } from '@/hooks/useConfig'
import { useQuery } from '@/wrappers/subgraph'
import { Trans } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import ShortAddress from '@/components/ShortAddress'
import Tooltip from '@/components/Tooltip'
import { useAppSelector } from '@/hooks'
import { useEnv } from '@/hooks/useEnv'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { nounQuery } from '@/wrappers/subgraph'

import classes from './Holder.module.css'

interface HolderProps {
  nounId: number
  isNounders?: boolean
}

const Holder: React.FC<HolderProps> = (props) => {
  const { nounId, isNounders } = props

  const envs = useEnv()

  const isCool = useAppSelector((state) => state.application.isCoolBackground)

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const fetchNoun = useCallback(async () => {
    if (!nounId) return

    const query = print(nounQuery(nounId.toString()))
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
        queryKey: [nounQuery(nounId.toString())],
        queryFn: fetchNoun,
      }),
    [nounId, queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [nounQuery(nounId.toString())],
    queryFn: fetchNoun,
  })

  const holder = useMemo(() => data?.noun.owner.id, [data])

  if (loading) {
    return <></>
  } else if (error) {
    return (
      <div>
        <Trans>Failed to fetch Noun info</Trans>
      </div>
    )
  }

  const nonNounderNounContent = (
    <Link
      to={buildEtherscanAddressLink(holder)}
      target={'_blank'}
      rel="noreferrer"
      className={classes.link}
    >
      <Tooltip
        tip="View on Etherscan"
        tooltipContent={(tip: string) => {
          return <Trans>`${tip}`</Trans>
          // return <></>
        }}
        id="holder-etherscan-tooltip"
      >
        <ShortAddress size={40} address={holder} avatar={true} />
      </Tooltip>
    </Link>
  )

  const nounderNounContent = envs.NOUNDERS_ADDRESS

  return (
    <>
      <Row className={clsx(classes.wrapper, classes.section)}>
        <Col xs={1} lg={12} className={classes.leftCol}>
          <h4
            style={{
              color: isCool
                ? 'var(--brand-cool-light-text)'
                : 'var(--brand-warm-light-text)',
            }}
            className={classes.holderCopy}
          >
            <Trans>Held by</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.holderContent}
            style={{
              color: isCool
                ? 'var(--brand-cool-dark-text)'
                : 'var(--brand-warm-dark-text)',
            }}
          >
            {isNounders ? nounderNounContent : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
    </>
  )
}

export default Holder
