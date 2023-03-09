import { Handler } from '@netlify/functions'
import * as R from 'ramda'
import { nounsQuery } from '../theGraph'
import { sharedResponseHeaders } from '../utils'

export interface LiteNoun {
  id: number
  owner: string
  delegatedTo?: null | string
}

// const lightenNoun = R.pick(['id', 'owner', 'delegatedTo']);
type LightenedNoun<T extends { id: number; owner: string }> = Pick<
  T,
  'id' | 'owner'
> & { delegatedTo?: string | null }

const lightenNoun = <
  T extends { id: number; owner: string; delegatedTo?: string | null },
>(
  obj: T,
): LightenedNoun<T> => ({
  ...R.pick(['id', 'owner'], obj),
  delegatedTo: obj.delegatedTo,
})

const lightenNouns = R.map(lightenNoun)

const convertNouns = (
  nouns: LiteNoun[],
): { id: number; owner: string; delegatedTo?: null | string }[] =>
  nouns.map((noun) => ({
    id: noun.id,
    owner: noun.owner,
    delegatedTo: noun.delegatedTo || null,
  }))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler: Handler = async (event, context) => {
  const nouns = await nounsQuery()
  const convertedNouns = convertNouns(nouns)
  const liteNouns: LiteNoun[] = lightenNouns(convertedNouns)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(liteNouns),
  }
}

export { handler }
