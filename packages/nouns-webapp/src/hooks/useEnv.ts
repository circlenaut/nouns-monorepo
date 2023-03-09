import { constants } from 'ethers'
import { useMemo } from 'react'

export enum EnvVariable {
  CHAIN_ID = 'CHAIN_ID',
  ADDRESS_ID = 'ADDRESS_ID',
  ENABLE_HISTORY = 'ENABLE_HISTORY',
  FOMO_NOUNS_URL = 'FOMO_NOUNS_URL',
  NOUNS_PICS_URL = 'NOUNS_PICS_URL',
  NOUNDERS_ADDRESS = 'NOUNDERS_ADDRESS',
  TWITTER_URL = 'TWITTER_URL',
  NOTION_URL = 'NOTION_URL',
  DISCOURSE_URL = 'DISCOURSE_URL',
  NOUNS_CENTER_URL = 'NOUNS_CENTER_URL',
  INFURA_PROJECT_ID = 'INFURA_PROJECT_ID',
  INFURA_KEY = 'INFURA_KEY',
  ALCHEMY_KEY = 'ALCHEMY_KEY',
  ETHERSCAN_API_KEY = 'ETHERSCAN_API_KEY',
  MAINNET_SUBGRAPH = 'MAINNET_SUBGRAPH',
  GOERLI_SUBGRAPH = 'GOERLI_SUBGRAPH',
  HARDHAT_SUBGRAPH = 'HARDHAT_SUBGRAPH',
  MAINNET_JSONRPC = 'MAINNET_JSONRPC',
  MAINNET_WSRPC = 'MAINNET_WSRPC',
  GOERLI_JSONRPC = 'GOERLI_JSONRPC',
  GOERLI_WSRPC = 'GOERLI_WSRPC',
  HARDHAT_JSONRPC = 'HARDHAT_JSONRPC',
  HARDHAT_WSRPC = 'HARDHAT_WSRPC',
  WALLET_CONNECT_PROJECT_ID = 'WALLET_CONNECT_PROJECT_ID',
}

export type EnvironmentVariables = Record<string, string>

const defaultVariables: EnvironmentVariables = {
  CHAIN_ID: '1',
  ADDRESS_ID: '1',
  ENABLE_HISTORY: 'true',
  FOMO_NOUNS_URL: '',
  NOUNS_PICS_URL: '',
  NOUNDERS_ADDRESS: 'nounders.eth',
  TWITTER_URL: '',
  NOTION_URL: '',
  DISCOURSE_URL: '',
  NOUNS_CENTER_URL: '',
  INFURA_PROJECT_ID: '',
  INFURA_KEY: '',
  ALCHEMY_KEY: '',
  ETHERSCAN_API_KEY: '',
  MAINNET_SUBGRAPH: '',
  GOERLI_SUBGRAPH: '',
  HARDHAT_SUBGRAPH: '',
  MAINNET_JSONRPC: '',
  MAINNET_WSRPC: '',
  GOERLI_JSONRPC: '',
  GOERLI_WSRPC: '',
  HARDHAT_JSONRPC: '',
  HARDHAT_WSRPC: '',
  WALLET_CONNECT_PROJECT_ID: '',
}

