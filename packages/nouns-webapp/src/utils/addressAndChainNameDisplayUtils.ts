// This file contains utility functions for converting various types of strings
// to shorter versions using ternary shorthand.

const validNameSuffixes = ['.eth', '.⌐◨-◨']

/**
 * Validates if a string is formatted as a valid Ethereum address.
 * @param address The address to validate.
 * @returns True if the address is valid, false otherwise.
 */
export const isValidAddressFormat = (address?: string): boolean =>
  !address ? false : /^0x[0-9a-fA-F]{40}$/.test(address)

/**
 * Convert a full Ethereum address to a shortened version.
 * @param address The full Ethereum address.
 * @returns The shortened address, or null if the input is null or undefined.
 */
export const toShortAddress = (address: string) =>
  address && [address?.substring(0, 4), address?.substring(38, 42)]?.join('...')

/**
 * Convert a full Ethereum address to a very short version.
 * @param address The full Ethereum address.
 * @returns The very short address, or null if the input is null or undefined.
 */
export const toVeryShortAddress = (address: string) =>
  [
    address?.substring(0, 3),
    address?.substring(address?.length - 1, address?.length),
  ]?.join('...')

/**
  Check if a name is a valid Ethereum Name Service (ENS) name with a specific suffix.
  @param {string} name The name to check.
  @returns {boolean} Whether the name is a valid ENS name ending with the suffice '.eth'.
  */
export const isValidEnsName = (name?: string): boolean =>
  !name ? false : name?.endsWith('.eth')

/**
 * Convert a full ENS name to a shortened version.
 * @param ens The full ENS name.
 * @returns The shortened ENS name, or the original input if it is shorter than 15 characters
 * or the window width is greater than 480px.
 */
export const toShortENS = (ens: string) =>
  ens?.length <= 15 || window.innerWidth > 480
    ? ens
    : [
        ens?.substring(0, 4),
        ens?.substring(ens?.length - 8, ens?.length),
      ]?.join('...')

/**
 * Convert a full ENS name to a very short version.
 * @param ens The full ENS name.
 * @returns The very short ENS name, or null if the input is null or undefined.
 */
export const toVeryShortENS = (ens: string) =>
  [ens?.substring(0, 1), ens?.substring(ens?.length - 3, ens?.length)]?.join(
    '...',
  )

/**
  Check if a name is a valid Nouns Name Service (NNS) name with a specific suffix.
  @param {string} name The name to check.
  @returns {boolean} Whether the name is a valid NNS name ending with the suffice '.⌐◨-◨'.
  */
export const isValidNnsName = (name?: string): boolean =>
  !name ? false : name?.endsWith('.⌐◨-◨')

/**
 * Convert a full NNS name to a shortened version.
 * @param nns The full NNS name.
 * @returns The shortened NNS name, or the original input if it is shorter than 15 characters
 * or the window width is greater than 480px.
 */
export const toShortNNS = (nns: string) =>
  nns?.length <= 15 || window.innerWidth > 480
    ? nns
    : [
        nns?.substring(0, 4),
        nns?.substring(nns?.length - 8, nns?.length),
      ]?.join('...')

/**
 * Convert a full NNS name to a very short version.
 * @param nns The full NNS name.
 * @returns The very short NNS name, or null if the input is null or undefined.
 */
export const toVeryShortNNS = (nns: string) =>
  nns?.split('.⌐◨-◨')?.length === 2
    ? `${nns?.split('.⌐◨-◨')[0]?.substring(0, 1)}.⌐◨...◨${nns
        ?.split('.⌐◨-◨')[1]
        ?.substring(nns?.split('.⌐◨-◨')[1]?.length - 3)}`
    : [
        nns?.substring(0, 2),
        nns?.substring(nns?.length - 3, nns?.length),
      ]?.join('...')

/**
  Checks whether a given string has a valid suffix format.
  @param name The string to check for valid suffix format.
  @returns True if the string ends with a valid suffix, false otherwise.
  */
export const isValidNameFormat = (name?: string): boolean =>
  validNameSuffixes.some((suffix) => name?.endsWith(suffix))

/**
Truncates an Ethereum address to a dynamic length with an ellipsis.
@param {string} address - The address to truncate.
@param {number} width - The maximum width of the truncated address.
@returns {string} The truncated address with an ellipsis if applicable.
*/
export const toDynamicShortAddress = (address: string, maxWidth: number) => {
  const maxLength = Math.max(10, maxWidth - 6)
  const ellipsis = '.'.repeat(
    Math.min(Math.max(address.length - maxLength, 0), 3),
  )
  if (address.length <= maxLength) {
    return address
  } else {
    const startLength = Math.floor((maxLength - ellipsis.length) / 2)
    const endLength =
      maxLength - ellipsis.length - startLength < 1
        ? 1
        : maxLength - ellipsis.length - startLength
    return `${address.substring(0, startLength)}${
      endLength === 1 ? '..' : ellipsis
    }${address.substring(address.length - endLength)}`
  }
}
