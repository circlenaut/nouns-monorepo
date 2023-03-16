import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import React, { ReactNode } from 'react'

import { grey } from '@/utils/nounBgColors'

export interface AlertModal {
  show: boolean
  title?: ReactNode
  message?: ReactNode
}

export interface EtherPrice {
  currency: string | null
  rate: number
}

export interface ApplicationState {
  stateBackgroundColor: string
  isCoolBackground: boolean
  alertModal: AlertModal
  etherPrice: EtherPrice
  devMode: boolean
}

const initialState: ApplicationState = {
  stateBackgroundColor: grey,
  isCoolBackground: true,
  alertModal: {
    show: false,
  },
  etherPrice: {
    currency: null,
    rate: 0,
  },
  devMode: false,
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
    setEthPrice: (state, action: PayloadAction<EtherPrice>) => {
      console.info(
        `Setting eth price to ${action.payload.rate} ${action.payload.currency}`,
      )
      state.etherPrice = action.payload
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      console.info(`Enabling development mode`)
      state.devMode = action.payload
    },
  },
})

export const {
  setStateBackgroundColor,
  setAlertModal,
  setEthPrice,
  setDevMode,
} = applicationSlice.actions

const applicationReducer = applicationSlice.reducer
export default applicationReducer
