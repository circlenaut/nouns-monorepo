import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ContractState {
  activeNountoken?: string
}

const initialState: ContractState = {
  activeNountoken: undefined,
}

export const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setActiveNounToken: (
      state,
      action: PayloadAction<string | undefined | null>,
    ) =>
      void (state.activeNountoken =
        action.payload === null ? undefined : action.payload),
  },
})

export const { setActiveNounToken } = contractSlice.actions

export const contractReducer = contractSlice.reducer
