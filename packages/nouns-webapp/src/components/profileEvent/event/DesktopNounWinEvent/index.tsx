import { CakeIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import React from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import ShortAddress from '@/components/ShortAddress'
import {
  buildEtherscanAddressLink,
  buildEtherscanTxLink,
} from '@/utils/etherscan'
import { NounWinEvent } from '@/wrappers/nounActivity'
import DesktopNounActivityRow from '../../activityRow/DesktopNounActivityRow'
import TransactionHashPill from '../../eventData/infoPills/TransactionHashPill'

import classes from './DesktopNounWinEvent.module.css'

interface DesktopNounWinEventProps {
  event: NounWinEvent
}

const DesktopNounWinEvent: React.FC<DesktopNounWinEventProps> = (props) => {
  const { event } = props

  const isNounderNoun = parseInt(event.nounId as string) % 10 === 0
  return (
    <DesktopNounActivityRow
      icon={
        <div className={classes.switchIconWrapper}>
          <CakeIcon className={classes.switchIcon} />
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
          {isNounderNoun ? (
            <Trans>
              <span className={classes.bold}> Noun {event.nounId} </span> sent
              to{' '}
              <span
                data-tip={`View on Etherscan`}
                onClick={() =>
                  window.open(buildEtherscanAddressLink(event.winner), '_blank')
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.open(
                      buildEtherscanAddressLink(event.winner),
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
                <ShortAddress address={event.winner} />
              </span>{' '}
            </Trans>
          ) : (
            <Trans>
              <span className={classes.bold}> Noun {event.nounId} </span> won by{' '}
              <span
                data-tip={`View on Etherscan`}
                onClick={() =>
                  window.open(buildEtherscanAddressLink(event.winner), '_blank')
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.open(
                      buildEtherscanAddressLink(event.winner),
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
                <ShortAddress address={event.winner} />
              </span>{' '}
            </Trans>
          )}
        </>
      }
      secondaryContent={
        <>
          <ReactTooltip
            id={'view-on-etherscan-txn-tooltip'}
            className={classes.delegateHover}
            content={'View on Etherscan'}
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

export default DesktopNounWinEvent
