import { ScaleIcon } from '@heroicons/react/solid'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ShortAddress from '@/components/ShortAddress'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { DelegationEvent } from '@/wrappers/nounActivity'
import DesktopNounActivityRow from '../../activityRow/DesktopNounActivityRow'
import TransactionHashPill from '../../eventData/infoPills/TransactionHashPill'

import classes from './DesktopDelegationEvent.module.css'

interface DesktopDelegationEventProps {
  event: DelegationEvent
}

const DesktopDelegationEvent: React.FC<DesktopDelegationEventProps> = (
  props,
) => {
  const { event } = props

  return (
    <DesktopNounActivityRow
      icon={
        <div className={classes.scaleIconWrapper}>
          <ScaleIcon className={classes.scaleIcon} />
        </div>
      }
      primaryContent={
        <>
          <ReactTooltip
            id={'view-on-etherscan-tooltip'}
            className={classes.delegateHover}
            content={'View on Etherscan'}
            place={'top'}
          />
          Delegate changed from
          <span
            data-tip={`View on Etherscan`}
            onClick={() =>
              window.open(
                buildEtherscanAddressLink(event.previousDelegate),
                '_blank',
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.open(
                  buildEtherscanAddressLink(event.previousDelegate),
                  '_blank',
                )
              }
            }}
            role="button"
            tabIndex={0}
            data-for="view-on-etherscan-tooltip"
            className={classes.address}
          >
            {' '}
            <ShortAddress address={event.previousDelegate} showZero={true} />
          </span>{' '}
          to{' '}
          <span
            data-tip={`View on Etherscan`}
            data-for="view-on-etherscan-tooltip"
            onClick={() =>
              window.open(
                buildEtherscanAddressLink(event.newDelegate),
                '_blank',
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.open(
                  buildEtherscanAddressLink(event.newDelegate),
                  '_blank',
                )
              }
            }}
            role="button"
            tabIndex={0}
            className={classes.address}
          >
            <ShortAddress address={event.newDelegate} showZero={true} />
          </span>
        </>
      }
      secondaryContent={
        <>
          <ReactTooltip
            id={'view-on-etherscan-txn-delegate-tooltip'}
            className={classes.delegateHover}
            content={'View on Etherscan'}
            place={'top'}
          />
          <div
            data-tip={`View on Etherscan`}
            data-for="view-on-etherscan-txn-delegate-tooltip"
          >
            <TransactionHashPill transactionHash={event.transactionHash} />
          </div>
        </>
      }
    />
  )
}

export default DesktopDelegationEvent
