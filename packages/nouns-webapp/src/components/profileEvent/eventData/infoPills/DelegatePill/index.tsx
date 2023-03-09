import { ScaleIcon } from '@heroicons/react/solid'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ShortAddress from '@/components/ShortAddress'

import classes from './DelegatePill.module.css'

interface DelegatePillProps {
  address: string
  proposalId: string
}

const DelegatePill: React.FC<DelegatePillProps> = (props) => {
  const { address, proposalId } = props

  return (
    <div className={classes.wrapper}>
      <ReactTooltip
        id={'noun-profile-delegate'}
        className={classes.delegateHover}
        content={`Delegate for Proposal ${proposalId}`}
        place={'top'}
      />
      <div
        data-tip={`Delegate for Proposal ${proposalId}`}
        data-for="noun-profile-delegate"
        className={classes.pill}
      >
        <ScaleIcon className={classes.icon} />
        <ShortAddress address={address} />
      </div>
    </div>
  )
}

export default DelegatePill
