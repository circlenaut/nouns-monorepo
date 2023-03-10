import { Trans } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'
// import { HeartIcon, LinkIcon } from '@heroicons/react/solid'

import ShortAddress from '@/components/ShortAddress'
import Tooltip from '@/components/Tooltip'
import { useAppSelector } from '@/hooks'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useConfig } from '@/hooks/useConfig'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { auctionQuery, useQuery } from '@/wrappers/subgraph'

import classes from './NounInfoRowHolder.module.css'

import _HeartIcon from '@/assets/icons/Heart.svg'
import _LinkIcon from '@/assets/icons/Link.svg'
import { toShortAddress } from '@/utils/addressAndChainNameDisplayUtils'
import { constants } from 'ethers'

interface NounInfoRowHolderProps {
  nounId: number
}

const NounInfoRowHolder: React.FC<NounInfoRowHolderProps> = (props) => {
  const { nounId } = props
  const isCool = useAppSelector((state) => state.application.isCoolBackground)

  const { app } = useConfig()

  const queryClient = useQueryClient()

  const fetchAuction = useCallback(async () => {
    if (!nounId) return

    const query = print(auctionQuery(nounId))
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [nounId])

  useEffect(
    () =>
      void !!nounId &&
      queryClient.prefetchQuery({
        queryKey: [auctionQuery(nounId)],
        queryFn: fetchAuction,
      }),
    [nounId, queryClient],
  )

  const { loading, data, error } = useQuery({
    queryKey: [auctionQuery(nounId)],
    queryFn: fetchAuction,
  })
  const isLoading = useMemo(() => loading, [loading])

  const { contractAddresses } = useContractAddresses()
  const shortZero = toShortAddress(constants.AddressZero)

  const winner = useMemo(
    () => (!!data?.auction.bidder ? data?.auction.bidder.id : shortZero),
    [data],
  )

  if (isLoading || !winner) {
    return (
      <div className={classes.nounHolderInfoContainer}>
        <span className={classes.nounHolderLoading}>
          <Trans>Loading...</Trans>
        </span>
      </div>
    )
  } else if (error) {
    return (
      <div>
        <Trans>Failed to fetch Noun info</Trans>
      </div>
    )
  }

  const etherscanURL = buildEtherscanAddressLink(winner)
  const shortAddressComponent = (
    <ShortAddress address={winner} showZero={true} />
  )

  return (
    <Tooltip
      tip="View on Etherscan"
      tooltipContent={(tip: string) => {
        return <Trans>`${tip}`</Trans>
      }}
      id="holder-etherscan-tooltip"
    >
      <div className={classes.nounHolderInfoContainer}>
        <span>
          <Image src={_HeartIcon} className={classes.heartIcon} />
        </span>
        <span>
          <Trans>Winner</Trans>
        </span>
        <span>
          <Link
            className={
              isCool
                ? classes.nounHolderEtherscanLinkCool
                : classes.nounHolderEtherscanLinkWarm
            }
            to={etherscanURL}
            target={'_blank'}
            rel="noreferrer"
          >
            {winner.toLowerCase() ===
            contractAddresses.nounsAuctionHouseProxy.toLowerCase() ? (
              <Trans>Nouns Auction House</Trans>
            ) : (
              shortAddressComponent
            )}
            <span className={classes.linkIconSpan}>
              <Image src={_LinkIcon} className={classes.linkIcon} />
            </span>
          </Link>
        </span>
      </div>
    </Tooltip>
  )
}

export default NounInfoRowHolder
