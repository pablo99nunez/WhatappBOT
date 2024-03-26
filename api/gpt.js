const { OpenAI } = require('openai')
require('dotenv').config()
const { kv } = require('@vercel/kv')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function getText(messages) {
  let response = (await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages })).choices[0].message.content
  console.log(response);
  kv.set('conversation', [{ role: 'system', content: 'Tienes una personalidad tonta, divertida, despreocupada, inocente, sarcastica.' }, ...messages, { role: 'assistant', content: response }])
  return response
}


module.exports = {
  getText
}
