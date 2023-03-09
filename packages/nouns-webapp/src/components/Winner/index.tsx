import { Trans } from '@lingui/macro'
import clsx from 'clsx'
import React, { useMemo } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import ShortAddress from '@/components/ShortAddress'
import Tooltip from '@/components/Tooltip'
import { useAppSelector } from '@/hooks'
import { useActiveLocale } from '@/hooks/useActivateLocale'
import { useEnv } from '@/hooks/useEnv'
import { Locales } from '@/i18n/locales'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { isMobileScreen } from '@/utils/isMobile'

import classes from './Winner.module.css'

interface WinnerProps {
  winner: string
  isNounders?: boolean
}

const Winner: React.FC<WinnerProps> = (props) => {
  const { winner, isNounders } = props
  const isCool = useAppSelector((state) => state.application.isCoolBackground)
  const isMobile = isMobileScreen()

  const { activeAccount, activeChainId: chainId } = useAppSelector(
    (state) => state.account,
  )

  const isWinnerYou = useMemo(
    () =>
      chainId &&
      activeAccount !== undefined &&
      activeAccount.toLocaleLowerCase() === winner.toLocaleLowerCase(),
    [chainId, activeAccount, winner],
  )

  const activeLocale = useActiveLocale()

  const envs = useEnv()

  const nonNounderNounContent = isWinnerYou ? (
    <Row className={classes.youSection}>
      <Col
        lg={activeLocale === Locales.ja_JP ? 8 : 4}
        className={classes.youCopy}
      >
        <h2
          className={classes.winnerContent}
          style={{
            color: isCool
              ? 'var(--brand-cool-dark-text)'
              : 'var(--brand-warm-dark-text)',
          }}
        >
          <Trans>You</Trans>
        </h2>
      </Col>
      {!isMobile && (
        <Col>
          <Link
            to="https://nouns.center/groups"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>Get Involved</Trans>
            </Button>
          </Link>
          <Link
            to="https://www.nounsagora.com/"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>Delegate</Trans>
            </Button>
          </Link>
        </Col>
      )}
    </Row>
  ) : (
    <ShortAddress size={40} address={winner} avatar={true} showZero={true} />
  )

  const nounderNounContent = (
    <Link
      to={buildEtherscanAddressLink(envs.NOUNDERS_ADDRESS)}
      target={'_blank'}
      rel="noreferrer"
      className={classes.link}
    >
      <Tooltip
        tip="View on Etherscan"
        tooltipContent={(tip: string) => {
          return <Trans>${tip}</Trans>
        }}
        id="holder-etherscan-tooltip"
      >
        {envs.NOUNDERS_ADDRESS}
      </Tooltip>
    </Link>
  )

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
            className={classes.winnerCopy}
          >
            <Trans>Winner</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.winnerContent}
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
      {isWinnerYou && isMobile && (
        <Row>
          <Link
            to="https://nouns.center/groups"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>Get Involved</Trans>
            </Button>
          </Link>
          <Link
            to="https://www.nounsagora.com/"
            target="_blank"
            rel="noreferrer noopener"
            className={classes.verifyLink}
          >
            <Button className={classes.verifyButton}>
              <Trans>Delegate</Trans>
            </Button>
          </Link>
        </Row>
      )}
    </>
  )
}

export default Winner
