import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AccountState {
  activeAccount?: string
  activeChainId?: number
  activeWallet?: string
  activeName?: string
}

const initialState: AccountState = {
  activeAccount: undefined,
  activeChainId: undefined,
  activeWallet: undefined,
  activeName: undefined,
}

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setActiveAccount: (
      state,
      action: PayloadAction<string | undefined | null>,
    ) =>
      void (state.activeAccount =
        action.payload === null ? undefined : action.payload),
    setActiveChainId: (
      state,
      action: PayloadAction<number | undefined | null>,
    ) =>
      void (state.activeChainId =
        action.payload === null ? undefined : action.payload),
    setActiveWallet: (
      state,
      action: PayloadAction<string | undefined | null>,
    ) =>
      void (state.activeWallet =
        action.payload === null ? undefined : action.payload),
    setActiveName: (state, action: PayloadAction<string | undefined | null>) =>
      void (state.activeName =
        action.payload === null ? undefined : action.payload),
  },
})

export const {
  setActiveAccount,
  setActiveChainId,
  setActiveWallet,
  setActiveName,
} = accountSlice.actions

const accountReducer = accountSlice.reducer
export default accountReducer
