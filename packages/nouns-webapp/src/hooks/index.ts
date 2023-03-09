import { setupStore } from '@/contexts/store'
import { createBrowserHistory, createMemoryHistory, History } from 'history'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

let initHistory: History

if (process.env.NODE_ENV === 'test') {
  initHistory = createMemoryHistory()
} else {
  initHistory = createBrowserHistory()
}

export const { store, history } = setupStore(initHistory)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
