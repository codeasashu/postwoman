import { sendNetworkRequest } from "./network"
import parseTemplateString from "./templating"
import getEnvironmentVariablesFromScript from "./preRequest"
import { mapEnvironmentVariable } from "../functions"

class Request {
  constructor(request) {
    this.uri = request.url + request.path
    this.url = request.url
    this.path = request.path
    this.method = request.method
    this.auth = request.auth
    this.httpUser = request.httpUser
    this.httpPassword = request.httpPassword
    this.passwordFieldType = request.passwordFieldType
    this.bearerToken = request.bearerToken
    this.headers = request.headers
    this.params = request.params
    this.bodyParams = request.bodyParams
    this.rawParams = request.rawParams
    this.rawInput = request.rawInput
    this.contentType = request.contentType
    this.requestType = request.requestType
    this.label = request.name
    this.files = []
  }

  get pathName() {
    return this.path.match(/^([^?]*)\??/)[1]
  }

  get queryString() {
    const result = this.params
      .filter(({ key }) => !!key)
      .map(({ key, value }) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
    return result === "" ? "" : `?${result}`
  }

  hasRequestBody() {
    return ["POST", "PUT", "PATCH"].includes(this.method)
  }

  hasFiles() {
    return this.files.length !== 0
  }

  rawRequestBody() {
    const { bodyParams, contentType } = this
    if (contentType === "application/json") {
      try {
        const obj = JSON.parse(
          `{${bodyParams
            .filter(({ key }) => !!key)
            .map(
              ({ key, value }) => `
                "${key}": "${value}"
                `
            )
            .join()}}`
        )
        return JSON.stringify(obj, null, 2)
      } catch (ex) {
        return "invalid"
      }
    } else {
      return bodyParams
        .filter(({ key }) => !!key)
        .map(({ key, value }) => `${key}=${encodeURIComponent(value)}`)
        .join("&")
    }
  }

  getHeaders(headers) {
    headers = Object.assign(
      // Clone the app headers object first, we don't want to
      // mutate it with the request headers added by default.
      Object.assign({}, this.headers)
      // We make our temporary headers object the source so
      // that you can override the added headers if you
      // specify them.
      // headers
    )
    let headersObject = {}
    Object.keys(headers).forEach(id => {
      headersObject[headers[id].key] = headers[id].value
    })
    return headersObject
  }

  getFormData() {
    const formData = new FormData()
    for (let i = 0; i < this.files.length; i++) {
      let file = this.files[i]
      formData.append(i, file)
    }
    formData.append("data", requestBody)
    return formData
  }

  getHttpAuth() {
    return this.auth === "Basic Auth"
      ? {
          username: this.httpUser,
          password: this.httpPassword,
        }
      : null
  }

  prepareRequest() {
    const httpAuth = this.getHttpAuth()

    let headers = {}

    // If the request has a body, we want to ensure Content-Length and
    // Content-Type are sent.
    let requestBody
    if (this.hasRequestBody()) {
      requestBody = this.rawInput ? this.rawParams : this.rawRequestBody()
      Object.assign(headers, {
        //'Content-Length': requestBody.length,
        "Content-Type": `${this.contentType}; charset=utf-8`,
      })
    }
    requestBody ? requestBody.toString() : null

    // Append form data if files are included
    if (this.hasFiles()) requestBody = this.getFormData()

    headers = this.getHeaders(headers)

    //@TODO - Add prerequisites (last param)
    let preRequestScript = "// pw.env.set('variable', 'value');"
    this.prepareRequestObject = this.getRequestObject(
      httpAuth,
      headers,
      requestBody,
      preRequestScript
    )
    return this
  }

  getNetworkObject() {
    return this.prepareRequestObject
  }

  async send(store) {
    if (!this.getNetworkObject()) {
      this.prepareRequest()
    }
    if (!this.getNetworkObject()) {
      throw "Not a prepared Request"
    }
    return await sendNetworkRequest(this.getNetworkObject(), store)
  }

  setEnvironment(environment) {
    this.environment = Object.assign({ variables: [] }, environment)
  }

  getEnvironment() {
    return this.environment
  }

  getRequestObject(auth, headers, requestBody, preRequestScript) {
    const requestOptions = {
      method: this.method,
      url: this.url + this.pathName + this.queryString,
      auth,
      headers,
      data: requestBody,
      credentials: true,
    }
    if (preRequestScript || this.environment) {
      const environmentVariables = Object.assign(
        {},
        getEnvironmentVariablesFromScript(preRequestScript),
        mapEnvironmentVariable(this.environment)
      )
      requestOptions.url =
        parseTemplateString(this.url, environmentVariables) +
        parseTemplateString(this.pathName, environmentVariables) +
        (this.queryString
          ? "?" +
            parseTemplateString(decodeURIComponent(this.queryString.slice(1)), environmentVariables)
          : "")
      requestOptions.data = parseTemplateString(requestOptions.data, environmentVariables)
      for (let k in requestOptions.headers) {
        const kParsed = parseTemplateString(k, environmentVariables)
        const valParsed = parseTemplateString(requestOptions.headers[k], environmentVariables)
        delete requestOptions.headers[k]
        requestOptions.headers[kParsed] = valParsed
      }
    }
    if (typeof requestOptions.data === "string") {
      requestOptions.data = parseTemplateString(requestOptions.data)
    }

    return requestOptions
  }

  getRequestCode() {
    return this.requestCode
  }

  getPathWithoutQueryString(val) {
    return val.match(/^([^?]*)\??/)[1]
  }

  get requestCode() {
    let pathName = this.getPathWithoutQueryString(this.path)
    if (this.requestType === "JavaScript XHR") {
      const requestString = []
      requestString.push("const xhr = new XMLHttpRequest()")
      const user = this.auth === "Basic Auth" ? `'${this.httpUser}'` : null
      const password = this.auth === "Basic Auth" ? `'${this.httpPassword}'` : null
      requestString.push(
        `xhr.open('${this.method}', '${this.url}${this.pathName}${this.queryString}', true, ${user}, ${password})`
      )
      if (this.auth === "Bearer Token" || this.auth === "OAuth 2.0") {
        requestString.push(`xhr.setRequestHeader('Authorization', 'Bearer ${this.bearerToken}')`)
      }
      if (this.headers) {
        this.headers.forEach(({ key, value }) => {
          requestString.push(`xhr.setRequestHeader('${key}', '${value}')`)
        })
      }
      if (["POST", "PUT", "PATCH"].includes(this.method)) {
        const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody()
        requestString.push(`xhr.setRequestHeader('Content-Length', ${requestBody.length})`)
        requestString.push(
          `xhr.setRequestHeader('Content-Type', '${this.contentType}; charset=utf-8')`
        )
        requestString.push(`xhr.send(${requestBody})`)
      } else {
        requestString.push("xhr.send()")
      }
      return requestString.join("\n")
    } else if (this.requestType === "Fetch") {
      const requestString = []
      let headers = []
      requestString.push(`fetch("${this.url}${pathName}${this.queryString}", {\n`)
      requestString.push(`  method: "${this.method}",\n`)
      if (this.auth === "Basic Auth") {
        const basic = `${this.httpUser}:${this.httpPassword}`
        headers.push(
          `    "Authorization": "Basic ${window.btoa(unescape(encodeURIComponent(basic)))}",\n`
        )
      } else if (this.auth === "Bearer Token" || this.auth === "OAuth 2.0") {
        headers.push(`    "Authorization": "Bearer ${this.bearerToken}",\n`)
      }
      if (["POST", "PUT", "PATCH"].includes(this.method)) {
        const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody()
        requestString.push(`  body: ${requestBody},\n`)
        headers.push(`    "Content-Length": ${requestBody.length},\n`)
        headers.push(`    "Content-Type": "${this.contentType}; charset=utf-8",\n`)
      }
      if (this.headers) {
        this.headers.forEach(({ key, value }) => {
          headers.push(`    "${key}": "${value}",\n`)
        })
      }
      headers = headers.join("").slice(0, -2)
      requestString.push(`  headers: {\n${headers}\n  },\n`)
      requestString.push('  credentials: "same-origin"\n')
      requestString.push("}).then(function(response) {\n")
      requestString.push("  response.status\n")
      requestString.push("  response.statusText\n")
      requestString.push("  response.headers\n")
      requestString.push("  response.url\n\n")
      requestString.push("  return response.text()\n")
      requestString.push("}).catch(function(error) {\n")
      requestString.push("  error.message\n")
      requestString.push("})")
      return requestString.join("")
    } else if (this.requestType === "cURL") {
      const requestString = []
      requestString.push(`curl -X ${this.method} \n`)
      requestString.push(`  '${this.url}${pathName}${this.queryString}' \n`)
      if (this.auth === "Basic Auth") {
        const basic = `${this.httpUser}:${this.httpPassword}`
        requestString.push(
          `  -H 'Authorization: Basic ${window.btoa(unescape(encodeURIComponent(basic)))}' \n`
        )
      } else if (this.auth === "Bearer Token" || this.auth === "OAuth 2.0") {
        requestString.push(`  -H 'Authorization: Bearer ${this.bearerToken}' \n`)
      }
      if (this.headers) {
        this.headers.forEach(({ key, value }) => {
          requestString.push(`  -H '${key}: ${value}' \n`)
        })
      }
      if (["POST", "PUT", "PATCH"].includes(this.method)) {
        const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody()
        requestString.push(`  -H 'Content-Length: ${requestBody.length}' \n`)
        requestString.push(`  -H 'Content-Type: ${this.contentType}; charset=utf-8' \n`)
        requestString.push(`  -d '${requestBody}' \n`)
      }
      return requestString.join("").slice(0, -2)
    }
  }
}

export const PWRequest = Request
