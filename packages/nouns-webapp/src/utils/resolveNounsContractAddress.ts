import { ContractAddresses } from '@/configs'

export const resolveNounContractAddress = (
  address: string,
  addresses: ContractAddresses,
) => {
  if (!addresses) return

  switch (address?.toLowerCase()) {
    case addresses.nounsDAOProxy.toLowerCase():
      return 'Nouns DAO Proxy'
    case addresses.nounsAuctionHouseProxy.toLowerCase():
      return 'Nouns Auction House Proxy'
    case addresses.nounsDaoExecutor.toLowerCase():
      return 'Nouns DAO Treasury'
    default:
      return undefined
  }
}
