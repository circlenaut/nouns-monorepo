import { Contract } from '@ethersproject/contracts'
import { useEthers } from '@usedapp/core'
import { BigNumber, utils } from 'ethers'
import { useEffect, useMemo, useState } from 'react'

import { CHAIN_ID } from '@/configs'
import { useContractAddresses } from '@/hooks/useAddresses'

import ERC20 from '@/libs/abi/ERC20.json'

const erc20Interface = new utils.Interface(ERC20)

const useLidoBalance = (): BigNumber | undefined => {
  const { chainId, library } = useEthers()
  const { contractAddresses } = useContractAddresses()

  const [balance, setBalance] = useState(undefined)

  const lidoContract = useMemo((): Contract | undefined => {
    if (!library || !contractAddresses?.lidoToken) return
    return new Contract(contractAddresses.lidoToken, erc20Interface, library)
  }, [library, contractAddresses.lidoToken])

  useEffect(() => {
    ;(async () => {
      if (
        !lidoContract ||
        !contractAddresses?.nounsDaoExecutor ||
        Number(CHAIN_ID) !== chainId
      )
        return
      await lidoContract
        .balanceOf(contractAddresses.nounsDaoExecutor)
        .then(setBalance)
    })()
  }, [lidoContract, chainId, contractAddresses.nounsDaoExecutor])

  return balance
}

export default useLidoBalance
