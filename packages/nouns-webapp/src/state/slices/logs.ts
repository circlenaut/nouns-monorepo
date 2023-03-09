import { EventFilter, filterToKey, Log } from '@/utils/logParsing'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LogsState {
  [filterKey: string]: {
    listeners: number
    fetchingBlockNumber?: number
    results?: {
      blockNumber: number
      logs?: Log[]
      error?: boolean
    }
  }
}

const slice = createSlice({
  name: 'logs',
  initialState: {} as LogsState,
  reducers: {
    addListener(
      state,
      { payload: { filter } }: PayloadAction<{ filter: EventFilter }>,
    ) {
      const key = filterToKey(filter)
      const fetchState = state[key]
      state[key] = fetchState
        ? { listeners: fetchState.listeners++ }
        : { listeners: 1 }
    },
    fetchingLogs(
      state,
      {
        payload: { filters, blockNumber },
      }: PayloadAction<{ filters: EventFilter[]; blockNumber: number }>,
    ) {
      filters.reduce((acc, filter) => {
        const key = filterToKey(filter)
        const fetchState = state[key]
        if (fetchState) {
          state[key] = { fetchingBlockNumber: blockNumber, ...fetchState }
        }
        return acc
      }, undefined)
    },
    fetchedLogs(
      state,
      {
        payload: { filter, results },
      }: PayloadAction<{
        filter: EventFilter
        results: { blockNumber: number; logs: Log[] }
      }>,
    ) {
      const key = filterToKey(filter)
      const fetchState = state[key]
      if (
        !fetchState ||
        (fetchState.results &&
          fetchState.results.blockNumber > results.blockNumber)
      )
        return
      fetchState.results = results
    },
    fetchedLogsError(
      state,
      {
        payload: { filter, blockNumber },
      }: PayloadAction<{ blockNumber: number; filter: EventFilter }>,
    ) {
      const key = filterToKey(filter)
      const fetchState = state[key]

      if (
        !fetchState ||
        (fetchState.results && fetchState.results.blockNumber > blockNumber)
      )
        return
      fetchState.results = {
        blockNumber,
        error: true,
      }
    },
    removeListener(
      state,
      { payload: { filter } }: PayloadAction<{ filter: EventFilter }>,
    ) {
      const key = filterToKey(filter)
      const fetchState = state[key]
      state[key] = fetchState
        ? { listeners: fetchState.listeners-- }
        : { listeners: 0 }
    },
  },
})

const logsReducer = slice.reducer

export const {
  addListener,
  removeListener,
  fetchedLogs,
  fetchedLogsError,
  fetchingLogs,
} = slice.actions

export default logsReducer
