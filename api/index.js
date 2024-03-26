var express = require('express')
  , bodyParser = require('body-parser');

let { getNumber } = require('./utils')

require('dotenv').config()

var app = express.Router();

let axios = require('axios');
const { sendText } = require('./whatsapp');

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
  sendText(response, request)
});

let server = express()
server.use('/api', app)

var listener = server.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});