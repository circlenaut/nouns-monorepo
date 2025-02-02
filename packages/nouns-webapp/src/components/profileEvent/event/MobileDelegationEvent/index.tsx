import { ScaleIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import React from 'react'

import ShortAddress from '@/components/ShortAddress'

import { buildEtherscanTxLink } from '@/utils/etherscan'
import { DelegationEvent } from '@/wrappers/nounActivity'
import MobileNounActivityRow from '../../activityRow/MobileNounActivityRow'
import TransactionHashPill from '../../eventData/infoPills/TransactionHashPill'

import classes from './MobileDelegationEvent.module.css'

interface MobileDelegationEventProps {
  event: DelegationEvent
}

const MobileDelegationEvent: React.FC<MobileDelegationEventProps> = (props) => {
  const { event } = props

  return (
    <>
      <MobileNounActivityRow
        onClick={() =>
          window.open(buildEtherscanTxLink(event.transactionHash), '_blank')
        }
        icon={
          <div className={classes.scaleIconWrapper}>
            <ScaleIcon className={classes.scaleIcon} />
          </div>
        }
        primaryContent={
          <Trans>
            Delegate changed from
            <span className={classes.bold} style={{ margin: '0 0.5rem' }}>
              <ShortAddress address={event.previousDelegate} showZero={true} />
            </span>
            <span>to </span>
            <span className={classes.bold}>
              <ShortAddress address={event.newDelegate} showZero={true} />
            </span>
          </Trans>
        }
        secondaryContent={
          <>
            <TransactionHashPill transactionHash={event.transactionHash} />
          </>
        }
      />
    </>
  )
}

export default MobileDelegationEvent
