// Adapted from: https://github.com/Uniswap/web3-react/blob/main/example/components/Accounts.tsx

import type { BigNumber } from '@ethersproject/bignumber'
import { Web3ReactHooks } from '@web3-react/core'
import React, { useEffect, useState } from 'react'

import { ETH_DECIMAL_PLACES } from '@/configs'
import { formatEther } from '@ethersproject/units'
import { constants } from 'ethers'
import DisplayName from '../DisplayName'

const useBalances = (
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  accounts?: string[],
): BigNumber[] | undefined => {
  const [balances, setBalances] = useState<BigNumber[] | undefined>()

  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      void Promise.all(
        accounts.map((account) => provider.getBalance(account)),
      ).then((balances) => {
        if (stale) return
        setBalances(balances)
      })

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [provider, accounts])

  return balances
}

interface AccountsProps {
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  accounts: ReturnType<Web3ReactHooks['useAccounts']>
  provider: ReturnType<Web3ReactHooks['useProvider']>
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
  isConnectRequested: boolean | null
  children?: React.ReactNode
}

export const Accounts: React.FC<AccountsProps> = ({
  chainId,
  isActive,
  accounts,
  provider,
  ENSNames,
  isConnectRequested,
}: AccountsProps) => {
  const balances = useBalances(provider, accounts)
  console.warn('ENSNames', ENSNames)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const [isLoading, setIsLoading] = useState<boolean | null>(null)

  // const fetchIsCountdownRunning = useCallback(
  //   (state: boolean) => setIsLoading(state),
  //   [],
  // )

  return (
    <div>
      <b>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '2rem',
          }}
        >
          {accounts?.length === 0
            ? 'None'
            : accounts?.map((account, i) => (
                <ul
                  key={account}
                  style={{
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {(isConnectRequested || (isActive && !!chainId)) && (
                    <>
                      {console.error('account', account)}
                      <DisplayName
                        address={account}
                        showDynamicLength={true}
                        // fetchIsCountdownRunning={fetchIsCountdownRunning}
                      />
                      <>
                        {isLoading
                          ? null
                          : balances?.[i] &&
                            ` (${constants.EtherSymbol}${Number(
                              formatEther(balances[i]),
                            ).toFixed(ETH_DECIMAL_PLACES)})`}
                      </>
                    </>
                  )}
                </ul>
              ))}
        </div>
      </b>
    </div>
  )
}
