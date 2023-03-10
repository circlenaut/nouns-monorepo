# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - WIP
### In-progress
- Creating a debugging tracker for optimizing and minimizing on-chain calls via wrappers around calls to the @usedapp/core useCall and useCalls hooks. Utilizing lru-cache for caching and @msgpack/msgpack for serialization.
- Optimize the usage of RPC providers; useWeb3React vs useEthers vs ReadOnlyProviders

## To-do
- Add a docker-compose config and associate shell script to easily spin up a Nouns simnet instances for quick dev testing
- Reduce dev friction by improving/adding docs describing the various APIs within the Nouns monorepo. This would help with dev onboarding and ensuring consistency/quality among derivatives and projects. 
- Create a cache for minimizing the rate of CoinGecko Eth conversion rate fetches
- Go through all useEffect hooks and implement proper cleanup returns
- Improve the handling of settlement and associate button actions and callbacks
- Implement the handling of async/loader/spinners when fetching Nouns and Ethereum name service identities 
- Document how to add and start auctions with custom assets
- Determine which client, Apollo or React-Query is better for making GraphQL calls at the application and component level.
- Add dark mode and associate toggles
- Add additional unit tests for better coverage. There's only one test now for verifying app init.
- Replace Web3React's WalletConnect with WalletConnectV2. Port over Uniswap's latest updates.
- Improved Ethereum/Nouns Name Service calls and cache handling or re-add react-countdown to handle the fetching of NNS and ENS calls
- Optimize CSS: There's significant usage of !important modifiers, making it quite difficult to debug.
- Simplified the display of addresses/names by adding and breaking down calls among various separate components for handling the rendering of Eth and Nouns names


## [0.2.0] - 2023-03-07
### Added
- Setup Vite for build tooling and added associated polyfills
- Support for Goerli testnet
- Added tanstack/react-query, in addition to Apollo client for handling GraphQL calls. Created a wrapper with proper typing and a toggle to handle easy switching on calls. Added state handlers for handling query prefetching if using react-query.
- Added msgpack, lru-cache and useCall/useCalls wrappers for caching blockchain calls and minimizing RPC traffic
- Added react-countdown for handling timers/spinners/countdown on the wallet connect modal and the display of the auction modal on state changes
- Added contexts and hooks for consuming envVars, configs and contract addresses
- Create various object interfaces and associated typeguards 
- Memoized chain calls and state reporters to minimize unnecessary calls on rerenders
- Added Goerli testnet support for querying the Nouns Name Service
- Added absolute imports "@/" for internal components; kept relative import for closely associated components

### Fixed
- Fixed principle app Unit test and ensured compatibility with Vite
- Fixed the Collapse toggle on the Auction page
- Fixed alertModal persistence and behavior inconsistencies. Alert modals would randomly persist and not reset on action/state changes, especially during settlement.
- Fixed spinner not stopping on auction settlement
- Replaced 0x with the address.ZeroAddress constants to stop various invalid address errors

### Changed
- Updated the NounsPic API packages and added various request error handling
- Reconciled common packages across the workspaces
- Updated web3-react to v8 and improved the wallet connection flow and switching
- Updated to react v18
- Migrated from react-router-dom v5 to v6 and adjusted the various navigation/Router/Link components
- Improved memoization by wrapping useCallbacks and useMemo around various functions and calls
- Improved accessibility by adding keyboard listeners, buttons or blurs to non-interactive elements with click handlers
- Broke apart and reorganized App root, index, Providers and Router components
- Improved typing, removed any's, and created interfaces for typeguarding various functions.
- Updated components to support latest version of ReactToolkit
- Centralized config/env loading into a set of config files and created associate hooks for consuming the variables
- Optimized the log processing/reduction algorithm
- Replaced hardcoded ETH constants (ZeroAddress/symbol) with ethers lib constants
- Improved text formatting by replace "'" with '&apos', etc ...

### Removed
- Moved away from react-scripts to Vite and reconfigured/adapted the mono-repo and other packages

Note: This changelog is not exhaustive and only includes the most significant changes.

## [0.1.0] - 2021-07-03
### Fixed
- Initial Release