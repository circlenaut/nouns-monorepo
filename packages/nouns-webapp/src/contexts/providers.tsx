import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChainId, DAppProvider } from '@usedapp/core'
import { Web3ReactProvider } from '@web3-react/core'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import { Provider } from 'react-redux'

import ChainSubscriber from '@/components/ChainSubscriber'
import PastAuctions from '@/components/PastAuctions'
import { CHAIN_ID, createNetworkHttpUrl } from '@/configs'
import { ConnectionProvider, connectors } from '@/contexts/network'
import { store } from '@/hooks'
import { ContractAddressesProvider } from '@/hooks/useAddresses'
import { ConfigProvider, useConfig } from '@/hooks/useConfig'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import reportWebVitals from '@/reportWebVitals'
import LogsUpdater from '@/state/updaters/logs'
import { apolloClientFactory, reactClientFactory } from '@/wrappers/subgraph'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const { app, constants } = useConfig()

  const supportedChainURLs = {
    [ChainId.Mainnet]: createNetworkHttpUrl('mainnet'),
    [ChainId.Hardhat]: createNetworkHttpUrl('hardhat'),
    [ChainId.Goerli]: createNetworkHttpUrl('goerli'),
  }

  // prettier-ignore
  const useDappConfigRef = useRef({
    readOnlyChainId: CHAIN_ID,
    readOnlyUrls: {
      [CHAIN_ID]: supportedChainURLs[CHAIN_ID],
    },
    multicallAddresses: {
      [ChainId.Hardhat]: constants.multicallOnLocalhost,
    }
  });

  const clientRef = useRef<ApolloClient<NormalizedCacheObject> | null>(null)

  if (!clientRef.current) {
    clientRef.current = apolloClientFactory(app.subgraphApiUri)
  }

  const queryClientRef = useRef<QueryClient>()

  if (!queryClientRef.current) {
    queryClientRef.current = reactClientFactory()
  }

  const Updaters = useCallback(
    () => (
      <>
        <LogsUpdater />
      </>
    ),
    [],
  )
  // const Updaters = () => {
  //   return (
  //     <>
  //       <LogsUpdater />
  //     </>
  //   )
  // }

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.info))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  useEffect(() => reportWebVitals(), [])

  return (
    <Provider store={store}>
      <ContractAddressesProvider>
        <ConfigProvider>
          <Web3ReactProvider connectors={connectors}>
            <ConnectionProvider />
            <ChainSubscriber />
            <QueryClientProvider client={queryClientRef.current}>
              <ApolloProvider client={clientRef.current}>
                <PastAuctions />
                <DAppProvider config={useDappConfigRef.current}>
                  <LanguageProvider>{children}</LanguageProvider>
                  <Updaters />
                </DAppProvider>
              </ApolloProvider>
            </QueryClientProvider>
          </Web3ReactProvider>
        </ConfigProvider>
      </ContractAddressesProvider>
    </Provider>
  )
}
