import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import { useEtherBalance } from '@usedapp/core'
import clsx from 'clsx'
import { BigNumber, constants, utils } from 'ethers'
import React, { useMemo } from 'react'
import { Col, Row } from 'react-bootstrap'

import Proposals from '@/components/Proposals'
import { ETH_DECIMAL_PLACES } from '@/configs'
import { useContractAddresses } from '@/hooks/useAddresses'
import useLidoBalance from '@/hooks/useLidoBalance'
import useTokenBuyerBalance from '@/hooks/useTokenBuyerBalance'
import { useTreasuryUSDValue } from '@/hooks/useTreasuryBalance'
import Section from '@/layout/Section'
import { useAllProposals, useProposalThreshold } from '@/wrappers/nounsDao'

import classes from './Governance.module.css'

const GovernancePage: React.FC = () => {
  // Setting default address to avoid hook order error on useEtherBalance and useTreasuryBalance
  const { contractAddresses } = useContractAddresses()

  const proposalsCall = useAllProposals(contractAddresses)

  const proposals = useMemo(() => proposalsCall, [proposalsCall])

  const thresholdCall = useProposalThreshold(contractAddresses)
  const threshold = useMemo(() => thresholdCall, [thresholdCall])
  const nounsRequired = threshold !== undefined ? threshold + 1 : '...'

  const ethBalance = useEtherBalance(contractAddresses.nounsDaoExecutor)
  const lidoBalanceAsETH = useLidoBalance()
  const tokenBuyerBalanceAsETH = useTokenBuyerBalance()
  const zero = BigNumber.from(0)
  const treasuryBalance =
    ethBalance
      ?.add(lidoBalanceAsETH ?? zero)
      .add(tokenBuyerBalanceAsETH ?? zero) ?? zero

  const treasuryBalanceUSD = useTreasuryUSDValue(treasuryBalance)

  // Note: We have to extract this copy out of the <span> otherwise the Lingui macro gets confused
  const nounSingular = <Trans>Noun</Trans>
  const nounPlural = <Trans>Nouns</Trans>
  return (
    <>
      <Section fullWidth={false} className={classes.section}>
        <Col lg={10} className={classes.wrapper}>
          <Row className={classes.headerRow}>
            <span>
              <Trans>Governance</Trans>
            </span>
            <h1>
              <Trans>Nouns DAO</Trans>
            </h1>
          </Row>
          <p className="paragraph className={classes.subheading}">
            <Trans>
              Nouns govern <span className={classes.boldText}>Nouns DAO</span>.
              Nouns can vote on proposals or delegate their vote to a third
              party. A minimum of{' '}
              <span className={classes.boldText}>
                {nounsRequired}{' '}
                {threshold && threshold === 0 ? nounSingular : nounPlural}
              </span>{' '}
              is required to submit proposals.
            </Trans>
          </p>

          <Row className={classes.treasuryInfoCard}>
            <Col lg={8} className={classes.treasuryAmtWrapper}>
              <Row className={classes.headerRow}>
                <span>
                  <Trans>Treasury</Trans>
                </span>
              </Row>
              <Row>
                <Col className={clsx(classes.ethTreasuryAmt)} lg={3}>
                  <h1 className={classes.ethSymbol}>{constants.EtherSymbol}</h1>
                  <h1>
                    {treasuryBalance
                      ? i18n.number(
                          Number(
                            Number(utils.formatEther(treasuryBalance)).toFixed(
                              ETH_DECIMAL_PLACES,
                            ),
                          ),
                        )
                      : 0}
                  </h1>
                </Col>
                <Col className={classes.usdTreasuryAmt}>
                  <h1 className={classes.usdBalance}>
                    {treasuryBalanceUSD
                      ? i18n.number(Number(treasuryBalanceUSD.toFixed(0)), {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : 0}
                  </h1>
                </Col>
              </Row>
            </Col>
            <Col className={classes.treasuryInfoText}>
              <Trans>
                This treasury exists for{' '}
                <span className={classes.boldText}>Nouns DAO</span> participants
                to allocate resources for the long-term growth and prosperity of
                the Nouns project.
              </Trans>
            </Col>
          </Row>
          {proposals && <Proposals proposals={proposals.data} />}
        </Col>
      </Section>
    </>
  )
}
export default GovernancePage
