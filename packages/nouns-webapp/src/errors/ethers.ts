import { errors } from 'ethers'

interface EthersError {
  code: string
  argument: string
  value: string
}

const isEthersError = (error: unknown): error is EthersError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'argument' in error &&
    'value' in error
  )
}

export const fetchEthersError = (error: unknown) => {
  if (isEthersError(error)) {
    switch (error.code) {
      case errors.UNSUPPORTED_OPERATION:
        console.error('Error: Unsupported operation')
        break
      case errors.UNEXPECTED_ARGUMENT:
        console.error('Error: Unexpected argument')
        break
      case errors.INVALID_ARGUMENT:
        console.error(
          `Error: Invalid argument(${error.argument}): ${error.value}`,
        )
        break
      default:
        console.error(`Unknown Ethers error: ${JSON.stringify(error)}`)
        break
    }
  } else if (error instanceof Error) {
    console.error(error.message ?? `Unknown Error: ${error}`)
    return
  }
  return null
}
