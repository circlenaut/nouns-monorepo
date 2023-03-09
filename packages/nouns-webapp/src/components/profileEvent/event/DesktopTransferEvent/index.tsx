import { SwitchHorizontalIcon } from '@heroicons/react/solid'
import { t, Trans } from '@lingui/macro'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ShortAddress from '@/components/ShortAddress'
import {
  buildEtherscanAddressLink,
  buildEtherscanTxLink,
} from '@/utils/etherscan'
import { TransferEvent } from '@/wrappers/nounActivity'
import DesktopNounActivityRow from '../../activityRow/DesktopNounActivityRow'
import TransactionHashPill from '../../eventData/infoPills/TransactionHashPill'

import classes from './DesktopTransferEvent.module.css'

interface DesktopTransferEventProps {
  event: TransferEvent
}

const DesktopTransferEvent: React.FC<DesktopTransferEventProps> = (props) => {
  const { event } = props

  return (
    <DesktopNounActivityRow
      icon={
        <div className={classes.switchIconWrapper}>
          <SwitchHorizontalIcon className={classes.switchIcon} />
        </div>
      }
      primaryContent={
        <>
          <ReactTooltip
            id={'view-on-etherscan-tooltip-primary'}
            className={classes.delegateHover}
            content={t`View on Etherscan`}
            place={'top'}
          />
          <Trans>
            Holder changed from{' '}
            <span
              data-tip={`View on Etherscan`}
              onClick={() =>
                window.open(buildEtherscanAddressLink(event.from), '_blank')
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.open(buildEtherscanAddressLink(event.from), '_blank')
                }
              }}
              role="button"
              tabIndex={0}
              data-for="view-on-etherscan-tooltip"
              className={classes.address}
            >
              {' '}
              <ShortAddress address={event.from} showZero={true} />
            </span>{' '}
            to{' '}
            <span
              data-for="view-on-etherscan-tooltip"
              onClick={() =>
                window.open(buildEtherscanAddressLink(event.to), '_blank')
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.open(buildEtherscanAddressLink(event.to), '_blank')
                }
              }}
              role="button"
              tabIndex={0}
              className={classes.address}
            >
              <ShortAddress address={event.to} showZero={true} />
            </span>
          </Trans>
        </>
      }
      secondaryContent={
        <>
          <ReactTooltip
            id={'view-on-etherscan-txn-tooltip'}
            className={classes.delegateHover}
            content={t`View on Etherscan`}
            place={'top'}
          />
          <div
            onClick={() =>
              window.open(buildEtherscanTxLink(event.transactionHash), '_blank')
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.open(
                  buildEtherscanTxLink(event.transactionHash),
                  '_blank',
                )
              }
            }}
            role="button"
            tabIndex={0}
            data-tip={`View on Etherscan`}
            data-for="view-on-etherscan-txn-tooltip"
          >
            <TransactionHashPill transactionHash={event.transactionHash} />
          </div>
        </>
      }
    />
  )
}

export default DesktopTransferEvent
