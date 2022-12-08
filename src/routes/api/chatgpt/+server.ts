import { ChatGPTAPI } from 'chatgpt';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {

  const query = await request.json()
  const api = new ChatGPTAPI({
    sessionToken: query.sessionToken
  });

  const conversation = api.getConversation()
  const response = await conversation.sendMessage(query.query)
  console.log(response)
  return new Response(response)
}
