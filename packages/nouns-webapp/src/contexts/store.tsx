import { configureStore as configureReduxStore } from '@reduxjs/toolkit'
import { History } from 'history'
import { combineReducers, PreloadedState } from 'redux'
import { createReduxHistoryContext } from 'redux-first-history'

import account from '@/state/slices/account'
import application from '@/state/slices/application'
import auction from '@/state/slices/auction'
import cache from '@/state/slices/cache'
import logs from '@/state/slices/logs'
import onDisplayAuction from '@/state/slices/onDisplayAuction'
import pastAuctions from '@/state/slices/pastAuctions'

export interface StoreInterface {
  config: ReturnType<typeof configureReduxStore>
}

export const setupStore = (history: History) => {
  const { createReduxHistory, routerMiddleware } = createReduxHistoryContext({
    history,
  })

  const createRootReducer = () => {
    return combineReducers({
      account,
      application,
      auction,
      logs,
      pastAuctions,
      onDisplayAuction,
      cache,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configureStore = (preloadedState: PreloadedState<any>) => {
    const store = configureReduxStore({
      reducer: createRootReducer(),
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(routerMiddleware),
      devTools: true,
    })

    return store
  }

  const store = configureStore({})

  return { store, history: createReduxHistory(store) }
}
