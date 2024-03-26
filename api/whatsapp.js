let axios = require("axios");
const { getText, transcribe } = require("./gpt");
const { getNumber, downloadFile, checkFileExistence } = require("./utils");
const { kv } = require('@vercel/kv')
require('dotenv').config()
const { createReadStream, existsSync, fstat, readFile, readFileSync, unlinkSync, writeFile, writeFileSync } = require("fs");


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
    const type = messages[0].type;
    let text, axiosResponse;
    switch (type) {
      case 'text':
        text = messages[0].text.body;
        const message_id = messages[0].id;

        axios.post(`${phone_id}/messages`, {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id
        }).catch(err => console.error(err))

        const textToSend = await getText([...conversation, { role: 'user', content: text }]);

        axiosResponse = await axios.post(`${phone_id}/messages`, {
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
        break;
      case 'audio':
        console.log('Audio received');
        const mediaId = request.body.entry[0].changes[0].value.messages[0].audio.id;
        const url = await getMediaUrl(mediaId);
        console.log('Url fetch', url);
        const filename = './audio1'
        await downloadFile(url, filename)
        await checkFileExistence(filename + '.mp3')
        text = await transcribe(createReadStream(filename + '.mp3'));
        console.log('Transcription: ' + text);
        unlinkSync(`${filename}.mp3`)
        console.log('File deleted');
        axiosResponse = await axios.post(`${phone_id}/messages`, {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone_number,
          type: "text",
          text: {
            preview_url: false,
            body: text
          }
        });
        console.log(axiosResponse);
        response.send("Audio transcripto");
        break
      default:
        console.error(JSON.stringify(error));
        response.status(401).send("Error");
    }

  } catch (error) {
    console.error(JSON.stringify(error));
    response.status(401).send("Error: " + error);
  }
}

async function getMediaUrl(mediaId) {
  return await axios(mediaId).then(data => {
    const mediaUrl = data.data.url;
    return mediaUrl;
  }).catch((err) => {
    throw new Error(err.error.message);
  });
}

module.exports = {
  sendText
}