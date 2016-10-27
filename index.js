'use strict';

const AWS = require('aws-sdk');

/* Object containing configuration for Elasticsearch
 * file: config.json
 *  
 * {
 *   "endpoint": "XXXX.us-east-1.es.amazonaws.com",
 *   "region": "us-east-1",
 *   "index": "your-es-Index",
 *   "doctype" : "apache"
 * }
 */
const esDomain = require('./config');

function esRequest(type, path) {
  let endpoint =  new AWS.Endpoint(esDomain.endpoint);

  return new Promise((resolve, reject) => {
    let req = new AWS.HttpRequest(endpoint);
    
    req.method = type;
    req.headers['Host'] = endpoint.host;
    req.path = path;
    req.region = esDomain.region;

    signReq(req)
      .then((resp) => {
        if (resp) {
          resolve(resp);
        }
        reject('No Response');
      });
  });
}

function signReq(request) {
  let signer = new AWS.Signers.V4(request, 'es'),
      client = new AWS.NodeHttpClient(),
      creds = new AWS.EnvironmentCredentials('AWS');

  signer.addAuthorization(creds, new Date());

  return new Promise(function(resolve, reject) {
    client.handleRequest(request, null, function(httpResp) {
      let body = '';
      
      httpResp
        .on('data', function(chunk) {
          body += chunk;
        })
        .on('end', function() {
          resolve({
            "statusCode": httpResp.statusCode,
            "headers": {
              "Content-Type":"application/json",
            },
            "body": body
          });
        });
    }, function(err) {
      reject(err);
    });
  });
}

exports.handler = (event, context) => {
  //let {path, httpMethod} = event;
  var path = event.path,
      httpMethod = event.httpMethod;

  if (path && httpMethod) {
    esRequest(httpMethod, path)
      .then((resp) => {
        context.done(null, {
          "statusCode": 200,
          "headers": {
            "Content-Type":"application/json",
          },
          "body": resp.body
        });
      });
  }
  else {
    context.done(null, {
      "statusCode": 404,
      "headers": {
        "Content-Type":"application/json",
      },
      "body": JSON.stringify(event)
    });
  }
};
