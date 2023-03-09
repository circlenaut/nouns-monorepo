import { AvatarProvider } from '@davatar/react'
import {
  BaseProvider,
  getDefaultProvider,
  getNetwork,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers'
import { useEthers } from '@usedapp/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Footer from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { DEFAULT_CHAIN_ID } from '@/configs'
import { NetworkCheck } from '@/contexts/network'
import AuctionPage from '@/pages/Auction'
import CreateProposalPage from '@/pages/CreateProposal'
import DelegatePage from '@/pages/Delegate'
import ExplorePage from '@/pages/Explore'
import GovernancePage from '@/pages/Governance'
import NotFoundPage from '@/pages/NotFound'
import NoundersPage from '@/pages/Nounders'
import PlaygroundPage from '@/pages/Playground'
import VotePage from '@/pages/Vote'

// tslint:disable:ordered-imports
import '@/styles/globals.css'
import classes from '../App.module.css'
import { useAppSelector } from '@/hooks'

type ValidProviders = Web3Provider | JsonRpcProvider | BaseProvider

interface RoutesProps {
  children?: React.ReactNode
}

const AuctionRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/" replace />} />
      <Route path=":id" element={<AuctionPage />} />
    </Routes>
  )
}

export const AppRoutes: React.FC<RoutesProps> = () => {
  const [currentProvider, setCurrentProvider] = useState<ValidProviders>()

  // const newCall = useAppSelector((state) => state.cache.newCall ?? 0)
  // const cacheHit = useAppSelector((state) => state.cache.cacheHit ?? 0)

  const { library } = useEthers()

  useEffect(() => {
    setCurrentProvider(
      getDefaultProvider(
        library ? library.network : getNetwork(DEFAULT_CHAIN_ID),
      ),
    )
  }, [library])

  // const [renderIter, setRenderIter] = useState(0)

  // const incrementRenderIter = useCallback(() => {
  //   setRenderIter(renderIter + 1)
  // }, [renderIter])

  // useEffect(() => {
  //   console.debug(`DOM render iteration: ${renderIter}`)
  // }, [renderIter])

  // useEffect(() => {
  //   setRenderIter((prev) => prev + 1);
  // }, []);

  // const cacheHitRate = useMemo(() => (newCall/(newCall+cacheHit)), [newCall, cacheHit])

  return (
    <>
      {/* <div>
        <button
          onClick={incrementRenderIter}>{`Increment Render Iteration: ${renderIter}, Current Cache: ${!isNaN(cacheHitRate) ?cacheHitRate : 0}`}
        </button>
      </div> */}
      <div className={`${classes.wrapper}`}>
        <NetworkCheck />
        <BrowserRouter basename="/">
          <AvatarProvider provider={currentProvider} batchLookups={true}>
            <NavBar />
            <Routes>
              <Route path="/" element={<AuctionPage />} />
              <Route path="/auction/*" element={<AuctionRoutes />} />
              <Route path="/noun/*" element={<AuctionRoutes />} />
              <Route path="/nounders" element={<NoundersPage />} />
              <Route path="/create-proposal" element={<CreateProposalPage />} />
              <Route path="/vote" element={<GovernancePage />} />
              <Route path="/vote/:id" element={<VotePage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/delegate" element={<DelegatePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
          </AvatarProvider>
        </BrowserRouter>
      </div>
    </>
  )
}
