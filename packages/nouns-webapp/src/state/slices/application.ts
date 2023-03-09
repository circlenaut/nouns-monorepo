import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import React, { ReactNode } from 'react'

import { grey } from '@/utils/nounBgColors'

export interface AlertModal {
  show: boolean
  title?: ReactNode
  message?: ReactNode
}

export interface ApplicationState {
  stateBackgroundColor: string
  isCoolBackground: boolean
  alertModal: AlertModal
}

const initialState: ApplicationState = {
  stateBackgroundColor: grey,
  isCoolBackground: true,
  alertModal: {
    show: false,
  },
}

export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setStateBackgroundColor: (state, action: PayloadAction<string>) => {
      state.stateBackgroundColor = action.payload
      state.isCoolBackground = action.payload === grey
    },
    setAlertModal: (state, action: PayloadAction<AlertModal>) => {
      const isElement = React.isValidElement(action.payload?.title)
      if (isElement) return
      state.alertModal = action.payload
    },
  },
})

export const { setStateBackgroundColor, setAlertModal } =
  applicationSlice.actions

const applicationReducer = applicationSlice.reducer
export default applicationReducer
