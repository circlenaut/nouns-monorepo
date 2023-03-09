import { Encoder } from '@msgpack/msgpack'
import { Call, CallResult, QueryParams, useCall, useCalls } from '@usedapp/core'
import {
  ContractMethodNames,
  Falsy,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'
import LRUCache from 'lru-cache'

import { useAppDispatch } from '@/hooks'

const CACHE_MAX_AGE = 1000 * 60 * 5 // cache for 5 minutes
const CACHE_MAX_ITEMS = 1000 // store at most 500 objects

const cache = new LRUCache({ max: CACHE_MAX_ITEMS, ttl: CACHE_MAX_AGE })

const encoder = new Encoder()
const decoder = new TextDecoder()

const u8aToString = (value?: Uint8Array | null): string =>
  !value?.length ? '' : decoder.decode(value)

const encodeCacheKey = (key: ContractCacheKey | null) => {
  return key ? u8aToString(encoder.encode(key)) : ''
}

// const decodeCacheKey = (key: ContractCacheKey | null) => {
//   return key ? decoder.decode(encoder.encode(key)) : '';
// };

export const serialize = <T extends object>(key: T): string => {
  const encoded: number[] = Array.from(encoder.encode(key))
  return String.fromCharCode.apply(null, encoded)
}

interface ContractCacheKey {
  address: Call['contract']['address']
  method: Call['method']
  args?: Call['args']
}

export const useCachedCalls = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  calls: (Call<T, MN> | Falsy)[],
  queryParams: QueryParams = {},
  // ): CallResult<T, MN>[] => calls.map(call => useCachedCall(call, queryParams))
): CallResult<T, MN>[] => {
  const cachedCallsKeyParams = calls.map((call) =>
    call
      ? {
          address: call.contract.address,
          method: call.method,
          args: call.args,
        }
      : null,
  )
  // console.debug('cacheKeyParams', cachedCallsKeyParams)

  const cacheKeys = cachedCallsKeyParams.map((params) => encodeCacheKey(params))
  // console.debug('cacheKey', cacheKeys)

  const [cachedCalls, fetchNewCalls] = cacheKeys.reduce(
    (accumulator, key) => {
      const [cachedCallsArr, newCallsArr] = accumulator
      const callResult = cache.get(key) as CallResult<T, MN> | undefined
      // console.debug('key', key, cache.has(key))
      if (callResult !== undefined) {
        cachedCallsArr.push(callResult)
      } else {
        // cache.set(key, callResult);
        newCallsArr.push(callResult)
      }
      return [cachedCallsArr, newCallsArr]
    },
    [[] as CallResult<T, MN>[], [] as (CallResult<T, MN> | undefined)[]],
  ) as [CallResult<T, MN>[], CallResult<T, MN>[]]

  // console.debug('cachedCalls', cachedCalls)
  // console.debug('fetchNewCalls', fetchNewCalls)

  const newCalls = useCalls(
    // fetchNewCalls.map((key) => {
    // const params = decodeCacheKey(key);
    calls
      .map((call) => {
        return (
          call && {
            contract: call.contract,
            method: call.method,
            args: call.args,
          }
        )
      })
      .filter((call) => !!call) as Array<Call<T, MN>>,
    queryParams,
  )

  // const filteredCalls = fetchNewCalls.map(
  //   call => call && call
  //   ) as Array<Call<T, MN>>
  // const newCalls = useCalls(filteredCalls, queryParams);

  // const newCalls = useCalls({
  //   calls: calls.map(call => call && call)
  // }, queryParams)
  // if (newCalls) {
  //   console.debug('newCalls', newCalls.map(c => c?.value))
  //   if (cache.size >= CACHE_MAX_ITEMS) {
  //     const leastRecentlyUsedKey = cache.purgeStale();
  //     cache.delete(leastRecentlyUsedKey);
  //   }
  //   cache.set(cacheKey, newCalls);
  // }

  // return cachedCalls ?? newCalls
  return [...cachedCalls, ...newCalls]
}

export const useCachedCall = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  call: Call<T, MN> | Falsy,
  queryParams: QueryParams = {},
): CallResult<T, MN> => {
  const dispatch = useAppDispatch()

  const cacheKey = call
    ? {
        address: call.contract.address,
        method: call.method,
        args: call.args,
      }
    : null

  // const cacheKey = JSON.stringify(cacheKeyParams);
  const serializedKey = cacheKey ? serialize(cacheKey) : null

  const cachedResult = cache.has(serializedKey)
    ? (cache.get(serializedKey) as CallResult<T, MN>)
    : null

  const newResult = useCall<T, MN>(!cachedResult && call, queryParams)

  //@TODO finish cache tracker
  // const incrementNewCall = useCallback(() =>
  //   void dispatch(setNewCall(1)),  [dispatch, newResult])

  // // useEffect(() => newResult && incrementNewCall(), [incrementNewCall, newResult])

  // const incrementCacheHit = useCallback(() =>
  //   void dispatch(setCacheHit(1)),  [dispatch, cachedResult])

  if (newResult) {
    if (cache.size >= CACHE_MAX_ITEMS) {
      const leastRecentlyUsedKey = cache.purgeStale()
      cache.delete(leastRecentlyUsedKey)
    }
    cache.set(serializedKey, newResult)
    // incrementNewCall()
  }
  if (cachedResult) {
    // incrementCacheHit()
  }

  return cachedResult ?? newResult
}
