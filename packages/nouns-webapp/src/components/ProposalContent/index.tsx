import { InformationCircleIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import { utils } from 'ethers'
import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkBreaks from 'remark-breaks'

import NnsOrEnsOrLongAddress from '@/components/NnsOrEnsOrLongAddress'
import ShortAddress from '@/components/ShortAddress'
import { useContractAddresses } from '@/hooks/useAddresses'
import {
  buildEtherscanAddressLink,
  buildEtherscanTxLink,
} from '@/utils/etherscan'
import { processProposalDescriptionText } from '@/utils/processProposalDescriptionText'
import { Proposal } from '@/wrappers/nounsDao'

import classes from './ProposalContent.module.css'

interface ProposalContentProps {
  proposal?: Proposal
}

export const linkIfAddress = (content: string) => {
  if (utils.isAddress(content)) {
    return (
      <Link
        to={buildEtherscanAddressLink(content)}
        target="_blank"
        rel="noreferrer"
      >
        <NnsOrEnsOrLongAddress address={content} />
      </Link>
    )
  }
  return <span>{content}</span>
}

export const transactionLink = (content: string) => {
  return (
    <Link to={buildEtherscanTxLink(content)} target="_blank" rel="noreferrer">
      {content.substring(0, 7)}
    </Link>
  )
}

const ProposalContent: React.FC<ProposalContentProps> = (props) => {
  const { proposal } = props
  const { contractAddresses } = useContractAddresses()

  return (
    <>
      <Row>
        <Col className={classes.section}>
          <h5>
            <Trans>Description</Trans>
          </h5>
          {proposal?.description && (
            <ReactMarkdown
              className={classes.markdown}
              remarkPlugins={[remarkBreaks]}
            >
              {processProposalDescriptionText(
                proposal.description,
                proposal.title,
              )}
            </ReactMarkdown>
          )}
        </Col>
      </Row>
      <Row>
        <Col className={classes.section}>
          <h5>
            <Trans>Proposed Transactions</Trans>
          </h5>
          <ol>
            {proposal?.details?.map((d, i) => {
              const addr = d.callData.split(',')?.[1]
              return (
                <li key={i} className="m-0">
                  {linkIfAddress(d.target)}.{d.functionSig}
                  {d.value}
                  {!!d.functionSig ? (
                    <>
                      (<br />
                      {d.callData.split(',').map((content, i) => {
                        return (
                          <Fragment key={i}>
                            <span key={i}>
                              &emsp;
                              {linkIfAddress(content)}
                              {d.callData.split(',').length - 1 === i
                                ? ''
                                : ','}
                            </span>
                            <br />
                          </Fragment>
                        )
                      })}
                      )
                    </>
                  ) : (
                    d.callData
                  )}
                  {d.target.toLowerCase() ===
                    contractAddresses.tokenBuyer?.toLowerCase() && (
                    <div className={classes.txnInfoText}>
                      <div className={classes.txnInfoIconWrapper}>
                        <InformationCircleIcon
                          className={classes.txnInfoIcon}
                        />
                      </div>
                      <div>
                        <Trans>
                          This transaction was automatically added to refill the
                          TokenBuyer. Proposers do not receive this ETH.
                        </Trans>
                      </div>
                    </div>
                  )}
                  {d.target.toLowerCase() ===
                    contractAddresses.payerContract?.toLowerCase() && (
                    <div className={classes.txnInfoText}>
                      <div className={classes.txnInfoIconWrapper}>
                        <InformationCircleIcon
                          className={classes.txnInfoIcon}
                        />
                      </div>
                      <div>
                        {addr && (
                          <Trans>
                            This transaction sends{' '}
                            {Intl.NumberFormat(undefined, {
                              maximumFractionDigits: 6,
                            }).format(Number(utils.formatUnits(addr, 6)))}{' '}
                            USDC to <ShortAddress address={addr} /> via the
                            DAO&apos;s PayerContract.
                          </Trans>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </Col>
      </Row>
    </>
  )
}

export default ProposalContent
