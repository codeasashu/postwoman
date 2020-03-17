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
  method: "GET",
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

export const urlParse = uri => {
  try {
    //@TODO new URL(value), use replaceenvvar before substituting to URL
    url = new URL(uri)
    return { origin: url.origin, path: url.pathname, queryparams: url.search }
  } catch (error) {
    // console.log(error)
    let uriRegex = uri.match(/^((http[s]?:\/\/)?(<<[^\/]+>>)?[^\/]*|)(\/?.*)$/)
    return { origin: uriRegex[1], path: uriRegex[4], queryparams: undefined }
  }
}
