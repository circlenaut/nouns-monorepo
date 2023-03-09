import { utils } from 'ethers'
import React from 'react'
import { Col, OverlayTrigger, Popover, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { ProposalTransaction } from '@/wrappers/nounsDao'

import classes from './ProposalTransactions.module.css'

import xIcon from '@/assets/x-icon.png'

interface ProposalTransactionsProps {
  className?: string
  proposalTransactions: ProposalTransaction[]
  onRemoveProposalTransaction: (index: number) => void
}

const ProposalTransactions: React.FC<ProposalTransactionsProps> = ({
  className,
  proposalTransactions,
  onRemoveProposalTransaction,
}: ProposalTransactionsProps) => {
  const getPopover = (tx: ProposalTransaction) => (
    <Popover className={classes.popover} id="transaction-details-popover">
      <Popover.Header as="h3">Transaction Details</Popover.Header>
      <Popover.Body>
        <Row>
          <Col sm="3">
            <b>Address</b>
          </Col>
          <Col sm="9">
            <Link
              to={buildEtherscanAddressLink(tx.address)}
              target="_blank"
              rel="noreferrer"
            >
              {tx.address}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Value</b>
          </Col>
          <Col sm="9">
            {tx.value ? `${utils.formatEther(tx.value)} ETH` : 'None'}
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Function</b>
          </Col>
          <Col sm="9">{tx.signature || 'None'}</Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Calldata</b>
          </Col>
          <Col sm="9">
            {tx.calldata === '0x'
              ? 'None'
              : tx.decodedCalldata
              ? tx.decodedCalldata
              : tx.calldata}
          </Col>
        </Row>
      </Popover.Body>
    </Popover>
  )

  return (
    <div className={className}>
      {proposalTransactions.map((tx, i) => (
        <OverlayTrigger
          key={i}
          trigger={['hover', 'focus']}
          placement="top"
          overlay={getPopover(tx)}
        >
          <div
            className={`${classes.transactionDetails} d-flex justify-content-between align-items-center`}
          >
            <div>
              <span>Transaction #{i + 1} - </span>
              <span>
                <b>{tx.signature || 'transfer()'}</b>
              </span>
            </div>
            <button
              className={classes.removeTransactionButton}
              onClick={() => onRemoveProposalTransaction(i)}
            >
              <img src={xIcon} alt="Remove Transaction" />
            </button>
          </div>
        </OverlayTrigger>
      ))}
    </div>
  )
}
export default ProposalTransactions
