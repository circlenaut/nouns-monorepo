import { LRUDictionary } from '@/contexts/cache'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import LRUCache from 'lru-cache'

export enum RecordActions {
  UPDATE,
  REMOVE,
  FETCH,
  MISS,
  NETWORK_CALL,
}
export interface CacheState {
  cache: LRUCache<unknown, unknown> | null
  keyStore: Record<string, LRUDictionary>
  totalFetches: number
  totalUpdates: number
  totalRemoved: number
  totalMisses: number
  totalNetworkCalls: number
}

const initialState: CacheState = {
  cache: null,
  keyStore: {},
  totalFetches: 0,
  totalUpdates: 0,
  totalRemoved: 0,
  totalMisses: 0,
  totalNetworkCalls: 0,
}

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCache: (state, action: PayloadAction<LRUCache<unknown, unknown>>) =>
      void (state.cache = action.payload as unknown as Map<unknown, unknown>),
    setCacheKeyStore: (
      state,
      action: PayloadAction<Record<string, LRUDictionary>>,
    ) => void (state.keyStore = action.payload),
    recordCacheFetch: (state, action: PayloadAction<number>) =>
      void (state.totalFetches += action.payload ?? 0),
    recordCacheUpdate: (state, action: PayloadAction<number>) =>
      void (state.totalUpdates += action.payload ?? 0),
    recordCacheRemoval: (state, action: PayloadAction<number>) =>
      void (state.totalRemoved += action.payload ?? 0),
    recordCacheMiss: (state, action: PayloadAction<number>) =>
      void (state.totalMisses += action.payload ?? 0),
    recordNetworkCall: (state, action: PayloadAction<number>) =>
      void (state.totalNetworkCalls += action.payload ?? 0),
  },
})

export const {
  recordCacheFetch,
  recordCacheUpdate,
  recordCacheRemoval,
  recordCacheMiss,
  recordNetworkCall,
  setCache,
  setCacheKeyStore,
} = cacheSlice.actions

export const cacheReducer = cacheSlice.reducer
export default cacheReducer
