import { Trans } from '@lingui/macro'
import React from 'react'

import { useAppSelector } from '@/hooks'

import bidBtnClasses from './BidHistoryBtn.module.css'

const BidHistoryBtn: React.FC<{ onClick: () => void }> = (props) => {
  const { onClick } = props

  const isCool =
    useAppSelector((state) => state.application.stateBackgroundColor) ===
    '#d5d7e1'

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick()
    }
  }

  return (
    <div
      className={
        isCool
          ? bidBtnClasses.bidHistoryWrapperCool
          : bidBtnClasses.bidHistoryWrapperWarm
      }
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={bidBtnClasses.bidHistory}>
        <Trans>View all bids</Trans>
      </div>
    </div>
  )
}

export default BidHistoryBtn
