// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
export const mapEnvironmentVariable = function(environment) {
  let mappedEnvVars = {}
  environment.variables.forEach(item => {
    mappedEnvVars[item["key"]] = item["value"]
  })
  return mappedEnvVars
}

export const createUUID = function() {
  var dt = new Date().getTime()
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export const basicRequestSchema = {
  uri: "",
  url: undefined,
  path: undefined,
  method: undefined,
  auth: "None",
  label: "",
  httpUser: "",
  httpPassword: "",
  passwordFieldType: "password",
  bearerToken: "",
  headers: [],
  params: [],
  bodyParams: [],
  rawParams: "",
  rawInput: false,
  contentType: "",
  requestType: "",
}

export const httpbinRequest = Object.assign({}, basicRequestSchema, {
  method: "GET",
  url: "https://httpbin.org",
  path: "/get",
})
