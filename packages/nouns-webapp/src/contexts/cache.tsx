import { Falsy } from '@usedapp/core'
import LRUCache from 'lru-cache'
import React, {
  createContext,
  Key,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { AppDispatch, useAppDispatch, useAppSelector } from '@/hooks'

import { recordCacheUpdate, setCacheKeyStore } from '@/state/slices/cache'

export interface LRUDictionary {
  key: Key
  value: unknown
}

interface LRUCacheProviderContext {
  cache: LRUCache<unknown, unknown>
  cacheState: LRUCache<unknown, unknown>
  getKeyMap: (_cache: LRUCache<unknown, unknown>) => object
  updateCache: (key: unknown, value: unknown, ttl?: number) => void
  removeCache: (key: unknown) => void
  isCached: (key: unknown) => boolean
  fetchCache: (key: unknown) => unknown
  remainingCacheTime: (key: unknown) => number
  resetCache: () => void
  cacheSize: number
  getCacheSize: () => void
  getCacheKeys: () => Generator<unknown, void, void>
  removeExpired: () => boolean
  cacheDump: [unknown, LRUCache.Entry<unknown>][]
  leastRecentlyUsedKey: unknown
  keyStore: {
    [key: string]: LRUDictionary
  } | null
  cachedKeysList: LRUDictionary[]
  keyMap: {
    [key: string]: LRUDictionary
  }
}

export const LRUCacheContext = createContext<LRUCacheProviderContext | null>(
  null,
)

interface LRUCacheProviderProp {
  cache: LRUCache<unknown, unknown>
  children: ReactNode
}

export const LRUCacheProvider: React.FC<LRUCacheProviderProp> = ({
  cache,
  children,
}) => {
  const [cacheState, setCacheState] =
    useState<LRUCache<unknown, unknown>>(cache)

  // const handleCacheHit = useCallback((cacheHit) => recordCacheFetch((prev) => prev++), [cacheHit])
  // const handleCacheHit = useCallback(recordCacheFetch((prev) => prev++), [cacheHit])

  const dispatch = useAppDispatch()

  const { keyStore } = useAppSelector((state) => state.cache)

  const getKeyMap = (_cache: LRUCache<unknown, unknown>) =>
    [..._cache.entries()]
      .map(([key, value]) => ({ key, value }))
      .reduce(
        (result, { key, value }) => ({
          ...result,
          [key as string]: { key, value },
        }),
        {},
      )

  // const getKeyMap = useCallback((_cache: LRUCache<unknown,unknown>) => {
  // 	const _cacheKeyStore = [..._cache.keys()].map((key) => ({ key, value: _cache.get(key) })) as LRUDictionary[]
  // 	const result = _cacheKeyStore.reduce(
  // 		(result: {[key: string]: LRUDictionary} , map: LRUDictionary) => {
  // 			result[map.key] = {
  // 				key: map.key,
  // 				value: map.value
  // 			};
  // 			return result;
  // 		}, {}
  // 	)
  // 	return result
  // }, [])

  // const setCachedKeys = useCallback((_keyStore: Record<string,LRUDictionary>) => {
  // 	dispatch(setCacheKeyStore(_keyStore));
  // }, [cache]);

  const updateCache = useCallback(
    (key: unknown, value: unknown, ttl?: number) => {
      const result = cache.set(key, value, {
        ttl: ttl ?? cache.ttl,
      })
      setCacheState(cache)
      dispatch(setCacheKeyStore(getKeyMap(result)))
      // dispatch(recordCacheUpdate(1))
      console.debug(`Set cache key (${key}): ${cache.get(key)}`)
      return result
    },
    [dispatch, cache],
  )

  const removeCache = useCallback(
    (key: unknown) => {
      const result = cache.delete(key)
      setCacheState(cache)
      dispatch(setCacheKeyStore(getKeyMap(cache)))
      console.debug(`Deleted cache key (${key}): ${cache.get(key)}`)
      return result
    },
    [dispatch, cache],
  )

  const isCached = (key: unknown) => cache.has(key)

  const fetchCache = useCallback(
    (key: unknown) => {
      // dispatch(recordCacheFetch(1))
      // recordCacheFetch((prev) => prev++)
      return cache.get(key)
    },
    [dispatch, cache],
  )

  const remainingCacheTime = (key: unknown) => cache.getRemainingTTL(key)

  const removeExpired = () => cache.purgeStale()

  const resetCache = () => cache.clear()

  const cacheSize = cache.size

  const getCacheSize = () => cache.size

  const getCacheKeys = () => cache.keys()

  const cacheDump = cache.dump()

  const leastRecentlyUsedKey = ((dump) => dump[dump.length - 1]?.[0])(
    cache.dump(),
  )

  const cachedKeysList = [...getCacheKeys()].map((key) => ({
    key,
    value: fetchCache(key),
  })) as LRUDictionary[]

  const keyMap: { [key: string]: LRUDictionary } = cachedKeysList.reduce(
    (result, { key }) => ({ ...result, [key]: fetchCache(key) }),
    {},
  )

  // 	const cleanup = useRef(() => {
  // 		if (cache.size >= cache.maxSize) {
  //       const leastRecentlyUsedKey = ((dump) => dump[dump.length-1]?.[0])(cache.dump())
  //       cache.delete(leastRecentlyUsedKey)
  //     }
  // 		removeExpired()
  // 		console.debug('Cached purged')
  //   })

  // useEffect(() => () => void cleanup.current() && console.debug('Cached purged'), [])
  useEffect(() => {
    // const currentCleanup = cleanup.current
    return () => {
      //   currentCleanup()
      removeExpired()
      console.debug('Cached purged')
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      cache,
      cacheState,
      getKeyMap,
      updateCache,
      removeCache,
      isCached,
      fetchCache,
      remainingCacheTime,
      resetCache,
      cacheSize,
      getCacheSize,
      getCacheKeys,
      removeExpired,
      cacheDump,
      leastRecentlyUsedKey,
      keyStore,
      cachedKeysList,
      keyMap,
    }),
    [
      cache,
      cacheState,
      getKeyMap,
      updateCache,
      removeCache,
      isCached,
      fetchCache,
      remainingCacheTime,
      resetCache,
      cacheSize,
      getCacheSize,
      leastRecentlyUsedKey,
      getCacheKeys,
      removeExpired,
      cacheDump,
      keyStore,
      cachedKeysList,
      keyMap,
    ],
  )

  return (
    <LRUCacheContext.Provider value={contextValue}>
      {children}
    </LRUCacheContext.Provider>
  )
}

export const useLRUCache = () => {
  const cache = useContext(LRUCacheContext)
  if (!cache) {
    throw new Error('useLRUCache must be used within a LRUCacheProvider')
  }
  return cache
}

interface HookParams<Params extends unknown[]> {
  params: [...Params]
  skip?: boolean
}

interface HookOptions<Params extends unknown[], Result>
  extends HookParams<Params> {
  fn: (...params: Params) => Result | Falsy
}

interface Payload {
  payload: number
  type: string
}

interface AsyncHookOptions<Params extends unknown[], Result>
  extends HookParams<Params> {
  fn: ((...params: Params) => Promise<Result | Falsy>) | undefined
  // lruContext?: () => React.Context<LRUCacheProviderContext | null>
  lruContext?: LRUCacheProviderContext
  appDispatch?: AppDispatch
}

interface HookResult<Result> {
  loading?: boolean
  result?: Result | null
  isCalled?: boolean
  isCalledSignal?: string | null
}

interface HookCacheOptions<Params extends unknown[], Result>
  extends HookOptions<Params, Result | undefined> {
  cacheKey: string
}

interface AsyncHookCacheOptions<Params extends unknown[], Result>
  extends AsyncHookOptions<Params, Result | undefined> {
  cacheKey: string
}

interface HookCacheResult<Result> {
  data?: Result | null
}

const encodeHookData = <Params extends unknown[], Result>({
  fn,
  skip,
}: HookOptions<Params, Result>) => {
  let isFnCalled = false
  if (!fn || skip) {
    // console.debug('Skipping hook!')
    return { undefined, isFnCalled }
  }
  isFnCalled = true
  console.debug(`Calling hook function: ${fn.name}`)
  return { fn, isFnCalled }
}

const encodeAsyncHookData = <Params extends unknown[], Result>({
  fn,
  skip,
}: AsyncHookOptions<Params, Result>) => {
  let isFnCalled = false
  if (!fn || skip) {
    // console.debug('Skipping hook!')
    return { undefined, isFnCalled }
  }
  isFnCalled = true
  console.debug(`Calling hook function: ${fn.name}`)
  return { fn, isFnCalled }
}

export const useConditionalHook = <Params extends unknown[], Result>({
  fn,
  params,
  skip,
}: HookOptions<Params, Result>): HookResult<Result> => {
  const { fn: encodedHook } = encodeHookData({ fn, params, skip })

  const fnResultRef = useRef<Result | Falsy>()
  const signalRef = useRef<string | null>(null)

  const result = encodedHook && encodedHook(...params)
  signalRef.current = !!fnResultRef.current ? Math.random().toString() : null

  const signal = useMemo(
    () => (signalRef.current ? Math.random().toString() : null),
    [signalRef.current],
  )

  return { result: result ? result : null, isCalledSignal: signal }
}

export const useAsyncConditionalHook = async <
  Params extends unknown[],
  Result,
>({
  fn,
  params,
  skip,
}: AsyncHookOptions<Params, Result>): Promise<HookResult<Result>> => {
  const { fn: encodedHook } = encodeAsyncHookData({ fn, params, skip })

  const result = encodedHook && (await encodedHook(...params))

  return { result: result ? result : null, isCalled: !!encodedHook }
}

export const useCachedHook = <Params extends unknown[], Result>({
  fn,
  params,
  cacheKey,
}: HookCacheOptions<Params, Result>): HookCacheResult<Result> => {
  const { updateCache, isCached, fetchCache } = useLRUCache()

  const dispatch = useAppDispatch()

  const cachedDataRef = useRef(fetchCache(cacheKey) as Result | undefined)
  const hasCachedDataRef = useRef(isCached(cacheKey))
  const [data, setData] = useState<Result | undefined>(undefined)

  const useHookRef = useRef(() =>
    useConditionalHook({
      fn,
      params,
      skip: hasCachedDataRef.current || !!cachedDataRef.current,
    }),
  )

  const { result: hookData, isCalledSignal: isHookCalled } =
    useHookRef.current()

  const handleNewApiCall = useCallback(
    (_calls: number) => {
      dispatch(recordCacheUpdate(_calls))
    },
    [dispatch],
  )

  const isHookCalledRef = useRef(false)

  useEffect(() => {
    if (isHookCalled) {
      handleNewApiCall(1)
    }
  }, [isHookCalledRef, handleNewApiCall])

  const cleanup = useCallback(() => {
    isHookCalledRef.current = true
  }, [])

  useEffect(() => {
    const currentCleanup = cleanup
    return () => {
      currentCleanup()
    }
  }, [cleanup])

  const fetchData = useCallback(() => {
    const cachedData = fetchCache(cacheKey) as Result | undefined

    if (!!cachedData) {
      return cachedData
    } else if (!!hookData) {
      updateCache(cacheKey, hookData)
      return hookData
    }
  }, [cacheKey, updateCache, hookData])

  useEffect(() => {
    const result = fetchData()

    if (result !== undefined) {
      setData(result)
    }
  }, [fetchData, setData])

  return { data }
}

export const useAsyncCachedHook = async <Params extends unknown[], Result>({
  fn,
  params,
  cacheKey,
  lruContext,
  appDispatch,
}: AsyncHookCacheOptions<Params, Result>): Promise<HookCacheResult<Result>> => {
  const LRUCache = lruContext

  const cachedData = LRUCache?.fetchCache(cacheKey) as Result | undefined
  const hasCachedData = LRUCache?.isCached(cacheKey)

  const { result: hookData } = await useAsyncConditionalHook({
    fn: async (...params: Params) => fn && (await fn(...params)),
    params,
    skip: hasCachedData || !!cachedData,
  })

  const fetchData = () => {
    const cachedData = LRUCache?.fetchCache(cacheKey) as Result | undefined

    if (!!cachedData) {
      return cachedData
    } else if (!!hookData) {
      LRUCache?.updateCache(cacheKey, hookData)
      return hookData
    }
  }

  return { data: fetchData() }
}
