import { config } from '@/configs'
import axios from 'axios'
import * as R from 'ramda'
import { bigNumbersEqual } from './utils'

interface Proposal {
  id: string
}

interface Vote {
  proposal: Proposal
  supportDetailed: number
}

export interface NormalizedVote {
  proposalId: number
  supportDetailed: number
}

export interface Seed {
  background: number
  body: number
  accessory: number
  head: number
  glasses: number
}

interface Owner {
  id: string
  delegate?: {
    id: string
  }
}

interface Vote {
  proposal: {
    id: string
  }
  supportDetailed: number
}

interface Noun {
  id: string
  owner: Owner
  votes: Vote[]
  seed: Seed
}

export interface NormalizedNoun {
  id: number
  owner: string
  delegatedTo: null | string
  votes: NormalizedVote[] | []
  seed: Seed
}

const nounsGql = `
{
  nouns {
    id
    owner {
      id
	    delegate {
		    id
	    }
    }
    votes {
      proposal {
        id
      }
      supportDetailed
    }
    seed {
      background
      body
      accessory
      head
      glasses
    }
  }
}
`

export const normalizeVote = (vote: unknown): NormalizedVote | undefined => {
  if (typeof vote !== 'object' || vote === null) {
    return undefined
  }

  const { proposal, supportDetailed } = vote as Vote

  if (!proposal || !proposal.id) {
    return undefined
  }

  return {
    proposalId: Number(proposal.id),
    supportDetailed: Number(supportDetailed),
  }
}

export const normalizeSeed = (seed: unknown): Seed | undefined => {
  if (typeof seed !== 'object' || seed === null) {
    return undefined
  }

  const { background, body, accessory, head, glasses } = seed as Seed

  if (!background || !body || accessory || head | glasses) {
    return undefined
  }

  return {
    background: Number(background),
    body: Number(body),
    accessory: Number(accessory),
    head: Number(head),
    glasses: Number(glasses),
  }
}

// export const normalizeNoun = (noun: any): NormalizedNoun => ({
//   id: Number(noun.id),
//   owner: noun.owner.id,
//   delegatedTo: noun.owner.delegate?.id,
//   votes: normalizeVotes(noun.votes),
//   seed: normalizeSeed(noun.seed),
// })

export const normalizeNoun = (
  noun: Noun | undefined,
): NormalizedNoun | undefined => {
  if (!noun || typeof noun !== 'object' || noun === null) {
    return undefined
  }

  const { id, owner, votes, seed } = noun

  const normSeed = normalizeSeed(seed)
  if (!id || !owner?.id || !votes || !normSeed) {
    return undefined
  }

  return {
    id: Number(id),
    owner: owner.id,
    delegatedTo: owner.delegate?.id ?? null,
    votes: normalizeVotes(votes) ?? [],
    seed: normSeed,
  }
}

// export const normalizeNouns = R.map(normalizeNoun)
export const normalizeNouns = (
  nouns: (Noun | undefined)[],
): NormalizedNoun[] => {
  const normalizedNouns = nouns
    .map(normalizeNoun)
    .filter((noun): noun is NormalizedNoun => !!noun)
  return normalizedNouns
}

// export const normalizeVotes = R.map(normalizeVote)
export const normalizeVotes = (votes: Vote[] | undefined): NormalizedVote[] => {
  if (!votes) {
    return []
  }

  return votes.map((vote) => ({
    proposalId: Number(vote.proposal.id),
    supportDetailed: vote.supportDetailed,
  }))
}

export const ownerFilterFactory = (address: string) =>
  R.filter((noun: NormalizedNoun) => bigNumbersEqual(address, noun.owner))

export const isNounOwner = (address: string, nouns: NormalizedNoun[]) =>
  ownerFilterFactory(address)(nouns).length > 0

export const delegateFilterFactory = (address: string) =>
  R.filter(
    (noun: NormalizedNoun): boolean =>
      !!noun.delegatedTo && bigNumbersEqual(address, noun.delegatedTo),
  )

export const isNounDelegate = (address: string, nouns: NormalizedNoun[]) =>
  delegateFilterFactory(address)(nouns).length > 0

export const nounsQuery = async () =>
  normalizeNouns(
    (await axios.post(config.app.subgraphApiUri, { query: nounsGql })).data.data
      .nouns,
  )
