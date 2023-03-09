import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CacheState {
  cacheHit: number
  newCall: number
}

const initialState: CacheState = {
  cacheHit: 0,
  newCall: 0,
}

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCacheHit: (state, action: PayloadAction<number>) =>
      void (state.cacheHit = state.cacheHit + action.payload),
    setNewCall: (state, action: PayloadAction<number>) =>
      void (state.newCall = state.newCall + action.payload),
  },
})

export const { setCacheHit, setNewCall } = cacheSlice.actions

export const cacheReducer = cacheSlice.reducer
export default cacheReducer
