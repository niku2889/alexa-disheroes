let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');
let mongoose = require('mongoose');
var mailer = require("nodemailer");
const VrmReg = require('./models/vrmReg.model.js');
const Master = require('./models/master.model.js');
const Product = require('./models/product.model.js')
var async = require('async');
var request = require('request');
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
var email;

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
    getWelcomeMsg(req.body).then(result => res.json(result));
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
        yesDetails(req.body).then(result => { res.json(result) });
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
  const speechOutput = 'You can say ' + PAUSE + ' Registration number is ' + PAUSE + 'w' + PAUSE + 'one' + PAUSE + 'one' + PAUSE + 'one' + PAUSE +
    'b' + PAUSE + 'o' + PAUSE + 'p' + PAUSE
    + ' or ' + PAUSE + 'You can say ' + PAUSE + 'category is air filters'
    + ' or ' + PAUSE + 'You can say ' + PAUSE + 'Exit' + PAUSE + ' How can I help you with?';
  const reprompt = HELP_REPROMPT
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", reprompt);

  return jsonObj;
}

async function getWelcomeMsg(re) {
  let promise = new Promise((resolve, reject) => {
    request.get({
      url: re.context.System.apiEndpoint + "/v2/accounts/~current/settings/Profile.email",
      headers: {
        "Authorization": "Bearer " + re.context.System.apiAccessToken,
        "Accept": "application/json"
      }
    }, function (error, response, body) {
      if (error) {
        resolve(false);
      } else {
        resolve(response);
      }
    });
  });
  let result = await promise;
  email = result;
  console.log(email)
  if (result == false) {
    var welcomeSpeechOutput = 'In order to email you lowest price part details, compare the car part will need access to your email address. Go to the home screen in your Alexa app and grant me permissions and try again. <break time="0.3s" />'
    const speechOutput = welcomeSpeechOutput;
    const more = '';

    return buildResponseWithPermission(speechOutput, true, "Over 1 million car parts available", more);
  } else {
    var welcomeSpeechOutput = 'Welcome to compare the car part dot com <break time="0.3s" />'
    const tempOutput = WHISPER + "Please tell me your vehicle registration number" + PAUSE +
      ' you can say ' + PAUSE + WHISPER + ' Registration number is ' + PAUSE + 'w' + PAUSE + 'one' + PAUSE + 'one' + PAUSE + 'one' + PAUSE + 'b' + PAUSE
      + 'o' + PAUSE + 'p';
    const speechOutput = welcomeSpeechOutput + tempOutput;
    const more = ' Registration number is w one one one b o p';

    return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", more);
  }
}

async function getRegDetails(intentDetails) {
  console.log(intentDetails.slots.registrationnumber.value)
  let s = intentDetails.slots.registrationnumber.value.toString().split(' ');
  let finalS = '';
  for (var i = 0; i < s.length; i++) {
    switch (s[i]) {
      case 'one': s[i] = 1; break;
      case 'two': s[i] = 2; break;
      case 'three': s[i] = 3; break;
      case 'four': s[i] = 4; break;
      case 'five': s[i] = 5; break;
      case 'six': s[i] = 6; break;
      case 'seven': s[i] = 7; break;
      case 'eight': s[i] = 8; break;
      case 'nine': s[i] = 9; break;
      case 'zero': s[i] = 0; break;
      default:
    }
    finalS += s[i];
  }
  console.log(s)
  console.log(finalS)

  ktype = '';
  let promise = new Promise((resolve, reject) => {
    VrmReg.find({ regno: finalS })
      .then(uni => {
        resolve(uni);
      });
  });
  let result = await promise;
  if (result.length > 0) {
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
  } else {
    let promise = new Promise((resolve, reject) => {
      var username = "TC_myiqisltd";
      var password = "R00k3ry8arn";
      var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
      request.get({
        url: "https://www.cartell.ie/secure/xml/findvehicle?registration=" + intentDetails.slots.registrationnumber.value + "&servicename=XML_Cartell_MYIQIS&xmltype=soap12&readingtype=miles",
        headers: {
          "Authorization": auth
        }
      }, function (error, response, body) {
        if (error) {
          resolve(false)
        } else {
          var parseString = require('xml2js').parseString;
          var xml = body.toString();
          parseString(xml, function (err, result) {
            resolve(result)
          });
        }
      });
    });

    var res1 = await promise;
    if (res1 == false) {
      var welcomeSpeechOutput = 'we cannot find this registration number. Please ensure you say each letter or number in a single form from a to z or numbers 0 to 9';
      const speechOutput = welcomeSpeechOutput;
      return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE);
    } else {
      if (res1) {
        console.log(res1)
        let envelope = res1['soap:Envelope']['soap:Body'];
        if (envelope.length > 0) {
          let error = envelope[0]['soap:Fault'];
          if (error != undefined) {
            var welcomeSpeechOutput = 'we cannot find this registration number. Please ensure you say each letter or number in a single form from a to z or numbers 0 to 9';
            const speechOutput = welcomeSpeechOutput;
            return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE);
          } else {
            ktype = envelope[0].FindByRegistration[0].Vehicle[0].TecDoc_KTyp_No[0];
            let promise1 = new Promise((resolve, reject) => {
              Master.find({ kType: ktype }).distinct('mainCategory')
                .then(uni => {
                  resolve(uni);
                });
            });
            let result1 = await promise1;
            var category = '';
            for (var i = 0; i < result1.length; i++) {
              category += result1[i] + ',' + PAUSE;
            }
            var welcomeSpeechOutput = 'Your vehicle is <break time="0.3s" />' + WHISPER + envelope[0].FindByRegistration[0].Vehicle[0].Model[0]
              + ' ' + envelope[0].FindByRegistration[0].Vehicle[0].FuelType[0] + ' ' + envelope[0].FindByRegistration[0].Vehicle[0].Power[0] + PAUSE +
              WHISPER + ' We have the following parts available - ' + PAUSE + category + PAUSE + ' ' +
              PAUSE + ' you can say ' + PAUSE + WHISPER + ' Category is air filters' + PAUSE + MORE_MESSAGE;
            const speechOutput = welcomeSpeechOutput;

            return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE);
          }
        } else {
          var welcomeSpeechOutput = 'we cannot find this registration number. Please ensure you say each letter or number in a single form from a to z or numbers 0 to 9';
          const speechOutput = welcomeSpeechOutput;
          return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE);
        }
      }
    }
  }
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
      PAUSE + 'registration number is' + PAUSE + 'w one one one b o p';
    const speechOutput = welcomeSpeechOutput;

    return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", 'registration number is w one one one b o p');
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

async function yesDetails(re) {
  // Use Smtp Protocol to send Email
  var smtpTransport = mailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, //ssl
    auth: {
      user: "voice@comparethecarpart.com",
      pass: "Rookery12!"
    }
  });

  var mail = {
    from: "voice@comparethecarpart.com",
    to: email,
    subject: "Test Email - Alexa",
    text: "Test Email text",
    html: "<b>Test Email Text</b>"
  }

  smtpTransport.sendMail(mail, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      smtpTransport.close();
      console.log("Message sent: " + response.message);
      var welcomeSpeechOutput = 'We send email of lowest price part details to your email address Thank you for visiting us';
      const speechOutput = welcomeSpeechOutput;

      return buildResponseWithRepromt(speechOutput, true, "Over 1 million car parts available", 'try again');
    }
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
          "alexa::profile:email:read"
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