import { useCoingeckoPrice } from '@usedapp/coingecko'
import { BigNumber, ethers } from 'ethers'

/**
 * Computes treasury usd value of treasury assets (ETH + Lido) at current ETH-USD exchange rate
 *
 * @returns USD value of treasury assets (ETH + Lido) at current exchange rate
 */
export const useTreasuryUSDValue = (ethBalance: BigNumber) => {
  const etherPrice = Number(useCoingeckoPrice('ethereum', 'usd'))
  const treasuryBalanceETH = Number(
    ethers.utils.formatEther(ethBalance.toString() || '0'),
  )
  return etherPrice * treasuryBalanceETH
}
