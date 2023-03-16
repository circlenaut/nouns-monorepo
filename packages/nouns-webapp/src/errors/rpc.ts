import { ProviderRpcError } from '@web3-react/types'

export const isProviderRpcError = (
  error?: unknown,
): error is ProviderRpcError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ProviderRpcError).message === 'string' &&
    typeof (error as ProviderRpcError).code === 'number'
  )
}

export const fetchProviderRpcError = (error?: unknown) => {
  if (isProviderRpcError(error)) {
    console.error(`RPC Error (${error.code}): ${error.message}`)
    return error
  } else if (error instanceof Error) {
    console.error(error.message ?? `Unknown Error: ${error}`)
    return null
  }
  return null
}
