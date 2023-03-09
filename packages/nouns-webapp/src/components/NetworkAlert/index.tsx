import { ChainId } from '@usedapp/core'
import React, { useCallback } from 'react'
import { Modal } from 'react-bootstrap'

import { CHAIN_ID } from '@/configs'

const NetworkAlert: React.FC = () => {
  const networkName = useCallback(() => {
    switch (Number(CHAIN_ID)) {
      case ChainId.Mainnet:
        return 'Ethereum Mainnet'
      case ChainId.Rinkeby:
        return 'the Rinkeby network'
      case ChainId.Goerli:
        return 'the Goerli Test Network'
      default:
        return `Network ${CHAIN_ID}`
    }
  }, [])

  const metamaskNetworkName = useCallback(() => {
    switch (Number(CHAIN_ID)) {
      case ChainId.Mainnet:
        return 'Ethereum Mainnet'
      case ChainId.Rinkeby:
        return 'Rinkeby Test Network'
      case ChainId.Goerli:
        return 'Goerli Test Network'
      default:
        return `Network ${CHAIN_ID}`
    }
  }, [])

  return (
    <>
      <Modal show={true} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Wrong Network Detected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Nouns DAO auctions require you to switch over {networkName()} to be
            able to participate.
          </p>
          <p>
            <b>
              To get started, please switch your network by following the
              instructions below:
            </b>
          </p>
          <ol>
            <li>Open Metamask</li>
            <li>Click the network select dropdown</li>
            <li>Click on &quot;{metamaskNetworkName()}&quot;</li>
          </ol>
        </Modal.Body>
      </Modal>
    </>
  )
}
export default NetworkAlert
