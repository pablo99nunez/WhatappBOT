let axios = require("axios");
const { getText } = require("./gpt");
const { getNumber } = require("./utils");
const { kv } = require('@vercel/kv')
require('dotenv').config()


axios = axios.create({
  baseURL: 'https://graph.facebook.com/v19.0/',
})
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.WHATSAPP_TOKEN


async function sendText(response, request) {
  const conversation = await kv.get('conversation') || []
  console.log(conversation);
  try {
    console.log(JSON.stringify(request.body));
    const body = request.body.entry[0].changes[0].value;
    const { contacts, metadata, messages } = body;
    const { name } = contacts[0].profile;
    const phone_id = metadata.phone_number_id;
    const phone_number = getNumber(contacts[0].wa_id);
    const text = messages[0].text.body;

    const textToSend = await getText([...conversation, { role: 'user', content: text }]);

    const axiosResponse = await axios.post(`${phone_id}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone_number,
      type: "text",
      text: {
        preview_url: false,
        body: textToSend
      }
    });

    console.log(axiosResponse);
    response.send("Mensaje enviado");
  } catch (error) {
    console.error(JSON.stringify(error));
    response.status(401).send("Error");
  }
}



module.exports = {
  sendText
}