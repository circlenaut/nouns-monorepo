import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import React, { useMemo } from 'react'
import { Card, Col, Row } from 'react-bootstrap'

import { useActiveLocale } from '@/hooks/useActivateLocale'
import { Proposal } from '@/wrappers/nounsDao'
import DelegateGroupedNounImageVoteTable, {
  DelegateVote,
} from '@/components/DelegateGroupedNounImageVoteTable'
import NounImageVoteTable from '@/components/NounImageVoteTable'
import VoteProgressBar from '@/components/VoteProgressBar'

// tslint:disable:ordered-imports
import classes from './VoteCard.module.css'
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css'
import cacheNameServiceAddresses from '@/utils/cacheAddresses'

export enum VoteCardVariant {
  FOR,
  AGAINST,
  ABSTAIN,
}

interface VoteCardProps {
  proposal: Proposal
  percentage: number
  nounIds: Array<string>
  variant: VoteCardVariant
  delegateView: boolean
  delegateGroupedVoteData: DelegateVote[] | undefined
}

const VoteCard: React.FC<VoteCardProps> = (props) => {
  const {
    proposal,
    percentage,
    nounIds,
    variant,
    delegateView,
    delegateGroupedVoteData,
  } = props

  let titleClass
  let titleCopy
  let voteCount
  let supportDetailedValue: 0 | 1 | 2
  switch (variant) {
    case VoteCardVariant.FOR:
      titleClass = classes.for
      titleCopy = <Trans>For</Trans>
      voteCount = useMemo(() => proposal.forCount, [proposal])
      supportDetailedValue = 1
      break
    case VoteCardVariant.AGAINST:
      titleClass = classes.against
      titleCopy = <Trans>Against</Trans>
      voteCount = useMemo(() => proposal.againstCount, [proposal])
      supportDetailedValue = 0
      break
    default:
      titleClass = classes.abstain
      titleCopy = <Trans>Abstain</Trans>
      voteCount = useMemo(() => proposal.abstainCount, [proposal])
      supportDetailedValue = 2
      break
  }

  const locale = useActiveLocale()
  const filteredDelegateGroupedVoteData =
    delegateGroupedVoteData?.filter(
      (v) => v.supportDetailed === supportDetailedValue,
    ) ?? []
  const isEnUS = locale === 'en-US'

  // Pre-fetch ENS  of delegates (with 30min TTL)
  // This makes hover cards load more smoothly
  const delegateAddresses = useMemo(
    () =>
      delegateGroupedVoteData?.map(
        (delegateInfo: { delegate: string }) => delegateInfo.delegate,
      ),
    [delegateGroupedVoteData],
  )
  delegateAddresses &&
    cacheNameServiceAddresses({ addresses: delegateAddresses, cacheTTL: 30000 })

  return (
    <Col lg={4} className={classes.wrapper}>
      <Card className={classes.voteCountCard}>
        <Card.Body className="p-2">
          <Card.Text className="py-2 m-0">
            <span
              className={`${
                isEnUS
                  ? classes.voteCardHeaderTextEn
                  : classes.voteCardHeaderTextNonEn
              } ${titleClass}`}
            >
              {titleCopy}
            </span>
            <span
              className={clsx(
                classes.voteCardVoteCount,
                responsiveUiUtilsClasses.desktopOnly,
                !isEnUS ? classes.smallerVoteCountText : '',
              )}
            >
              {delegateView ? (
                <>
                  {filteredDelegateGroupedVoteData.length === 1 ? (
                    <Trans>
                      {i18n.number(filteredDelegateGroupedVoteData.length)}{' '}
                      <span
                        className={
                          isEnUS ? classes.unitTextEn : classes.unitTextNonEn
                        }
                      >
                        Address
                      </span>
                    </Trans>
                  ) : (
                    <Trans>
                      {i18n.number(filteredDelegateGroupedVoteData.length)}{' '}
                      <span
                        className={
                          isEnUS ? classes.unitTextEn : classes.unitTextNonEn
                        }
                      >
                        Addresses
                      </span>
                    </Trans>
                  )}
                </>
              ) : (
                i18n.number(voteCount)
              )}
            </span>
          </Card.Text>

          <Card.Text
            className={clsx('py-2 m-0', classes.mobileVoteCountWrapper)}
          >
            <span className={classes.voteCardVoteCount}>
              {delegateView
                ? i18n.number(filteredDelegateGroupedVoteData.length)
                : i18n.number(voteCount)}
            </span>
            <span
              className={clsx(
                classes.voteCardVoteCount,
                isEnUS ? classes.unitTextEn : classes.unitTextNonEn,
              )}
            >
              {delegateView && <Trans>Addresses</Trans>}
            </span>
          </Card.Text>

          <VoteProgressBar variant={variant} percentage={percentage} />
          <Row className={classes.nounProfilePics}>
            {delegateView ? (
              <DelegateGroupedNounImageVoteTable
                filteredDelegateGroupedVoteData={
                  filteredDelegateGroupedVoteData
                }
                propId={parseInt(proposal.id || '0')}
                proposalCreationBlock={proposal.createdBlock}
              />
            ) : (
              <NounImageVoteTable
                nounIds={nounIds}
                propId={parseInt(proposal.id || '0')}
              />
            )}
          </Row>
        </Card.Body>
      </Card>
    </Col>
  )
}

export default VoteCard
