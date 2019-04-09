let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');
let mongoose = require('mongoose');
const VrmReg = require('./models/vrmReg.model.js');
var isFisrtTime = true;
const SKILL_NAME = 'Compare The Car Part';
const GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'You can say please fetch me a hero, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'
let dbURL = 'mongodb://myiqisltd:ALAN2889@ds151834-a0.mlab.com:51834,ds151834-a1.mlab.com:51834/carpartdb?replicaSet=rs-ds151834';

const data = [
  'Aladdin  ',
  'Cindrella ',
  'Bambi',
  'Bella ',
  'Bolt ',
  'Donald Duck',
  'Genie ',
  'Goofy',
  'Mickey Mouse',
];

app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

function log() {
  if (true) {
    console.log.apply(console, arguments);
  }
}

app.post('/comparethecarpart', requestVerifier, function (req, res) {

  if (req.body.request.type === 'LaunchRequest') {
    res.json(getNewHero());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    console.log(req.body.request)
    switch (req.body.request.intent.name) {
      case 'VehicleDetailsIntent':
        res.json(getRegDetails(req.body.request.intent));
        break;
      case 'AMAZON.YesIntent':
        res.json(getNewHero());
        break;
      case 'AMAZON.NoIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      default:

    }
  }
});

function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null)
}

function stopAndExit() {

  const speechOutput = STOP_MESSAGE
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

function help() {

  const speechOutput = HELP_MESSAGE
  const reprompt = HELP_REPROMPT
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);

  return jsonObj;
}

function getNewHero() {

  var welcomeSpeechOutput = 'Welcome to compare the car part dot com Please tell me your vehicle registration number<break time="0.3s" />'
  // if (!isFisrtTime) {
  //   welcomeSpeechOutput = '';
  // }

  // const heroArr = data;
  // const heroIndex = Math.floor(Math.random() * heroArr.length);
  // const randomHero = heroArr[heroIndex];
  // const tempOutput = WHISPER + GET_HERO_MESSAGE + randomHero + PAUSE;
  // const speechOutput = welcomeSpeechOutput + tempOutput + MORE_MESSAGE
  // const more = MORE_MESSAGE

  const speechOutput = welcomeSpeechOutput;
  return buildResponseWithRepromt(speechOutput, false, "", HELP_REPROMPT);

}

function getRegDetails(intentDetails) {
  console.log(intentDetails.slots.registrationnumber.value)
  VrmReg.find({ regno: intentDetails.slots.registrationnumber.value })
    .then(data => {
      console.log(data)
      var welcomeSpeechOutput = 'Your vehicle is' + data[0].model + ' ' + data[0].engine + '<break time="0.3s" />';
      const speechOutput = welcomeSpeechOutput;
      console.log(speechOutput)
      return buildResponseWithRepromt(speechOutput, false, "", HELP_REPROMPT);
    }).catch(err => {
      const speechOutput = err.message || "Some error occurred while retrieving your vehicle details please try again";
      return buildResponseWithRepromt(speechOutput, false, "", HELP_REPROMPT);
    });
}

function buildResponse(speechText, shouldEndSession, cardText) {

  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": cardText,
      "text": cardText
    },
  }
  return jsonObj
}

function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) {

  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": cardText,
      "text": cardText
    },
    "reprompt": {
      "outputSpeech": {
        "type": "PlainText",
        "text": reprompt,
        "ssml": reprompt
      }
    },
  }
  console.log(jsonObj)
  return jsonObj
}

app.listen(port);
//Mongoose Configurations:
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
  console.log("DATABASE - Connected");
});

mongoose.connection.on('error', (err) => {
  console.log('DATABASE - Error');
  console.log(err);
});

mongoose.connection.on('disconnected', () => {
  console.log('DATABASE - disconnected  Retrying....');
});

let connectDb = function () {
  const dbOptions = {
    poolSize: 5,
    reconnectTries: Number.MAX_SAFE_INTEGER,
    reconnectInterval: 500
  };
  mongoose.connect(dbURL, dbOptions)
    .catch(err => {
      console.log('DATABASE - Error');
      console.log(err);
    });
};
connectDb();
console.log('Alexa list RESTful API server started on: ' + port);