export const environmentVariables: EnvironmentVariables = {
  // Chain ID
  CHAIN_ID:
    import.meta.env.VITE_APP_CHAIN_ID ?? defaultVariables.CHAIN_ID ?? '',

  // Address ID
  ADDRESS_ID:
    import.meta.env.VITE_APP_ADDRESS_ID ?? defaultVariables.ADDRESS_ID ?? '',

  // Enable history
  ENABLE_HISTORY:
    import.meta.env.VITE_APP_ENABLE_HISTORY ??
    defaultVariables.ENABLE_HISTORY ??
    '',

  // Fomo Nouns URL
  FOMO_NOUNS_URL:
    import.meta.env.VITE_APP_FOMO_NOUNS_URL ??
    defaultVariables.FOMO_NOUNS_URL ??
    '',

  // Pics URL
  NOUNS_PICS_URL:
    import.meta.env.VITE_APP_NOUNS_PICS_URL ??
    defaultVariables.NOUNS_PICS_URL ??
    '',

  // Nounders address
  NOUNDERS_ADDRESS:
    import.meta.env.VITE_APP_NOUNDERS_ADDRESS ??
    defaultVariables.NOUNDERS_ADDRESS ??
    constants.AddressZero,

  // Twitter URL
  TWITTER_URL:
    import.meta.env.VITE_APP_TWITTER_URL ?? defaultVariables.TWITTER_URL ?? '',

  // Notion URL
  NOTION_URL:
    import.meta.env.VITE_APP_NOTION_URL ?? defaultVariables.NOTION_URL ?? '',

  // Discourse URL
  DISCOURSE_URL:
    import.meta.env.VITE_APP_DISCOURSE_URL ??
    defaultVariables.DISCOURSE_URL ??
    '',

  // Nouns Center URL
  NOUNS_CENTER_URL:
    import.meta.env.VITE_APP_NOUNS_CENTER_URL ??
    defaultVariables.NOUNS_CENTER_URL ??
    '',

  // Infura project ID
  INFURA_PROJECT_ID:
    import.meta.env.VITE_APP_INFURA_PROJECT_ID ??
    defaultVariables.INFURA_PROJECT_ID ??
    '',

  // Infura key
  INFURA_KEY:
    import.meta.env.VITE_APP_INFURA_KEY ?? defaultVariables.INFURA_KEY ?? '',

  // Alchemy key
  ALCHEMY_KEY:
    import.meta.env.VITE_APP_ALCHEMY_KEY ?? defaultVariables.ALCHEMY_KEY ?? '',

  // Etherscan API key
  ETHERSCAN_API_KEY:
    import.meta.env.VITE_APP_ETHERSCAN_API_KEY ??
    defaultVariables.ETHERSCAN_API_KEY ??
    '',

  // Mainnet subgraph
  MAINNET_SUBGRAPH:
    import.meta.env.VITE_APP_MAINNET_SUBGRAPH ??
    defaultVariables.MAINNET_SUBGRAPH ??
    '',

  // Goerli subgraph
  GOERLI_SUBGRAPH:
    import.meta.env.VITE_APP_GOERLI_SUBGRAPH ??
    defaultVariables.GOERLI_SUBGRAPH ??
    '',

  // Hardhat subgraph
  HARDHAT_SUBGRAPH:
    import.meta.env.VITE_APP_HARDHAT_SUBGRAPH ??
    defaultVariables.HARDHAT_SUBGRAPH ??
    '',

  // Mainnet JSON-RPC
  MAINNET_JSONRPC:
    import.meta.env.VITE_APP_MAINNET_JSONRPC ??
    defaultVariables.MAINNET_JSONRPC ??
    '',

  // Mainnet WebSocket-RPC
  MAINNET_WSRPC:
    import.meta.env.VITE_APP_MAINNET_WSRPC ??
    defaultVariables.MAINNET_WSRPC ??
    '',

  // Goerli JSON-RPC
  GOERLI_JSONRPC:
    import.meta.env.VITE_APP_GOERLI_JSONRPC ??
    defaultVariables.GOERLI_JSONRPC ??
    '',

  // Goerli WebSocket-RPC
  GOERLI_WSRPC:
    import.meta.env.VITE_APP_GOERLI_WSRPC ??
    defaultVariables.GOERLI_WSRPC ??
    '',

  // Hardhat JSON-RPC
  HARDHAT_JSONRPC:
    import.meta.env.VITE_APP_HARDHAT_JSONRPC ??
    defaultVariables.HARDHAT_JSONRPC ??
    '',

  // Hardhat WebSocket-RPC
  HARDHAT_WSRPC:
    import.meta.env.VITE_APP_HARDHAT_WSRPC ??
    defaultVariables.HARDHAT_WSRPC ??
    '',

  // Wallet Connect Project ID
  WALLET_CONNECT_PROJECT_ID:
    import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID ??
    defaultVariables.WALLET_CONNECT_PROJECT_ID ??
    '',
}

export const useEnvKey = (
  key: keyof typeof EnvVariable,
  defaultValue = '',
): string => {
  const environmentVariables = useEnv()
  const value = environmentVariables[key]
  return value || defaultValue
}

export const useEnv = (): EnvironmentVariables => {
  const variables = useMemo(() => {
    try {
      const newVariables = Object.entries(EnvVariable)
        .map(([key, value]) => {
          const envValue = import.meta.env[`VITE_APP_${value}`]
          console.debug(`VITE_APP_${value}`, envValue)
          return { [key]: envValue || '' }
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), defaultVariables)

      return newVariables
    } catch (error) {
      console.error('Error accessing environment variable:', error)
      return defaultVariables
    }
  }, [])

  return variables
}
