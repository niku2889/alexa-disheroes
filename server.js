let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');
let mongoose = require('mongoose');
const VrmReg = require('./models/vrmReg.model.js');
const Master = require('./models/master.model.js');
const Product = require('./models/product.model.js')
var async = require('async');
const SKILL_NAME = 'Compare the car part';
const HELP_REPROMPT = 'How can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'which category would you like?'
const MORE_MESSAGE1 = 'what would you like?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'
let dbURL = 'mongodb://myiqisltd:ALAN2889@ds151834-a0.mlab.com:51834,ds151834-a1.mlab.com:51834/carpartdb?replicaSet=rs-ds151834';
var ktype;
var masterData;

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
  if (req.body.request.type === 'SessionEndedRequest') {
    if (req.body.request.reason === 'USER_INITIATED') {
      res.json(stopAndExit());
    } else {
      const speechOutput = 'There was a problem with the requested skills response please try again'
      var jsonObj = buildResponse(speechOutput, true, "");
      return jsonObj;
    }
  } else if (req.body.request.type === 'LaunchRequest') {
    res.json(getWelcomeMsg());
    isFisrtTime = false
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'VehicleDetailsIntent':
        getRegDetails(req.body.request.intent).then(result => res.json(result))
        break;
      case 'CategoryDetailsIntent':
        getCategoryDetails(req.body.request.intent).then(result => res.json(result))
        break;
      case 'PositionDetailsIntent':
        getPositionDetails(req.body.request.intent).then(result => { res.json(result) });
        break;
      case 'VariantDetailsIntent':
        getVariantDetails(req.body.request.intent).then(result => { res.json(result) });
        break;
      case 'AMAZON.YesIntent':
        res.json(getNewHero());
        break;
      case 'AMAZON.NoIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.CancelIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.StopIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      case 'Unhandled':
        res.json(stopAndExit());
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
  const speechOutput = 'You can say ' + PAUSE + ' Registration number is w111bop' + PAUSE
    + ' or ' + PAUSE + 'You can say ' + PAUSE + 'category is air filters'
    + ' or ' + PAUSE + 'You can say ' + PAUSE + 'Exit' + PAUSE + ' How can I help you with?';
  const reprompt = HELP_REPROMPT
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", reprompt);

  return jsonObj;
}

function getWelcomeMsg() {
  var welcomeSpeechOutput = 'Welcome to compare the car part dot com <break time="0.3s" />'
  const tempOutput = WHISPER + "Please tell me your vehicle registration number" + PAUSE +
    ' you can say ' + PAUSE + WHISPER + ' Registration number is ' + PAUSE + 'w111bop';
  const speechOutput = welcomeSpeechOutput + tempOutput;
  const more = ' Registration number is w111bop';

  //return buildResponseWithPermission();
  return buildResponseWithPermission(speechOutput, false, "Over 1 million car parts available", more);
}

async function getRegDetails(intentDetails) {
  ktype = '';
  let promise = new Promise((resolve, reject) => {
    VrmReg.find({ regno: intentDetails.slots.registrationnumber.value })
      .then(uni => {
        resolve(uni);
      });
  });
  let result = await promise;
  ktype = result[0].ktype;
  let promise1 = new Promise((resolve, reject) => {
    Master.find({ kType: result[0].ktype }).distinct('mainCategory')
      .then(uni => {
        resolve(uni);
      });
  });
  let result1 = await promise1;
  var category = '';
  for (var i = 0; i < result1.length; i++) {
    category += result1[i] + ',' + PAUSE;
  }
  var welcomeSpeechOutput = 'Your vehicle is <break time="0.3s" />' + WHISPER + result[0].model + ' ' + result[0].engine + PAUSE +
    WHISPER + ' We have the following parts available - ' + PAUSE + category + PAUSE + ' ' +
    PAUSE + ' you can say ' + PAUSE + WHISPER + ' Category is air filters' + PAUSE + MORE_MESSAGE;
  const speechOutput = welcomeSpeechOutput;

  return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE);
}

