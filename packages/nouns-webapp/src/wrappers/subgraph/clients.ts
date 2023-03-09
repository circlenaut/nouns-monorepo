import { ApolloClient, InMemoryCache } from '@apollo/client'
import { QueryClient } from '@tanstack/react-query'

import { DEFAULT_REACT_QUERY_STALE_TIME } from '@/configs/constants'

export const apolloClientFactory = (uri: string) =>
  new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    // name: 'react-web-client',
    // version: '1.3',
    // queryDeduplication: false,
    // defaultOptions: {
    //   watchQuery: {
    //     fetchPolicy: 'cache-and-network',
    //   },
    // },
  })

export const reactClientFactory = (staleTime?: number) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: staleTime ?? DEFAULT_REACT_QUERY_STALE_TIME,
      },
    },
  })
