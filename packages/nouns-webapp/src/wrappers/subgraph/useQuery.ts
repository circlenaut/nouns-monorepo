import { DocumentNode, useQuery as useApolloQuery } from '@apollo/client'
import { useQuery as useReactQuery } from '@tanstack/react-query'

import { DEFAULT_GRAPHQL_CLIENT } from '@/configs/constants'

export enum GraphQLClient {
  REACT = 'REACT',
  APOLLO = 'APOLLO',
}

export interface QueryResult<TData> {
  loading: boolean
  data: TData | null
  error?: Error
}

export type QueryFunction<TData> = () => Promise<TData>

export interface Query<TData> {
  queryKey: DocumentNode[]
  queryFn?: QueryFunction<TData>
  client?: GraphQLClient
  skip?: boolean
}

const processReactQuery = <TData>(
  queryKey: DocumentNode[],
  queryFn: QueryFunction<TData>,
  skip?: boolean,
) =>
  ((result) => ({
    loading: result.isLoading,
    data:
      result.data !== undefined && result.data !== null ? result.data : null,
    error: result.error instanceof Error ? result.error : undefined,
  }))(useReactQuery({ queryKey, queryFn, enabled: skip }))

const processApolloQuery = <TData>(queryKey: DocumentNode[], skip?: boolean) =>
  ((result) => ({
    loading: result.loading,
    data:
      result.data !== undefined && result.data !== null ? result.data : null,
    error: result.error instanceof Error ? result.error : undefined,
  }))(useApolloQuery<TData>(queryKey[0], { skip }))

export const useQuery = <TData>(
  {
    queryKey,
    queryFn,
    client = DEFAULT_GRAPHQL_CLIENT,
    skip = false,
  }: Query<TData> = { queryKey: [] },
): QueryResult<TData> =>
  !!queryKey &&
  queryKey.length > 0 &&
  queryKey[0] !== undefined &&
  typeof queryKey[0]
    ? (() => {
        switch (client) {
          case GraphQLClient.REACT:
            return !!queryFn
              ? processReactQuery<TData>(queryKey, queryFn, skip)
              : { loading: false, data: null, error: undefined }
          case GraphQLClient.APOLLO:
            return processApolloQuery<TData>(queryKey, skip)
          default:
            throw new Error(`Error: Invalid query client: ${client}!`)
        }
      })()
    : { loading: false, data: null, error: undefined }
