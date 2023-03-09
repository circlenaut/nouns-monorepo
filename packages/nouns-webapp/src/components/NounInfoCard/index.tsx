import { Trans } from '@lingui/macro'
import React from 'react'
import { Col } from 'react-bootstrap'

import NounInfoRowBirthday from '@/components/NounInfoRowBirthday'
import NounInfoRowButton from '@/components/NounInfoRowButton'
import NounInfoRowHolder from '@/components/NounInfoRowHolder'
import { useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { buildEtherscanTokenLink } from '@/utils/etherscan'

import classes from './NounInfoCard.module.css'

import _AddressIcon from '@/assets/icons/Address.svg'
import _BidsIcon from '@/assets/icons/Bids.svg'

interface NounInfoCardProps {
  nounId: number
  bidHistoryOnClickHandler: () => void
}

const NounInfoCard: React.FC<NounInfoCardProps> = (props) => {
  const { nounId, bidHistoryOnClickHandler } = props
  const { contractAddresses } = useContractAddresses()

  const etherscanButtonClickHandler = () =>
    contractAddresses &&
    window.open(buildEtherscanTokenLink(contractAddresses.nounsToken, nounId))

  const lastAuctionNounId = useAppSelector(
    (state) => state.onDisplayAuction.lastAuctionNounId,
  )

  return (
    <>
      <Col lg={12} className={classes.nounInfoRow}>
        <NounInfoRowBirthday nounId={nounId} />
      </Col>
      <Col lg={12} className={classes.nounInfoRow}>
        <NounInfoRowHolder nounId={nounId} />
      </Col>
      <Col lg={12} className={classes.nounInfoRow}>
        <NounInfoRowButton
          iconImgSource={_BidsIcon}
          btnText={
            lastAuctionNounId === nounId ? (
              <Trans>Bids</Trans>
            ) : (
              <Trans>Bid history</Trans>
            )
          }
          onClickHandler={bidHistoryOnClickHandler}
        />
        <NounInfoRowButton
          iconImgSource={_AddressIcon}
          btnText={<Trans>Etherscan</Trans>}
          onClickHandler={etherscanButtonClickHandler}
        />
      </Col>
    </>
  )
}

export default NounInfoCard
