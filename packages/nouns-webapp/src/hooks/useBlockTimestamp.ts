import { useEthers } from '@usedapp/core'
import { useEffect, useState } from 'react'

/**
 * A function that takes a block number from the chain and returns the timestamp of when the block occurred.
 * @param blockNumber target block number to retrieve the timestamp for
 * @returns unix timestamp of block number
 */
export const useBlockTimestamp = (
  blockNumber: number | undefined,
): number | undefined => {
  const { library } = useEthers()
  const [blockTimestamp, setBlockTimestamp] = useState<number | undefined>()

  useEffect(() => {
    const updateBlockTimestamp = async () => {
      if (!blockNumber) return
      const blockData = await library?.getBlock(blockNumber)
      setBlockTimestamp(blockData?.timestamp || undefined)
    }

    updateBlockTimestamp()
  }, [blockNumber, library])

  return blockTimestamp
}
