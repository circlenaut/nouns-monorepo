import { useAppSelector } from '@/hooks'
import { Location } from 'react-router-dom'

export const shouldUseStateBg = (location: Location) => {
  if (!location || !location.pathname) {
    throw Error('Unable to fetch pathname from location')
  }
  return (
    location.pathname === '/' ||
    location.pathname?.includes('/noun') ||
    location.pathname?.includes('/auction')
  )
}

/**
 * Utility function that takes three items and returns whichever one corresponds to the current
 * page state (white, cool, warm)
 * @param whiteState  What to return if the state is white
 * @param coolState  What to return if the state is cool
 * @param warmState  What to return is the state is warm
 * @param history  History object from useHistory
 * @returns item corresponding to current state
 */

export interface Color {
  primary: string
  secondary: string
  tertiary: string
  Location: Location
}

export const usePickByState = (
  whiteState: string,
  coolState: string,
  warmState: string,
  location: Location,
) => {
  const useStateBg = shouldUseStateBg(location)
  const isCoolState = useAppSelector(
    (state) => state.application.isCoolBackground,
  )
  return !useStateBg ? whiteState : isCoolState ? coolState : warmState
}
