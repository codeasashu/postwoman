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
