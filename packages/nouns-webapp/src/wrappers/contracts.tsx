import { useLRUCache } from '@/contexts/cache'
import { useAppDispatch } from '@/hooks'
import {
  RecordActions,
  recordCacheFetch,
  recordCacheMiss,
  recordCacheRemoval,
  recordCacheUpdate,
  recordNetworkCall,
} from '@/state/slices/cache'
import { Encoder } from '@msgpack/msgpack'
import { Call, CallResult, QueryParams, useCall, useCalls } from '@usedapp/core'
import {
  ContractMethodNames,
  Falsy,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'
import { useCallback } from 'react'
// import { useLogs } from '@/hooks/useLogs'
// import { recordCacheFetch, recordCacheUpdate } from '@/state/slices/cache';

const encoder = new Encoder()
// const decoder = new TextDecoder();

interface Result<T extends TypedContract, MN extends ContractMethodNames<T>> {
  value: CallResult<T, MN>[]
  error: null
}

const isCallResult = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  value: unknown,
): value is Result<T, MN> =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  'error' in value &&
  Array.isArray(value['value']) &&
  value['error'] === null

export const serialize = <T extends object>(key: T): string => {
  const encoded: number[] = Array.from(encoder.encode(key))
  return String.fromCharCode.apply(null, encoded)
}

// const isString = (value: unknown): value is string => typeof value === 'string'

// const deserialize = (encoded: unknown) => {
//   if (!isString(encoded)) {
//     throw new Error('Encoded value is not a string');
//   }
//   const decoded = new Uint8Array(encoded.split('').map((c) => c.charCodeAt(0)));
//   return decoder.decode(decoded)
// };

export const useCachedCalls = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  calls: (Call<T, MN> | Falsy)[],
  queryParams: QueryParams = {},
): CallResult<T, MN>[] => {
  const { isCached, fetchCache, updateCache, remainingCacheTime, removeCache } =
    useLRUCache()
  const dispatch = useAppDispatch()

  const recordApiStat = useCallback(
    (cacheAction: RecordActions) => {
      switch (cacheAction) {
        case RecordActions.UPDATE:
          return void dispatch(recordCacheUpdate(1))
        case RecordActions.FETCH:
          return void dispatch(recordCacheFetch(1))
        case RecordActions.REMOVE:
          return void dispatch(recordCacheRemoval(1))
        case RecordActions.MISS:
          return void dispatch(recordCacheMiss(1))
        case RecordActions.NETWORK_CALL:
          return void dispatch(recordNetworkCall(1))
      }
    },
    [dispatch],
  )

  const newResults =
    useCalls(
      calls.filter((call) => {
        const cachedKey = !!call
          ? `${call.contract.address}_${call.method}_${call.args.join('_')}`
          : null
        return !!call && isCached(cachedKey)
      }),
      queryParams,
    ) ?? []

  newResults.forEach((result, idx) => {
    const call = calls[idx]
    if (result && result.error && !!call) {
      console.error(
        `Error encountered calling ${call.method} on ${call.contract.address}: ${result.error.message}`,
      )
    }
    const cachedKey = !!call
      ? `${call.contract.address}_${call.method}_${call.args.join('_')}`
      : null

    if (cachedKey && !!result) {
      updateCache(cachedKey, result)
      recordApiStat(RecordActions.UPDATE)
      recordApiStat(RecordActions.NETWORK_CALL)
    }
  })

  const cachedResults = calls
    .filter((call) => {
      const cachedKey = call
        ? `${call.contract.address}_${call.method}_${call.args.join('_')}`
        : null
      if (cachedKey) {
        const cachedTimeLeft = remainingCacheTime(cachedKey)
        if (isCached(cachedKey)) {
          const cachedResult = fetchCache(cachedKey)
          recordApiStat(RecordActions.FETCH)
          return isCallResult(cachedResult)
        }
        if (cachedTimeLeft <= 0) {
          removeCache(cachedKey)
          recordApiStat(RecordActions.REMOVE)
          return
        }
        recordApiStat(RecordActions.MISS)
      }
    })
    .map((call) => {
      const cachedKey = call
        ? `${call.contract.address}_${call.method}_${call.args.join('_')}`
        : null

      if (cachedKey) {
        const cachedResult = fetchCache(cachedKey) as CallResult<T, MN>
        return cachedResult
      }
    })

  return [...cachedResults, ...newResults]
}

export const useCachedCall = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  call: Call<T, MN> | Falsy,
  queryParams: QueryParams = {},
): CallResult<T, MN> => {
  return useCall<T, MN>(call, queryParams)

  // const dispatch = useAppDispatch()
  // const { isCached, fetchCache, updateCache } = useLRUCache()

  // const cacheKey = call
  //   ? {
  //       address: call.contract.address,
  //       method: call.method,
  //       args: call.args,
  //     }
  //   : null

  // const cacheKey = JSON.stringify(cacheKeyParams);
  // const serializedKey = cacheKey ? serialize(cacheKey) : null

  // const cachedResult = isCached(serializedKey)
  //   ? (fetchCache(serializedKey) as CallResult<T, MN>)
  //   : null

  // const newResult = useCall<T, MN>(!cachedResult && call, queryParams)

  // if (!!newResult) {
  //   updateCache(serializedKey, newResult)
  // }

  //@TODO finish cache tracker
  // const incrementNewCall = useCallback(() =>
  //   void dispatch(recordCacheUpdate(1)),  [dispatch, newResult])

  // // useEffect(() => newResult && incrementNewCall(), [incrementNewCall, newResult])

  // const incrementCacheHit = useCallback(() =>
  //   void dispatch(recordCacheFetch(1)),  [dispatch, cachedResult])

  // return cachedResult ?? newResult
}
