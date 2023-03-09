import React, { createContext, useContext, useEffect, useState } from 'react'

import { getContractAddressesForChainOrThrow } from '@nouns/sdk'

import { DEFAULT_ADDRESSES, type ContractAddresses } from '@/configs'
import { useConfig } from './useConfig'

export const ContractAddressesContext = createContext({
  contractAddresses: DEFAULT_ADDRESSES,
  loading: true,
})

interface ContractAddressesProp {
  timeoutDuration?: number
  children: React.ReactNode
}

interface ContractAddressesState {
  contractAddresses: ContractAddresses
  loading: boolean
}

const isValidContractAddresses = (
  addresses: object,
): addresses is ContractAddresses => {
  const requiredProperties = [
    'nounsToken',
    'nounsSeeder',
    'nounsDescriptor',
    'nftDescriptor',
    'nounsAuctionHouse',
    'nounsAuctionHouseProxy',
    'nounsAuctionHouseProxyAdmin',
    'nounsDaoExecutor',
    'nounsDAOProxy',
    'nounsDAOLogicV1',
  ]

  return (
    Object.entries(addresses).every(
      ([key, value]) =>
        requiredProperties.includes(key) && typeof value === 'string',
    ) && requiredProperties.every((prop) => addresses.hasOwnProperty(prop))
  )
}

export const ContractAddressesProvider: React.FC<ContractAddressesProp> = ({
  timeoutDuration,
  children,
}) => {
  const [contractAddresses, setContractAddresses] =
    useState<ContractAddressesState>({
      contractAddresses: DEFAULT_ADDRESSES,
      loading: true,
    })

  const { settings } = useConfig()

  useEffect(() => {
    ;(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
        console.error('Fetching contract addresses timed out')
      }, timeoutDuration ?? 30000)

      try {
        /*
          Here for SSR migration and to dynamically load contract addresses
        */
        // const res = await fetch('/api/contracts');
        // if (!res.ok) {
        //   console.error(`Failed to fetch contract addresses, status code: ${res.status}`);
        //   return;
        // }
        // const addresses = await res.json() as ContractAddresses;
        const addresses = getContractAddressesForChainOrThrow(
          settings.addressId,
        )
        if (!isValidContractAddresses(addresses)) {
          throw new Error('Received invalid contract addresses')
        }
        setContractAddresses({ contractAddresses: addresses, loading: false })
        console.info(
          `Using Nouns token contract addresses -> ${addresses.nounsToken}`,
        )
        console.info(
          `Using Nouns auction house contract addresses -> ${addresses.nounsAuctionHouseProxy}`,
        )
        console.info(
          `Using Nouns DAO contract addresses -> ${addresses.nounsDAOProxy}`,
        )
      } catch (error) {
        throw Error(
          error instanceof Error && error.name === 'AbortError'
            ? 'Fetching contract addresses was aborted'
            : `An error occurred while fetching contract addresses: ${
                error instanceof Error ? error.message : error
              }`,
        )
      } finally {
        clearTimeout(timeout)
      }
    })()
  }, [settings.addressId, timeoutDuration, setContractAddresses])

  return (
    <ContractAddressesContext.Provider value={contractAddresses}>
      {children}
    </ContractAddressesContext.Provider>
  )
}

export const useContractAddresses = (): ContractAddressesState => {
  const context = useContext(ContractAddressesContext)
  if (!context) {
    throw Error(
      'useContractAddresses must be used within a ContractAddressesProvider: Default to DEFAULT_ADDRESSES',
    )
  }
  return context
}
