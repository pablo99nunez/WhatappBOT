var express = require('express')
  , bodyParser = require('body-parser');

let { getNumber } = require('./utils')

require('dotenv').config()

var app = express.Router();

let axios = require('axios')

axios = axios.create({
  baseURL: 'https://graph.facebook.com/v19.0/',
})

axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.WHATSAPP_TOKEN


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get("/", function (request, response) {
  response.send('Simple WhatsApp Webhook tester</br>There is no front-end, see server.js for implementation!');
});

app.get('/webhook', function (req, res) {
  console.log(req.query)
  console.log(process.env.VERIFY_TOKEN);
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == process.env.VERIFY_TOKEN
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhook", function (request, response) {
  console.log('Incoming webhook: ' + JSON.stringify(request.body));
  let name = request.body.entry[0].changes[0].value.contacts[0].profile.name
  let phone_id = request.body.entry[0].changes[0].value.metadata.phone_number_id
  let phone_number = getNumber(request.body.entry[0].changes[0].value.contacts[0].wa_id)
  let text = request.body.entry[0].changes[0].value.messages[0].text.body
  axios.post(phone_id + '/messages', {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phone_number,
    "type": "text",
    "text": {
      "preview_url": false,
      "body": name + text
    }
  })
  response.sendStatus(200);
});

let server = express()
server.use('/api', app)

var listener = server.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});