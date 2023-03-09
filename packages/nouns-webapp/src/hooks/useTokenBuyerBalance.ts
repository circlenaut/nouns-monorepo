import { Contract } from '@ethersproject/contracts'
import { useEthers } from '@usedapp/core'
import { BigNumber, utils } from 'ethers'
import { useEffect, useMemo, useState } from 'react'

import { CHAIN_ID } from '@/configs'
import { useContractAddresses } from '@/hooks/useAddresses'

import ERC20 from '@/libs/abi/ERC20.json'

const erc20Interface = new utils.Interface(ERC20)
const chainlinkInterface = [
  'function latestAnswer() external view returns (int256)',
]

const useTokenBuyerBalance = (): BigNumber | undefined => {
  const { chainId, library } = useEthers()
  const { contractAddresses } = useContractAddresses()

  const [ethBalance, setETHBalance] = useState<BigNumber | undefined>()
  const [usdcBalance, setUSDCBalance] = useState<BigNumber | undefined>()
  const [ethUsdcPrice, setETHUSDCPrice] = useState<BigNumber | undefined>()

  const usdcContract = useMemo(
    (): Contract | undefined =>
      !library || !contractAddresses?.usdcToken
        ? undefined
        : new Contract(contractAddresses.usdcToken, erc20Interface, library),
    [library, contractAddresses.usdcToken],
  )

  const chainlinkEthUsdcContract = useMemo(
    (): Contract | undefined =>
      !library || !contractAddresses?.chainlinkEthUsdc
        ? undefined
        : new Contract(
            contractAddresses.chainlinkEthUsdc,
            chainlinkInterface,
            library,
          ),
    [library, contractAddresses.chainlinkEthUsdc],
  )

  useEffect(() => {
    ;(async () => {
      if (!library || !contractAddresses?.tokenBuyer) return
      await library.getBalance(contractAddresses.tokenBuyer).then(setETHBalance)
    })()
  }, [library, contractAddresses.tokenBuyer])

  useEffect(() => {
    ;(async () => {
      if (
        !usdcContract ||
        !contractAddresses?.payerContract ||
        Number(CHAIN_ID) !== chainId
      )
        return
      await usdcContract
        .balanceOf(contractAddresses.payerContract)
        .then(setUSDCBalance)
    })()
  }, [usdcContract, chainId, contractAddresses.payerContract])

  useEffect(() => {
    ;(async () => {
      if (!chainlinkEthUsdcContract) return
      await chainlinkEthUsdcContract.latestAnswer().then(setETHUSDCPrice)
    })()
  }, [chainlinkEthUsdcContract])

  if (!ethUsdcPrice) {
    return ethBalance
  }
  return ethBalance?.add(
    usdcBalance?.mul(BigNumber.from(10).pow(20)).div(ethUsdcPrice) ??
      BigNumber.from(0),
  )
}

export default useTokenBuyerBalance
