import { BigNumber, BigNumberish, ethers } from 'ethers'

export const parseBigNumberToThreshold = (
  bigNum?: BigNumber | BigNumberish | null,
  threshold = 0.00000001,
) => {
  if (!bigNum) return 0

  const decimalValue = ethers.utils.formatEther(bigNum.toString() || '0')
  const parsedValue = Number.parseFloat(decimalValue)

  return parsedValue >= threshold ? parsedValue : 0
}

export const convertBigNumberToString = (
  payload: unknown,
): string | undefined => {
  if (typeof payload !== 'object' || payload === null) {
    return
  }

  if (payload instanceof BigNumber) {
    return payload.toString()
  }

  if (Array.isArray(payload)) {
    return payload.map((p: unknown) => p && convertBigNumberToString(p)).join()
  }

  return Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => [key, convertBigNumberToString(value)])
      .filter(([, value]) => value !== undefined),
  )
}