async function getCategoryDetails(intentDetails) {
  var cate = '';
  if (intentDetails.slots.categoryname.value.toString() == 'brake diks')
    cate = 'Brake Discs';
  else
    cate = intentDetails.slots.categoryname.value.toString();
  if (ktype) {
    let promise = new Promise((resolve, reject) => {
      Master.find({ kType: ktype, mainCategory: { $regex: new RegExp(cate.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&"), 'i') } }, { yinYangQ2: 1, location1: 1, lapArtId: 1 })
        .then(uni => {
          resolve(uni);
        });
    });
    let result = await promise;
    masterData = result;
    var laparts = '';
    if (result.length > 0) {
      var location = '';
      var locationCheck = '';
      for (var i = 0; i < result.length; i++) {
        if (result[i].location1.toString() != '') {
          if (location.toString().toLowerCase().indexOf(result[i].location1.toString().toLowerCase()) == -1) {
            if (i == 0)
              location += result[i].location1 + ' OR ' + PAUSE;
            else
              location += result[i].location1 + PAUSE;
          }
          locationCheck += result[i].location1;
        }
        laparts += result[i].lapArtId;
      }
      if (locationCheck == '') {
        let productData = [];
        var ean = laparts.toString().split('\n');
        let uIndex = 0;
        let promise = new Promise((resolve, reject) => {
          for (var i = 0; i < ean.length; i++) {
            Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1 })
              .then(prod => {
                uIndex += prod[0] == undefined ? 1 : 0;
                let lowestPrice = getLowestPrice(prod[0]);
                prod[0].lowest = lowestPrice.price;
                productData.push(prod[0]);
                if (productData.length == (ean.length - uIndex)) {
                  productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
                  var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at '
                    + PAUSE + productData[0].lowest + PAUSE + 'pounds ' + ' Would you like to buy?';
                  const speechOutput = welcomeSpeechOutput;
                  resolve(speechOutput);
                }
              }).catch(err => {
                // resolve('Something wrong please try again')
              });
          }
        });

        let result = await promise;
        return buildResponseWithRepromt(result, false, "Over 1 million car parts available", 'Would you like to buy?');
      } else {
        var welcomeSpeechOutput = location + PAUSE + ' ' + 'you can say' + PAUSE + 'front please' + PAUSE + MORE_MESSAGE1;
        const speechOutput = welcomeSpeechOutput;

        return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE1);
      }
    } else {
      var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.categoryname.value + ' category ' + PAUSE + ' ' + 'you can say ' +
        PAUSE + 'category is' + PAUSE + 'air filters' + PAUSE + 'which other category would you like?';
      const speechOutput = welcomeSpeechOutput;

      return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", 'which other category would you like?');
    }
  } else {
    var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.categoryname.value + ' category ' + PAUSE + ' ' + 'you can say ' +
      PAUSE + 'registration number is' + PAUSE + 'w111bop';
    const speechOutput = welcomeSpeechOutput;

    return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", 'registration number is w111bop');
  }
}

async function getPositionDetails(intentDetails) {
  if (masterData.length > 0) {
    var variant = '';
    var variantCheck = '';
    var laparts = '';
    let productData = [];
    for (var i = 0; i < masterData.length; i++) {
      if (masterData[i].location1.toString().toLowerCase().indexOf(intentDetails.slots.position.value.toString().toLowerCase()) != -1) {
        variant += masterData[i].yinYangQ2 + PAUSE + ' ';
        variantCheck += masterData[i].yinYangQ2;
        laparts += masterData[i].lapArtId;
      }
    }
    if (variantCheck == '') {
      var ean = laparts.toString().split('\n');
      let uIndex = 0;

      let promise = new Promise((resolve, reject) => {
        for (var i = 0; i < ean.length; i++) {
          Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1 })
            .then(prod => {
              uIndex += prod[0] == undefined ? 1 : 0;
              let lowestPrice = getLowestPrice(prod[0]);
              prod[0].lowest = lowestPrice.price;
              productData.push(prod[0]);
              if (productData.length == (ean.length - uIndex)) {
                productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
                var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at ' +
                  PAUSE + productData[0].lowest + PAUSE + 'pounds ' + PAUSE + 'you can say ' + PAUSE + 'yes' + PAUSE + 'or' + PAUSE + 'no' + PAUSE + ' Would you like to buy?';
                const speechOutput = welcomeSpeechOutput;
                resolve(speechOutput);
              }
            }).catch(err => {
              //resolve('Something wrong please try again')
            });
        }
      });

      let result = await promise;
      return buildResponseWithRepromt(result, false, "Over 1 million car parts available", 'Would you like to buy?');
    } else {
      var welcomeSpeechOutput = intentDetails.slots.position.value.toString() + ' have the following varients available - ' + variant + PAUSE + ' ' + 'you can say ' + PAUSE + 'variant is' + PAUSE + 'solid' + PAUSE + MORE_MESSAGE1;
      const speechOutput = welcomeSpeechOutput;

      return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE1);
    }
  } else {
    var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.position.value + ' varient ' + PAUSE + 'category is ' + PAUSE + 'air filters ' + PAUSE + 'which other category would you like?';
    const speechOutput = welcomeSpeechOutput;

    return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", 'which other category would you like?');
  }
}

