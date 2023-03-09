import { BigNumber } from '@ethersproject/bignumber'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import React from 'react'
import { Image } from 'react-bootstrap'

import { useAppSelector } from '@/hooks'
import { AuctionState } from '@/state/slices/auction'
import { isNounderNoun } from '@/utils/nounderNoun'

import classes from './NounInfoRowBirthday.module.css'

import _BirthdayIcon from '@/assets/icons/Birthday.svg'

interface NounInfoRowBirthdayProps {
  nounId: number
}

export const getNounBirthday = (
  nounId: number,
  pastAuctions: AuctionState[],
) => {
  return BigNumber.from(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pastAuctions.find((auction: AuctionState, i: number) => {
      const maybeNounId = auction.activeAuction?.nounId
      return maybeNounId
        ? BigNumber.from(maybeNounId).eq(BigNumber.from(nounId))
        : false
    })?.activeAuction?.startTime || 0,
  )
}

const NounInfoRowBirthday: React.FC<NounInfoRowBirthdayProps> = (props) => {
  const { nounId } = props

  // If the noun is a nounder noun, use the next noun to get the mint date.
  // We do this because we use the auction start time to get the mint date and
  // nounder nouns do not have an auction start time.
  const nounIdForQuery = isNounderNoun(BigNumber.from(nounId))
    ? nounId + 1
    : nounId

  const pastAuctions = useAppSelector(
    (state) => state.pastAuctions.pastAuctions,
  )
  if (!pastAuctions || !pastAuctions.length) {
    return <></>
  }

  const startTime = getNounBirthday(nounIdForQuery, pastAuctions)
  if (!startTime) {
    return <Trans>Error fetching Noun birthday</Trans>
  }

  const birthday = new Date(Number(startTime._hex) * 1000)

  return (
    <div className={classes.birthdayInfoContainer}>
      <span>
        <Image src={_BirthdayIcon} className={classes.birthdayIcon} />
      </span>
      <Trans>Born</Trans>
      <span className={classes.nounInfoRowBirthday}>
        {i18n.date(birthday, {
          month: 'long',
          year: 'numeric',
          day: '2-digit',
        })}
      </span>
    </div>
  )
}

export default NounInfoRowBirthday
