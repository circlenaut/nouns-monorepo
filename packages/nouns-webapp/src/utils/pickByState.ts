import React from 'react'

/**
 * Given state, picks the stateResult that corresponses to state
 */
export const usePickByState = <T extends React.ReactNode>(
  state: unknown,
  states: unknown[],
  stateResults: T[],
): T => {
  return stateResults[states.indexOf(state)]
}