async function getVariantDetails(intentDetails) {
  if (masterData.length > 0) {
    var laparts = '';
    let productData = [];
    for (var i = 0; i < masterData.length; i++) {
      if (masterData[i].yinYangQ2.toString().toLowerCase().indexOf(intentDetails.slots.variantname.value.toString().toLowerCase()) != -1) {
        laparts += masterData[i].lapArtId;
      }
    }
    var ean = laparts.toString().split('\n');
    let uIndex = 0;

    let promise = new Promise((resolve, reject) => {
      for (var i = 0; i < ean.length; i++) {
        Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1 })
          .then(prod => {
            uIndex += prod[0] == undefined ? 1 : 0;
            let lowestPrice = getLowestPrice(prod[0]);
            prod[0].lowest = lowestPrice.price;
            productData.push(prod[0]);
            if (productData.length == (ean.length - uIndex)) {
              productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
              var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at ' +
                PAUSE + productData[0].lowest + PAUSE + 'pounds ' + PAUSE + 'you can say ' + PAUSE + 'yes' + PAUSE + 'or' + PAUSE + 'no' + PAUSE + ' Would you like to buy?';
              const speechOutput = welcomeSpeechOutput;
              resolve(speechOutput);
            }
          }).catch(err => {
            //resolve('Something wrong please try again')
          });
      }
    });

    let result = await promise;
    return buildResponseWithRepromt(result, false, "Over 1 million car parts available", 'Would you like to buy?');

  } else {
    var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.variantname.value + ' varient ' + PAUSE + 'variant is' + PAUSE + 'solid' + PAUSE + 'which other variant would you like?';
    const speechOutput = welcomeSpeechOutput;

    return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", 'which other variant would you like?');
  }
}

function getLowestPrice(product) {
  let lowest = [];
  if (product.amazonData.UK.price != '') {
    lowest.push(parseFloat(product.amazonData.UK.price.toString().replace('£', '')));
  }

  let i = lowest.length > 0 ? lowest.indexOf(Math.min(...lowest)) : '';
  let p = {
    price: lowest.length > 0 ? Math.min(...lowest) : 'NA',
  }
  return p;
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

function buildResponseWithPermission(speechText, shouldEndSession, cardText, reprompt) {
  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "response": {
        "shouldEndSession": shouldEndSession,
        "outputSpeech": {
          "type": "SSML",
          "ssml": speechOutput,
          "text": speechText
        },
      },
      "card": {
        "type": "AskForPermissionsConsent",
        "permissions": [
          "alexa::profile:name:read",
          "alexa::profile:profile:email:read"
        ]
      },
      "reprompt": {
        "outputSpeech": {
          "type": "PlainText",
          "text": reprompt,
          "ssml": reprompt
        }
      }
    }
  }
  console.log(jsonObj)
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
        "ssml": speechOutput,
        "text": speechText
      },
    }, "card": {
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
    }
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