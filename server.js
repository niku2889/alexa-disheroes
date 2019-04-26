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
var name;
var productLink;
var category;
var brand;

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
  if (result == false) {
    var welcomeSpeechOutput = 'In order to email you lowest price part details, compare the car part will need access to your email address and full name. Go to the home screen in your Alexa app and grant me permissions and try again. <break time="0.3s" />'
    const speechOutput = welcomeSpeechOutput;
    const more = welcomeSpeechOutput;

    return buildResponseWithPermission(speechOutput, true, "Over 1 million car parts available", more);
  } else {
    let jres = JSON.parse(result.body);
    if (jres.code == "ACCESS_DENIED") {
      var welcomeSpeechOutput = 'In order to email you lowest price part details, compare the car part will need access to your email address and full name. Go to the home screen in your Alexa app and grant me permissions and try again. <break time="0.3s" />'
      const speechOutput = welcomeSpeechOutput;
      const more = welcomeSpeechOutput;

      return buildResponseWithPermission(speechOutput, true, "Over 1 million car parts available", more);
    } else {
      email = result.body;
      let promise1 = new Promise((resolve, reject) => {
        request.get({
          url: re.context.System.apiEndpoint + "/v2/accounts/~current/settings/Profile.name",
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
      let result1 = await promise1;
      name = result1 == false ? 'Guest' : result1.body.toString().replace(/"/g, "");
      var welcomeSpeechOutput = 'Welcome ' + name + ' to compare the car part dot com <break time="0.3s" />'
      const tempOutput = WHISPER + "Please tell me your vehicle registration number" + PAUSE +
        ' you can say ' + PAUSE + WHISPER + ' Registration number is ' + PAUSE + 'w' + PAUSE + 'one' + PAUSE + 'one' + PAUSE + 'one' + PAUSE + 'b' + PAUSE
        + 'o' + PAUSE + 'p';
      const speechOutput = welcomeSpeechOutput + tempOutput;
      const more = ' Registration number is w one one one b o p';

      return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", more);
    }
  }
}

async function getRegDetails(intentDetails) {
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
  category = '';
  if (intentDetails.slots.categoryname.value.toString() == 'brake diks')
    cate = 'Brake Discs';
  else
    cate = intentDetails.slots.categoryname.value.toString();
  category = cate;
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
        productLink = '';
        brand = '';
        let promise = new Promise((resolve, reject) => {
          for (var i = 0; i < ean.length; i++) {
            Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1, "amazonData.UK.link": 1 })
              .then(prod => {
                uIndex += prod[0] == undefined ? 1 : 0;
                let lowestPrice = getLowestPrice(prod[0]);
                prod[0].lowest = lowestPrice.price;
                productData.push(prod[0]);
                if (productData.length == (ean.length - uIndex)) {
                  productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
                  productLink = productData[0].amazonData.UK.link;
                  brand = productData[0].supBrand;
                  var speechOutput;
                  if (productData[0].lowest == 'NA') {
                    var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.categoryname.value + ' category ' + PAUSE + ' ' + 'you can say ' +
                      PAUSE + 'category is' + PAUSE + 'air filters' + PAUSE + 'which other category would you like?';

                    speechOutput = welcomeSpeechOutput;
                  } else {
                    var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at ' +
                      PAUSE + productData[0].lowest + PAUSE + 'pounds ' + PAUSE + 'you can say ' + PAUSE + 'yes' + PAUSE + 'or' + PAUSE + 'no' + PAUSE + ' Would you like to buy?';
                    speechOutput = welcomeSpeechOutput;
                  }
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
        var welcomeSpeechOutput = 'In ' + intentDetails.slots.categoryname.value + ' category we have the following position available' + PAUSE + location + PAUSE + ' ' + ' you can say ' + PAUSE + 'front please ' + PAUSE + MORE_MESSAGE1;
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
      productLink = '';
      brand = '';
      let promise = new Promise((resolve, reject) => {
        for (var i = 0; i < ean.length; i++) {
          Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1, "amazonData.UK.link": 1 })
            .then(prod => {
              uIndex += prod[0] == undefined ? 1 : 0;
              let lowestPrice = getLowestPrice(prod[0]);
              prod[0].lowest = lowestPrice.price;
              productData.push(prod[0]);
              if (productData.length == (ean.length - uIndex)) {
                productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
                productLink = productData[0].amazonData.UK.link;
                brand = productData[0].supBrand;
                var speechOutput;
                if (productData[0].lowest == 'NA') {
                  var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.position.value + ' position ' + PAUSE + 'category is ' + PAUSE + 'air filters ' + PAUSE + 'which other category would you like?';;

                  speechOutput = welcomeSpeechOutput;
                } else {
                  var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at ' +
                    PAUSE + productData[0].lowest + PAUSE + 'pounds ' + PAUSE + 'you can say ' + PAUSE + 'yes' + PAUSE + 'or' + PAUSE + 'no' + PAUSE + ' Would you like to buy?';

                  speechOutput = welcomeSpeechOutput;
                }
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
      var welcomeSpeechOutput = intentDetails.slots.position.value.toString() + ' have the following variant available - ' + variant + PAUSE + ' ' + 'you can say ' + PAUSE + 'variant is' + PAUSE + 'solid' + PAUSE + MORE_MESSAGE1;
      const speechOutput = welcomeSpeechOutput;

      return buildResponseWithRepromt(speechOutput, false, "Over 1 million car parts available", MORE_MESSAGE1);
    }
  } else {
    var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.position.value + ' position ' + PAUSE + 'you can say' + PAUSE + 'front please' + PAUSE + 'which other position would you like?';
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
    productLink = '';
    brand = '';
    let promise = new Promise((resolve, reject) => {
      for (var i = 0; i < ean.length; i++) {
        Product.find({ lapArtId: ean[i] }, { supBrand: 1, "amazonData.UK.price": 1, "amazonData.UK.link": 1 })
          .then(prod => {
            uIndex += prod[0] == undefined ? 1 : 0;
            let lowestPrice = getLowestPrice(prod[0]);
            prod[0].lowest = lowestPrice.price;
            productData.push(prod[0]);
            if (productData.length == (ean.length - uIndex)) {
              productData.sort((a, b) => (a.lowest == 'NA' ? 10000 : a.lowest) - (b.lowest == 'NA' ? 10000 : b.lowest));
              productLink = productData[0].amazonData.UK.link;
              brand = productData[0].supBrand;
              var speechOutput;
              if (productData[0].lowest == 'NA') {
                var welcomeSpeechOutput = 'No parts available in ' + intentDetails.slots.variantname.value + ' varient ' + PAUSE + 'variant is' + PAUSE + 'solid' + PAUSE + 'which other variant would you like?';

                speechOutput = welcomeSpeechOutput;
              } else {
                var welcomeSpeechOutput = 'The following ' + PAUSE + productData[0].supBrand + PAUSE + ' is available at the cheapest price at ' +
                  PAUSE + productData[0].lowest + PAUSE + 'pounds ' + PAUSE + 'you can say ' + PAUSE + 'yes' + PAUSE + 'or' + PAUSE + 'no' + PAUSE + ' Would you like to buy?';

                speechOutput = welcomeSpeechOutput;
              }
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

  var emailTemplate = '<!DOCTYPE html' +
    '	PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"' +
    '	xmlns:v="urn:schemas-microsoft-com:vml">' +
    '' +
    '<head>' +
    '	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />' +
    '	<meta content="width=device-width" name="viewport" />' +
    '	<meta content="IE=edge" http-equiv="X-UA-Compatible" />' +
    '	<title></title>' +
    '	<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css" />' +
    '	<style type="text/css">' +
    '		body {' +
    '			margin: 0;' +
    '			padding: 0;' +
    '		}' +
    '' +
    '		table,' +
    '		td,' +
    '		tr {' +
    '			vertical-align: top;' +
    '			border-collapse: collapse;' +
    '		}' +
    '' +
    '		* {' +
    '			line-height: inherit;' +
    '		}' +
    '' +
    '		a[x-apple-data-detectors=true] {' +
    '			color: inherit !important;' +
    '			text-decoration: none !important;' +
    '		}' +
    '' +
    '		.ie-browser table {' +
    '			table-layout: fixed;' +
    '		}' +
    '' +
    '		[owa] .img-container div,' +
    '		[owa] .img-container button {' +
    '			display: block !important;' +
    '		}' +
    '' +
    '		[owa] .fullwidth button {' +
    '			width: 100% !important;' +
    '		}' +
    '' +
    '		[owa] .block-grid .col {' +
    '			display: table-cell;' +
    '			float: none !important;' +
    '			vertical-align: top;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid,' +
    '		.ie-browser .num12,' +
    '		[owa] .num12,' +
    '		[owa] .block-grid {' +
    '			width: 650px !important;' +
    '		}' +
    '' +
    '		.ie-browser .mixed-two-up .num4,' +
    '		[owa] .mixed-two-up .num4 {' +
    '			width: 216px !important;' +
    '		}' +
    '' +
    '		.ie-browser .mixed-two-up .num8,' +
    '		[owa] .mixed-two-up .num8 {' +
    '			width: 432px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.two-up .col,' +
    '		[owa] .block-grid.two-up .col {' +
    '			width: 324px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.three-up .col,' +
    '		[owa] .block-grid.three-up .col {' +
    '			width: 324px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.four-up .col [owa] .block-grid.four-up .col {' +
    '			width: 162px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.five-up .col [owa] .block-grid.five-up .col {' +
    '			width: 130px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.six-up .col,' +
    '		[owa] .block-grid.six-up .col {' +
    '			width: 108px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.seven-up .col,' +
    '		[owa] .block-grid.seven-up .col {' +
    '			width: 92px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.eight-up .col,' +
    '		[owa] .block-grid.eight-up .col {' +
    '			width: 81px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.nine-up .col,' +
    '		[owa] .block-grid.nine-up .col {' +
    '			width: 72px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.ten-up .col,' +
    '		[owa] .block-grid.ten-up .col {' +
    '			width: 60px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.eleven-up .col,' +
    '		[owa] .block-grid.eleven-up .col {' +
    '			width: 54px !important;' +
    '		}' +
    '' +
    '		.ie-browser .block-grid.twelve-up .col,' +
    '		[owa] .block-grid.twelve-up .col {' +
    '			width: 50px !important;' +
    '		}' +
    '	</style>' +
    '	<style id="media-query" type="text/css">' +
    '		@media only screen and (min-width: 670px) {' +
    '			.block-grid {' +
    '				width: 650px !important;' +
    '			}' +
    '' +
    '			.block-grid .col {' +
    '				vertical-align: top;' +
    '			}' +
    '' +
    '			.block-grid .col.num12 {' +
    '				width: 650px !important;' +
    '			}' +
    '' +
    '			.block-grid.mixed-two-up .col.num3 {' +
    '				width: 162px !important;' +
    '			}' +
    '' +
    '			.block-grid.mixed-two-up .col.num4 {' +
    '				width: 216px !important;' +
    '			}' +
    '' +
    '			.block-grid.mixed-two-up .col.num8 {' +
    '				width: 432px !important;' +
    '			}' +
    '' +
    '			.block-grid.mixed-two-up .col.num9 {' +
    '				width: 486px !important;' +
    '			}' +
    '' +
    '			.block-grid.two-up .col {' +
    '				width: 325px !important;' +
    '			}' +
    '' +
    '			.block-grid.three-up .col {' +
    '				width: 216px !important;' +
    '			}' +
    '' +
    '			.block-grid.four-up .col {' +
    '				width: 162px !important;' +
    '			}' +
    '' +
    '			.block-grid.five-up .col {' +
    '				width: 130px !important;' +
    '			}' +
    '' +
    '			.block-grid.six-up .col {' +
    '				width: 108px !important;' +
    '			}' +
    '' +
    '			.block-grid.seven-up .col {' +
    '				width: 92px !important;' +
    '			}' +
    '' +
    '			.block-grid.eight-up .col {' +
    '				width: 81px !important;' +
    '			}' +
    '' +
    '			.block-grid.nine-up .col {' +
    '				width: 72px !important;' +
    '			}' +
    '' +
    '			.block-grid.ten-up .col {' +
    '				width: 65px !important;' +
    '			}' +
    '' +
    '			.block-grid.eleven-up .col {' +
    '				width: 59px !important;' +
    '			}' +
    '' +
    '			.block-grid.twelve-up .col {' +
    '				width: 54px !important;' +
    '			}' +
    '		}' +
    '' +
    '		@media (max-width: 670px) {' +
    '' +
    '			.block-grid,' +
    '			.col {' +
    '				min-width: 320px !important;' +
    '				max-width: 100% !important;' +
    '				display: block !important;' +
    '			}' +
    '' +
    '			.block-grid {' +
    '				width: 100% !important;' +
    '			}' +
    '' +
    '			.col {' +
    '				width: 100% !important;' +
    '			}' +
    '' +
    '			.col>div {' +
    '				margin: 0 auto;' +
    '			}' +
    '' +
    '			img.fullwidth,' +
    '			img.fullwidthOnMobile {' +
    '				max-width: 100% !important;' +
    '			}' +
    '' +
    '			.no-stack .col {' +
    '				min-width: 0 !important;' +
    '				display: table-cell !important;' +
    '			}' +
    '' +
    '			.no-stack.two-up .col {' +
    '				width: 50% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num4 {' +
    '				width: 33% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num8 {' +
    '				width: 66% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num4 {' +
    '				width: 33% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num3 {' +
    '				width: 25% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num6 {' +
    '				width: 50% !important;' +
    '			}' +
    '' +
    '			.no-stack .col.num9 {' +
    '				width: 75% !important;' +
    '			}' +
    '' +
    '			.video-block {' +
    '				max-width: none !important;' +
    '			}' +
    '' +
    '			.mobile_hide {' +
    '				min-height: 0px;' +
    '				max-height: 0px;' +
    '				max-width: 0px;' +
    '				display: none;' +
    '				overflow: hidden;' +
    '				font-size: 0px;' +
    '			}' +
    '' +
    '			.desktop_hide {' +
    '				display: block !important;' +
    '				max-height: none !important;' +
    '			}' +
    '		}' +
    '	</style>' +
    '</head>' +
    '' +
    '<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #F5F5F5;">' +
    '	<style id="media-query-bodytag" type="text/css">' +
    '		@media (max-width: 670px) {' +
    '			.block-grid {' +
    '				min-width: 320px !important;' +
    '				max-width: 100% !important;' +
    '				width: 100% !important;' +
    '				display: block !important;' +
    '			}' +
    '' +
    '			.col {' +
    '				min-width: 320px !important;' +
    '				max-width: 100% !important;' +
    '				width: 100% !important;' +
    '				display: block !important;' +
    '			}' +
    '' +
    '			.col>div {' +
    '				margin: 0 auto;' +
    '			}' +
    '' +
    '			img.fullwidth {' +
    '				max-width: 100% !important;' +
    '				height: auto !important;' +
    '			}' +
    '' +
    '			img.fullwidthOnMobile {' +
    '				max-width: 100% !important;' +
    '				height: auto !important;' +
    '			}' +
    '' +
    '			.no-stack .col {' +
    '				min-width: 0 !important;' +
    '				display: table-cell !important;' +
    '			}' +
    '' +
    '			.no-stack.two-up .col {' +
    '				width: 50% !important;' +
    '			}' +
    '' +
    '			.no-stack.mixed-two-up .col.num4 {' +
    '				width: 33% !important;' +
    '			}' +
    '' +
    '			.no-stack.mixed-two-up .col.num8 {' +
    '				width: 66% !important;' +
    '			}' +
    '' +
    '			.no-stack.three-up .col.num4 {' +
    '				width: 33% !important' +
    '			}' +
    '' +
    '			.no-stack.four-up .col.num3 {' +
    '				width: 25% !important' +
    '			}' +
    '		}' +
    '	</style>' +
    '	<table bgcolor="#F5F5F5" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"' +
    '		style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #F5F5F5; width: 100%;"' +
    '		valign="top" width="100%">' +
    '		<tbody>' +
    '			<tr style="vertical-align: top;" valign="top">' +
    '				<td style="word-break: break-word; vertical-align: top; border-collapse: collapse;" valign="top">' +
    '					<div style="background-color:transparent;">' +
    '						<div class="block-grid"' +
    '							style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;">' +
    '							<div' +
    '								style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">' +
    '								<div class="col num12"' +
    '									style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top;;">' +
    '									<div style="width:100% !important;">' +
    '										<div' +
    '											style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">' +
    '											<table border="0" cellpadding="0" cellspacing="0" class="divider"' +
    '												role="presentation"' +
    '												style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"' +
    '												valign="top" width="100%">' +
    '												<tbody>' +
    '													<tr style="vertical-align: top;" valign="top">' +
    '														<td class="divider_inner"' +
    '															style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; border-collapse: collapse;"' +
    '															valign="top">' +
    '															<table align="center" border="0" cellpadding="0"' +
    '																cellspacing="0" class="divider_content" height="10"' +
    '																role="presentation"' +
    '																style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 10px;"' +
    '																valign="top" width="100%">' +
    '																<tbody>' +
    '																	<tr style="vertical-align: top;" valign="top">' +
    '																		<td height="10"' +
    '																			style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;"' +
    '																			valign="top"><span></span></td>' +
    '																	</tr>' +
    '																</tbody>' +
    '															</table>' +
    '														</td>' +
    '													</tr>' +
    '												</tbody>' +
    '											</table>' +
    '										</div>' +
    '									</div>' +
    '								</div>' +
    '							</div>' +
    '						</div>' +
    '					</div>' +
    '					<div style="background-color:transparent;">' +
    '						<div class="block-grid two-up no-stack"' +
    '							style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #2190E3;;">' +
    '							<div style="border-collapse: collapse;display: table;width: 100%;background-color:#2190E3;">' +
    '								<div class="col num6"' +
    '									style="min-width: 320px; max-width: 325px; display: table-cell; vertical-align: top;;">' +
    '									<div style="width:100% !important;">' +
    '										<div' +
    '											style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:25px; padding-bottom:25px; padding-right: 0px; padding-left: 25px;">' +
    '											<div align="left" class="img-container left fixedwidth"' +
    '												style="padding-right: 0px;padding-left: 0px;">' +
    '                       <img alt="Image" border="0" class="left fixedwidth"' +
    '                         src="https://www.comparethecarpart.com/assets/images/logo-ctcp-white.png"' +
    '                         style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 195px; display: block;"' +
    '                         title="Image" width="195" />' +
    '											</div>' +
    '										</div>' +
    '									</div>' +
    '								</div>' +
    '								<div class="col num6"' +
    '									style="min-width: 320px; max-width: 325px; display: table-cell; vertical-align: top;;">' +
    '									<div style="width:100% !important;">' +
    '										<div' +
    '											style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:25px; padding-bottom:25px; padding-right: 25px; padding-left: 0px;">' +
    '											<div></div>' +
    '										</div>' +
    '									</div>' +
    '								</div>' +
    '							</div>' +
    '						</div>' +
    '					</div>' +
    '					<div style="background-color:transparent;">' +
    '						<div class="block-grid"' +
    '							style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #D6E7F0;;">' +
    '							<div style="border-collapse: collapse;display: table;width: 100%;background-color:#D6E7F0;">' +
    '								<div class="col num12"' +
    '									style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top;;">' +
    '									<div style="width:100% !important;">' +
    '										<div' +
    '											style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:60px; padding-right: 25px; padding-left: 25px;">' +
    '											<div align="center" class="img-container center fixedwidth"' +
    '												style="padding-right: 0px;padding-left: 0px;">' +
    '												<div style="font-size:1px;line-height:45px"> </div><img align="center"' +
    '													alt="Image" border="0" class="center fixedwidth"' +
    '													src="https://s3.eu-west-2.amazonaws.com/carpart-images-large/comparethecarpart.png"' +
    '													style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 540px; display: block;"' +
    '													title="Image" width="540" />' +
    '											</div>' +
    '											<div' +
    '												style="color:#052d3d;font-family:\'Lato\', Tahoma, Verdana, Segoe, sans-serif;line-height:150%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:15px;">' +
    '												<div' +
    '													style="font-size: 12px; line-height: 18px; font-family: \'Lato\', Tahoma, Verdana, Segoe, sans-serif; color: #052d3d;">' +
    '													<p' +
    '														style="font-size: 14px; line-height: 75px; text-align: center; margin: 0;">' +
    '														<span style="font-size: 50px;"><strong><span' +
    '																	style="line-height: 75px; font-size: 50px;"><span' +
    '																		style="font-size: 38px; line-height: 57px;">WELCOME</span></span></strong></span>' +
    '													</p>' +
    '													<p' +
    '														style="font-size: 14px; line-height: 51px; text-align: center; margin: 0;">' +
    '														<span style="font-size: 34px;"><strong><span' +
    '																	style="line-height: 51px; font-size: 34px;"><span' +
    '																		style="color: #2190e3; line-height: 51px; font-size: 20px;">' + name + '</span></span></strong></span>' +
    '													</p>' +
    '												</div>' +
    '											</div>' +
    '											<div' +
    '												style="color:#555555;font-family:\'Lato\', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">' +
    '												<div' +
    '													style="font-size: 12px; line-height: 14px; color: #555555; font-family: \'Lato\', Tahoma, Verdana, Segoe, sans-serif;">' +
    '													<p' +
    '														style="font-size: 14px; line-height: 21px; text-align: center; margin: 0;">' +
    '														<span style="font-size: 18px; color: #000000;">Thanks for using Compare The Car Part on Alexa. ' +
    '															You are one step closer to getting the best price for this product.' +
    '															Please click on the link below to see lowest price part details of your vehicle.</span></p>' +
    '												</div>' +
    '											</div>' +
    '											<div align="center" class="button-container"' +
    '												style="padding-top:20px;padding-right:10px;padding-bottom:10px;padding-left:10px;">' +
    '                       <a style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #fc7318; border-radius: 15px; -webkit-border-radius: 15px; -moz-border-radius: 15px; width: auto; width: auto; border-top: 1px solid #fc7318; border-right: 1px solid #fc7318; border-bottom: 1px solid #fc7318; border-left: 1px solid #fc7318; padding: 10px; text-align: center; mso-border-alt: none; word-break: keep-all;" href="' + productLink + '" target="_blank">' +
    '												<span style="font-size: 16px; line-height: 32px;"><strong>VIEW' +
    '														OFFER</strong></span>' +
    '												</span></a>' +
    '											</div>' +
    '										</div>' +
    '									</div>' +
    '								</div>' +
    '							</div>' +
    '						</div>' +
    '					</div>' +
    '					<div style="background-color:transparent;">' +
    '						<div class="block-grid"' +
    '							style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;">' +
    '							<div' +
    '								style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">' +
    '								<div class="col num12"' +
    '									style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top;;">' +
    '									<div style="width:100% !important;">' +
    '										<div' +
    '											style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:20px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;">' +
    '											<table cellpadding="0" cellspacing="0" class="social_icons"' +
    '												role="presentation"' +
    '												style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"' +
    '												valign="top" width="100%">' +
    '												<tbody>' +
    '													<tr style="vertical-align: top;" valign="top">' +
    '														<td style="word-break: break-word; vertical-align: top; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; border-collapse: collapse;"' +
    '															valign="top">' +
    '															<table activate="activate" align="center"' +
    '																alignment="alignment" cellpadding="0" cellspacing="0"' +
    '																class="social_table" role="presentation"' +
    '																style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: undefined; mso-table-tspace: 0; mso-table-rspace: 0; mso-table-bspace: 0; mso-table-lspace: 0;"' +
    '																to="to" valign="top">' +
    '																<tbody>' +
    '																	<tr align="center"' +
    '																		style="vertical-align: top; display: inline-block; text-align: center;"' +
    '																		valign="top">' +
    '																		<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 8px; padding-left: 8px; border-collapse: collapse;"' +
    '																			valign="top"><a' +
    '																				href="https://www.facebook.com/comparethecarpart/"' +
    '																				target="_blank"><img alt="Facebook"' +
    '																					height="32"' +
    '																					src="https://s3.eu-west-2.amazonaws.com/carpart-images-large/facebook%402x.png"' +
    '																					style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;"' +
    '																					title="Facebook" width="32" /></a>' +
    '																		</td>' +
    '																		<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 8px; padding-left: 8px; border-collapse: collapse;"' +
    '																			valign="top"><a' +
    '																				href="https://twitter.com/comparecarpart"' +
    '																				target="_blank"><img alt="Twitter"' +
    '																					height="32"' +
    '																					src="https://s3.eu-west-2.amazonaws.com/carpart-images-large/twitter%402x.png"' +
    '																					style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;"' +
    '																					title="Twitter" width="32" /></a>' +
    '																		</td>' +
    '																		<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 8px; padding-left: 8px; border-collapse: collapse;"' +
    '																			valign="top"><a' +
    '																				href="https://www.instagram.com/comparethecarpart/"' +
    '																				target="_blank"><img alt="Instagram"' +
    '																					height="32"' +
    '																					src="https://s3.eu-west-2.amazonaws.com/carpart-images-large/instagram%402x.png"' +
    '																					style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;"' +
    '																					title="Instagram" width="32" /></a>' +
    '																		</td>' +
    '																	</tr>' +
    '																</tbody>' +
    '															</table>' +
    '														</td>' +
    '													</tr>' +
    '												</tbody>' +
    '											</table>' +
    '											<table border="0" cellpadding="0" cellspacing="0" class="divider"' +
    '												role="presentation"' +
    '												style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"' +
    '												valign="top" width="100%">' +
    '												<tbody>' +
    '													<tr style="vertical-align: top;" valign="top">' +
    '														<td class="divider_inner"' +
    '															style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; border-collapse: collapse;"' +
    '															valign="top">' +
    '															<table align="center" border="0" cellpadding="0"' +
    '																cellspacing="0" class="divider_content" height="0"' +
    '																role="presentation"' +
    '																style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 60%; border-top: 1px dotted #C4C4C4; height: 0px;"' +
    '																valign="top" width="60%">' +
    '																<tbody>' +
    '																	<tr style="vertical-align: top;" valign="top">' +
    '																		<td height="0"' +
    '																			style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;"' +
    '																			valign="top"><span></span></td>' +
    '																	</tr>' +
    '																</tbody>' +
    '															</table>' +
    '														</td>' +
    '													</tr>' +
    '												</tbody>' +
    '											</table>' +
    '											<div' +
    '												style="color:#4F4F4F;font-family:Arial, \'Helvetica Neue\', Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">' +
    '												<div' +
    '													style="font-size: 12px; line-height: 14px; font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif; color: #4F4F4F;">' +
    '													<p' +
    '														style="font-size: 12px; line-height: 18px; text-align: center; margin: 0;">' +
    '														<span style="font-size: 15px;"><a' +
    '																href="https://www.comparethecarpart.com" rel="noopener"' +
    '																style="text-decoration: underline; color: #2190E3;"' +
    '																target="_blank">https://www.comparethecarpart.com</a></span>' +
    '													</p>' +
    '												</div>' +
    '											</div>' +
    '										</div>' +
    '									</div>' +
    '								</div>' +
    '							</div>' +
    '						</div>' +
    '					</div>' +
    '				</td>' +
    '			</tr>' +
    '		</tbody>' +
    '	</table>' +
    '</body>' +
    '' +
    '</html>';

  var mail = {
    from: "voice@comparethecarpart.com",
    to: email,
    subject: "Compare the car part - " + brand + ' - ' + category,
    html: emailTemplate
  }
  let promise = new Promise((resolve, reject) => {
    smtpTransport.sendMail(mail, function (error, response) {
      if (error) {
        resolve(true);
      } else {
        smtpTransport.close();
        resolve(true);
      }
    });
  });
  let result = await promise;
  var welcomeSpeechOutput = 'We send email of lowest price part details to your email address ' + PAUSE + ' Thank you for visiting us' + PAUSE + 'Have a great day';
  const speechOutput = welcomeSpeechOutput;

  return buildResponseWithRepromt(speechOutput, true, "Over 1 million car parts available", 'try again');
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
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput,
        "text": speechText
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
      }
    }
  }
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