import { useQueryClient } from '@tanstack/react-query'
import { print } from 'graphql/language/printer'
import React, { useCallback, useEffect, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { useConfig } from '@/hooks/useConfig'
import { addPastAuctions } from '@/state/slices/pastAuctions'
import { latestAuctionsQuery, useQuery } from '@/wrappers/subgraph'

const PastAuctions: React.FC = () => {
  const latestAuctionId = useAppSelector(
    (state) => state.onDisplayAuction.lastAuctionNounId,
  )

  const { app } = useConfig()

  const dispatch = useAppDispatch()

  const queryClient = useQueryClient()

  const fetchLatestAuctions = useCallback(async () => {
    const query = print(latestAuctionsQuery())
    const response = await fetch(app.subgraphApiUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const { data } = await response.json()
    return data
  }, [])

  useEffect(
    () =>
      void queryClient.prefetchQuery({
        queryKey: [latestAuctionsQuery()],
        queryFn: fetchLatestAuctions,
      }),
    [queryClient],
  )

  const { data } = useQuery({
    queryKey: [latestAuctionsQuery()],
    queryFn: fetchLatestAuctions,
  })

  const latestData = useRef(null)

  useEffect(() => {
    if (data && data !== latestData.current) {
      latestData.current = data
      dispatch(addPastAuctions({ data }))
    }
  }, [data, latestAuctionId, dispatch])

  return <></>
}

export default PastAuctions
