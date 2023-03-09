import { Trans } from '@lingui/macro'
import React from 'react'
import { Container } from 'react-bootstrap'

import Link from '@/components/Link'
import { useContractAddresses } from '@/hooks/useAddresses'
import { buildEtherscanAddressLink } from '@/utils/etherscan'
import { externalURL, ExternalURL } from '@/utils/externalURL'

import classes from './Footer.module.css'

const Footer: React.FC = () => {
  const twitterURL = externalURL(ExternalURL.twitter)
  const { contractAddresses } = useContractAddresses()
  const etherscanURL = buildEtherscanAddressLink(contractAddresses.nounsToken)
  const discourseURL = externalURL(ExternalURL.discourse)

  return (
    <div className={classes.wrapper}>
      <Container className={classes.container}>
        <footer className={classes.footerSignature}>
          <Link
            text={<Trans>Twitter</Trans>}
            url={twitterURL}
            leavesPage={true}
          />
          <Link
            text={<Trans>Etherscan</Trans>}
            url={etherscanURL ?? ''}
            leavesPage={true}
          />
          <Link
            text={<Trans>Forums</Trans>}
            url={discourseURL}
            leavesPage={false}
          />
        </footer>
      </Container>
    </div>
  )
}
export default Footer
