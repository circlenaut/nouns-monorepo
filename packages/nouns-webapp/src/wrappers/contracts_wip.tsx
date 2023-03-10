import { Call, CallResult, QueryParams, useCall, useCalls } from '@usedapp/core'
import LRUCache from 'lru-cache'

import { Decoder, Encoder } from '@msgpack/msgpack'
import {
  ContractMethodNames,
  Falsy,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'

const CACHE_MAX_AGE = 1000 * 60 * 5 // cache for 5 minutes
const CACHE_MAX_ITEMS = 1000 // store at most 500 objects

interface ContractCacheKey {
  address: Call['contract']['address']
  method: Call['method']
  args?: Call['args']
}

const cache = new LRUCache({ max: CACHE_MAX_ITEMS, ttl: CACHE_MAX_AGE })

const encoder = new Encoder()

const decoder = new Decoder()

export const serialize = <T extends object>(key: T): string => {
  const encoded: number[] = Array.from(encoder.encode(key))
  return String.fromCharCode.apply(null, encoded)
}

const deserialize = (encoded: unknown) => {
  if (!isString(encoded)) {
    throw new Error('Encoded value is not a string')
  }
  const decoded = new Uint8Array(encoded.split('').map((c) => c.charCodeAt(0)))
  return decoder.decode(decoded)
}

interface ExampleOutput<
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
> {
  value: CallResult<T, MN>[]
  error: null
}

const isCallResult = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  value: unknown,
): value is ExampleOutput<T, MN> =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  'error' in value &&
  Array.isArray(value['value']) &&
  value['error'] === null
// && value['value'].every((result) => (
//   typeof result === 'object' &&
//   result !== null &&
//   'data' in result &&
//   'meta' in result &&
//   typeof result['data'] === 'object' &&
//   typeof result['meta'] === 'object'
// ))

const isString = (value: unknown): value is string => typeof value === 'string'

export const useCachedCalls = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  calls: (Call<T, MN> | Falsy)[],
  queryParams: QueryParams = {},
): CallResult<T, MN>[] => {
  const newResults =
    useCalls(
      calls.filter((call) => {
        const cachedKey = call
          ? {
              address: call.contract.address,
              method: call.method,
              args: call.args,
            }
          : null
        if (cachedKey) {
          const serializedCacheKey = serialize(cachedKey)
          const cachedResult = cache.get(serializedCacheKey)
          // return !!call && !isCallResult(cachedResult)
          return !!call && cache.has(serializedCacheKey)
        }
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
      ? {
          address: call.contract.address,
          method: call.method,
          args: call.args,
        }
      : null

    if (cachedKey && result) {
      const serializedCacheKey = serialize(cachedKey)
      // const serializedResult = serialize(result)
      cache.set(serializedCacheKey, result)
      // const deserializedResult = deserialize(serializedResult) as CallResult<T, MN>
      // cache.set(serializedCacheKey, serializedResult)
      // const deserializedResult = deserialize(serializedResult) as CallResult<T, MN>
    }
  })

  const cachedResults = calls
    .filter((call) => {
      const cachedKey = call
        ? {
            address: call.contract.address,
            method: call.method,
            args: call.args,
          }
        : null
      if (cachedKey) {
        const serializedCacheKey = serialize(cachedKey)
        if (cache.has(serializedCacheKey)) {
          const cachedResult = cache.get(serializedCacheKey)
          return isCallResult(cachedResult)
        }
      }
      // const serializedCacheKey = cachedKey ? serialize(cachedKey) : null;
      // if (cache.has(serializedCacheKey)) {
      //   const serializedResult = cache.get(serializedCacheKey)
      //   const deserializedResult = deserialize(serializedResult) as CallResult<T, MN>
      //   return isCallResult(deserializedResult)
      // }
    })
    .map((call) => {
      const cachedKey = call
        ? {
            address: call.contract.address,
            method: call.method,
            args: call.args,
          }
        : null

      if (cachedKey) {
        const serializedCacheKey = serialize(cachedKey)
        const cachedResult = cache.get(serializedCacheKey) as CallResult<T, MN>
        return cachedResult
        // const serializedResult = cache.get(serializedCacheKey)
        // const deserializedResult = deserialize(serializedResult) as CallResult<T, MN>
        // return deserializedResult
        // const deserializedResult = deserialize(serializedResult) as CallResult<T, MN>
      }
    })

  // return newResults
  // return cachedResults
  // const results = [...cachedResults, ...newResults]
  // return results
  return newResults
}

export const useCachedCall = <
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(
  call: Call<T, MN> | Falsy,
  queryParams: QueryParams = {},
): CallResult<T, MN> => {
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
  // if (cachedCall) {
  // }

  const newResult = useCall<T, MN>(!cachedResult && call, queryParams)

  if (newResult) {
    if (cache.size >= CACHE_MAX_ITEMS) {
      const leastRecentlyUsedKey = cache.purgeStale()
      cache.delete(leastRecentlyUsedKey)
    }
    cache.set(serializedKey, newResult)
  }
  return cachedResult ?? newResult
}
