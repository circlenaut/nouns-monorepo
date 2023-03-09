import { SwitchHorizontalIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import React from 'react'

import ShortAddress from '@/components/ShortAddress'
import { buildEtherscanTxLink } from '@/utils/etherscan'
import { TransferEvent } from '@/wrappers/nounActivity'
import MobileNounActivityRow from '../../activityRow/MobileNounActivityRow'
import TransactionHashPill from '../../eventData/infoPills/TransactionHashPill'

import classes from './MobileTransferEvent.module.css'

interface MobileTransferEventProps {
  event: TransferEvent
}

const MobileTransferEvent: React.FC<MobileTransferEventProps> = (props) => {
  const { event } = props

  return (
    <MobileNounActivityRow
      onClick={() =>
        window.open(buildEtherscanTxLink(event.transactionHash), '_blank')
      }
      icon={
        <div className={classes.switchIconWrapper}>
          <SwitchHorizontalIcon className={classes.switchIcon} />
        </div>
      }
      primaryContent={
        <>
          <Trans>
            Delegate changed from
            <span className={classes.bold} style={{ margin: '0 0.5rem' }}>
              <ShortAddress address={event.from} showZero={true} />
            </span>
            <span>to </span>
            <span className={classes.bold}>
              <ShortAddress address={event.to} showZero={true} />
            </span>
          </Trans>
        </>
      }
      secondaryContent={
        <>
          <TransactionHashPill transactionHash={event.transactionHash} />
        </>
      }
    />
  )
}

export default MobileTransferEvent
