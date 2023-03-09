import { Handler } from '@netlify/functions'
import * as R from 'ramda'
import { NormalizedVote, nounsQuery } from '../theGraph'
import { sharedResponseHeaders } from '../utils'

interface NounVote {
  id: number
  owner: string
  delegatedTo?: null | string
  votes: NormalizedVote[]
}

// const buildNounVote = R.pick(['id', 'owner', 'delegatedTo', 'votes']);
// const buildNounVotes = R.map(buildNounVote);

type VotedNoun<T extends { id: number; owner: string }> = Pick<
  T,
  'id' | 'owner'
> & { delegatedTo?: string | null } & { votes: NormalizedVote[] }

const buildNounVote = <
  T extends {
    id: number
    owner: string
    delegatedTo?: string | null
    votes: NormalizedVote[]
  },
>(
  obj: T,
): VotedNoun<T> => ({
  ...R.pick(['id', 'owner'], obj),
  delegatedTo: obj.delegatedTo,
  votes: obj.votes,
})

const buildNounVotes = R.map(buildNounVote)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler: Handler = async (event, context) => {
  const nouns = await nounsQuery()
  const nounVotes: NounVote[] = buildNounVotes(nouns)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(nounVotes),
  }
}

export { handler }
