import { Handler } from '@netlify/functions'
import { isNounOwner, nounsQuery } from '../theGraph'
import { sharedResponseHeaders } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler: Handler = async (event, context) => {
  if (!event.body) {
    return { statusCode: 400 }
  }
  const nouns = await nounsQuery()
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isNounOwner(event.body, nouns)),
  }
}

export { handler }
