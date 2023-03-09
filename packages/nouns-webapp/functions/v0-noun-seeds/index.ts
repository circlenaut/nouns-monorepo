import { Handler } from '@netlify/functions'
import * as R from 'ramda'
import { nounsQuery, Seed } from '../theGraph'
import { sharedResponseHeaders } from '../utils'

interface SeededNoun {
  id: number
  seed: Seed
}

// const buildSeededNoun = R.pick(['id', 'seed']);
// const buildSeededNouns = R.map(buildSeededNoun);
type BuildSeededNoun<T extends { id: number; seed: Seed }> = Pick<
  T,
  'id' | 'seed'
>

const buildSeededNoun = <T extends { id: number; seed: Seed }>(
  obj: T,
): BuildSeededNoun<T> => ({
  ...R.pick(['id', 'seed'], obj),
})

const buildSeededNouns = R.map(buildSeededNoun)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler: Handler = async (event, context) => {
  const nouns = await nounsQuery()
  const seededNouns: SeededNoun[] = buildSeededNouns(nouns)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(seededNouns),
  }
}

export { handler }
