<template>
  <div class="page">
    <div class="content v-layout v-gutter">
      <request-input :request="selectedRequest" @send="prepareRequest" @clear="clearContent">
        <div slot="requestHeader">
          <v-input append-icon="visibility" @click:append="displayModalEdit(true)">
            <v-select
              v-model="selectedEnvironment"
              :items="environments"
              item-text="name"
              item-value="name"
              persistent-hint
              return-object
              single-line
              label="Select environment"
              clearable
            ></v-select>
          </v-input>
        </div>
      </request-input>

      <div class="v-layout-item v-size-100">
        <v-tabs v-model="tab">
          <v-tab id="tab-query-params">{{ $t("query_parameters") }}</v-tab>
          <v-tab id="tab-auth">{{ $t("auth") }}</v-tab>
          <v-tab id="tab-headers">{{ $t("headers") }}</v-tab>
          <v-tab id="tab-body">{{ $t("body") }}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <query-params
              :params="selectedRequest.params"
              @set_key="event => $store.commit('setKeyParams', ...event)"
              @set_value="event => $store.commit('setValueParams', ...event)"
              @clear_all="clearContent('parameters', $event)"
              @delete="index => removeRequestParam(index)"
              @add_new="addRequestParam"
            />
          </v-tab-item>
          <v-tab-item>
            <authentication
              :auth="auth"
              @set_select="
                val => {
                  auth = val
                }
              "
              @clear_all="clearContent('auth', $event)"
            />
          </v-tab-item>
          <v-tab-item>
            <headers
              :headers="selectedRequest.headers"
              :commonHeaders="commonHeaders"
              @set_route_query="setRouteQueryState"
              @set_key="event => $store.commit('setKeyHeader', ...event)"
              @set_value="event => $store.commit('setValueHeader', ...event)"
              @delete="index => removeRequestHeader(index)"
              @add_new="addRequestHeader"
              @clear_all="clearContent('headers', $event)"
            />
          </v-tab-item>
          <v-tab-item>
            <request-body
              v-if="['POST', 'PUT', 'PATCH'].includes(selectedRequest.method)"
              :method="selectedRequest.method"
              :rawInput="rawInput"
              :rawParams="rawParams"
              :bodyParams="bodyParams"
              :contentType="contentType"
              @raw-params="
                val => {
                  rawParams = val
                }
              "
              @raw-input="
                hasRawInput => {
                  rawInput = hasRawInput
                }
              "
              @set_content_type="
                val => {
                  contentType = val
                }
              "
              @set_key="event => $store.commit('setKeyBodyParams', ...event)"
              @set_value="event => $store.commit('setValueBodyParams', ...event)"
              @delete="index => removeRequestBodyParam(index)"
              @add_new="addRequestBodyParam"
            />
          </v-tab-item>
        </v-tabs-items>
      </div>

      <v-divider class="v-layout" />
      <!-- Response -->
      <div class="v-layout-item v-size-100">
        <response ref="response" :response="response" />
      </div>
      <!-- END Response -->

      <editEnvironment
        :show="showModalEditEnvironment"
        :editingEnvironment="editingEnvironment"
        :editingEnvironmentIndex="editingEnvironmentIndex"
        @hide-modal="displayModalEdit(false)"
      />

      <pw-modal v-if="showModal" @close="showModal = false">
        <div slot="header">
          <ul>
            <li>
              <div class="flex-wrap">
                <h3 class="title">{{ $t("import_curl") }}</h3>
                <div>
                  <button class="icon" @click="showModal = false">
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div slot="body">
          <ul>
            <li>
              <textarea
                id="import-text"
                autofocus
                rows="8"
                :placeholder="$t('enter_curl')"
              ></textarea>
            </li>
          </ul>
        </div>
        <div slot="footer">
          <div class="flex-wrap">
            <span></span>
            <span>
              <button class="icon" @click="showModal = false">
                {{ $t("cancel") }}
              </button>
              <button class="icon primary" @click="handleImport">
                {{ $t("import") }}
              </button>
            </span>
          </div>
        </div>
      </pw-modal>

      <pw-modal v-if="!isHidden" @close="isHidden = true">
        <div slot="header">
          <ul>
            <li>
              <div class="flex-wrap">
                <h3 class="title">{{ $t("generate_code") }}</h3>
                <div>
                  <button class="icon" @click="isHidden = true">
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div slot="body">
          <ul>
            <li>
              <label for="requestType">{{ $t("request_type") }}</label>
              <span class="select-wrapper">
                <select id="requestType" v-model="requestType">
                  <option>JavaScript XHR</option>
                  <option>Fetch</option>
                  <option>cURL</option>
                </select>
              </span>
            </li>
          </ul>
          <ul>
            <li>
              <div class="flex-wrap">
                <label for="generatedCode">{{ $t("generated_code") }}</label>
                <div>
                  <button
                    class="icon"
                    @click="copyRequestCode"
                    id="copyRequestCode"
                    ref="copyRequestCode"
                    v-tooltip="$t('copy_code')"
                  >
                    <i class="material-icons">file_copy</i>
                  </button>
                </div>
              </div>
              <textarea
                id="generatedCode"
                ref="generatedCode"
                name="generatedCode"
                rows="8"
                v-model="requestCode"
              ></textarea>
            </li>
          </ul>
        </div>
        <div slot="footer"></div>
      </pw-modal>

      <pw-modal v-if="showTokenList" @close="showTokenList = false">
        <div slot="header">
          <ul>
            <li>
              <div class="flex-wrap">
                <h3 class="title">{{ $t("manage_token") }}</h3>
                <div>
                  <button class="icon" @click="showTokenList = false">
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div slot="body">
          <ul>
            <li>
              <div class="flex-wrap">
                <label for="token-list">{{ $t("token_list") }}</label>
                <div v-if="tokens.length != 0">
                  <button
                    class="icon"
                    @click="clearContent('tokens', $event)"
                    v-tooltip.bottom="$t('clear')"
                  >
                    <i class="material-icons">clear_all</i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <ul id="token-list" v-for="(token, index) in tokens" :key="index">
            <li>
              <input
                :placeholder="'name ' + (index + 1)"
                :value="token.name"
                @change="
                  $store.commit('setOAuthTokenName', {
                    index,
                    value: $event.target.value,
                  })
                "
              />
            </li>
            <li>
              <input :value="token.value" readonly />
            </li>
            <div class="flex-wrap">
              <li>
                <button
                  class="icon"
                  @click="useOAuthToken(token.value)"
                  v-tooltip.bottom="$t('use_token')"
                >
                  <i class="material-icons">input</i>
                </button>
              </li>
              <li>
                <button
                  class="icon"
                  @click="removeOAuthToken(index)"
                  v-tooltip.bottom="$t('delete')"
                >
                  <i class="material-icons">delete</i>
                </button>
              </li>
            </div>
          </ul>
          <p v-if="tokens.length === 0" class="info">
            {{ $t("empty") }}
          </p>
        </div>
        <div slot="footer"></div>
      </pw-modal>

      <pw-modal v-if="showTokenRequestList" @close="showTokenRequestList = false">
        <div slot="header">
          <ul>
            <li>
              <div class="flex-wrap">
                <h3 class="title">{{ $t("manage_token_req") }}</h3>
                <div>
                  <button class="icon" @click="showTokenRequestList = false">
                    <i class="material-icons">close</i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div slot="body">
          <ul>
            <li>
              <div class="flex-wrap">
                <label for="token-req-list">{{ $t("token_req_list") }}</label>
                <div>
                  <button
                    :disabled="this.tokenReqs.length === 0"
                    class="icon"
                    @click="showTokenRequestList = false"
                    v-tooltip.bottom="$t('use_token_req')"
                  >
                    <i class="material-icons">input</i>
                  </button>
                  <button
                    :disabled="this.tokenReqs.length === 0"
                    class="icon"
                    @click="removeOAuthTokenReq"
                    v-tooltip.bottom="$t('delete')"
                  >
                    <i class="material-icons">delete</i>
                  </button>
                </div>
              </div>
              <span class="select-wrapper">
                <select
                  id="token-req-list"
                  v-model="tokenReqSelect"
                  :disabled="this.tokenReqs.length === 0"
                  @change="tokenReqChange($event)"
                >
                  <option v-for="(req, index) in tokenReqs" :key="index" :value="req.name">
                    {{ req.name }}
                  </option>
                </select>
              </span>
            </li>
          </ul>
          <ul>
            <li>
              <label for="token-req-name">{{ $t("token_req_name") }}</label>
              <input v-model="tokenReqName" />
            </li>
          </ul>
          <ul>
            <li>
              <label for="token-req-details">
                {{ $t("token_req_details") }}
              </label>
              <textarea
                id="token-req-details"
                readonly
                rows="7"
                v-model="tokenReqDetails"
              ></textarea>
            </li>
          </ul>
        </div>
        <div slot="footer">
          <div class="flex-wrap">
            <span></span>
            <span>
              <button class="icon primary" @click="addOAuthTokenReq">
                {{ $t("save_token_req") }}
              </button>
            </span>
          </div>
        </div>
      </pw-modal>
    </div>
  </div>
</template>

<script>
import section from "../components/layout/section"
import url from "url"
import querystring from "querystring"
import { commonHeaders } from "../functions/headers"
import textareaAutoHeight from "../directives/textareaAutoHeight"
import parseCurlCommand from "../assets/js/curlparser.js"
import getEnvironmentVariablesFromScript from "../functions/preRequest"
import runTestScriptWithVariables from "../functions/postwomanTesting"
import parseTemplateString from "../functions/templating"
import AceEditor from "../components/ui/ace-editor"
import { tokenRequest, oauthRedirect } from "../assets/js/oauth"
import { sendNetworkRequest } from "../functions/network"
import { fb } from "../functions/fb"
import { mapEnvironmentVariable } from "../functions"
import { findIndex } from "lodash"

const statusCategories = [
  {
    name: "informational",
    statusCodeRegex: new RegExp(/[1][0-9]+/),
    className: "info-response",
    colorCode: "primary",
  },
  {
    name: "successful",
    statusCodeRegex: new RegExp(/[2][0-9]+/),
    className: "success-response",
    colorCode: "green",
  },
  {
    name: "redirection",
    statusCodeRegex: new RegExp(/[3][0-9]+/),
    className: "redir-response",
    colorCode: "primary",
  },
  {
    name: "client error",
    statusCodeRegex: new RegExp(/[4][0-9]+/),
    className: "cl-error-response",
    colorCode: "red",
  },
  {
    name: "server error",
    statusCodeRegex: new RegExp(/[5][0-9]+/),
    className: "sv-error-response",
    colorCode: "red",
  },
  {
    // this object is a catch-all for when no other objects match and should always be last
    name: "unknown",
    statusCodeRegex: new RegExp(/.*/),
    className: "missing-data-response",
    colorCode: "white",
  },
]
const parseHeaders = xhr => {
  const headers = xhr
    .getAllResponseHeaders()
    .trim()
    .split(/[\r\n]+/)
  const headerMap = {}
  headers.forEach(line => {
    const parts = line.split(": ")
    const header = parts.shift().toLowerCase()
    const value = parts.join(": ")
    headerMap[header] = value
  })
  return headerMap
}
export const findStatusGroup = responseStatus =>
  statusCategories.find(status => status.statusCodeRegex.test(responseStatus))
export default {
  directives: {
    textareaAutoHeight,
  },
  components: {
    "pw-section": section,
    "pw-toggle": () => import("../components/ui/toggle"),
    "pw-modal": () => import("../components/ui/modal"),
    autocomplete: () => import("../components/ui/autocomplete"),
    Editor: AceEditor,
    inputform: () => import("../components/firebase/inputform"),
    notes: () => import("../components/firebase/feeds"),
    environments: () => import("../components/environments"),
    queryParams: () => import("../components/request/queryParams"),
    authentication: () => import("../components/request/authentication"),
    headers: () => import("../components/request/headers"),
    requestBody: () => import("../components/request/requestBody"),
    response: () => import("../components/response"),
    editEnvironment: () => import("../components/environments/editEnvironment"),
    requestInput: () => import("../components/request"),
  },
  data() {
    return {
      showModal: false,
      showModalEditEnvironment: false,
      showPreRequestScript: false,
      testsEnabled: false,
      testScript: "// pw.expect('variable').toBe('value');",
      preRequestScript: "// pw.env.set('variable', 'value');",
      testReports: null,
      copyButton: '<i class="material-icons">file_copy</i>',
      downloadButton: '<i class="material-icons">get_app</i>',
      doneButton: '<i class="material-icons">done</i>',
      isHidden: true,
      selectedEnvironment: undefined,
      editingEnvironment: undefined,
      editingEnvironmentIndex: -1,
      response: {
        status: "",
        headers: "",
        body: "",
      },
      previewEnabled: false,
      paramsWatchEnabled: true,
      expandResponse: false,
      showTokenList: false,
      showTokenRequest: false,
      showTokenRequestList: false,
      /**
       * These are content types that can be automatically
       * serialized by postwoman.
       */
      knownContentTypes: ["application/json", "application/x-www-form-urlencoded"],
      /**
       * These are a list of Content Types known to Postwoman.
       */
      commonHeaders,
      urlExcludes: {},
      activeSidebar: true,
      fb,
      customMethod: false,
      files: [],
      filenames: "",
      navigatorShare: navigator.share,

      settings: {
        SCROLL_INTO_ENABLED:
          typeof this.$store.state.postwoman.settings.SCROLL_INTO_ENABLED !== "undefined"
            ? this.$store.state.postwoman.settings.SCROLL_INTO_ENABLED
            : true,
      },
      tab: null,
    }
  },
  watch: {
    urlExcludes: {
      deep: true,
      handler() {
        this.$store.commit("postwoman/applySetting", [
          "URL_EXCLUDES",
          Object.assign({}, this.urlExcludes),
        ])
      },
    },
    contentType(val) {
      this.rawInput = !this.knownContentTypes.includes(val)
    },
    rawInput(status) {
      if (status && this.rawParams === "") {
        this.rawParams = "{}"
      } else {
        this.setRouteQueryState()
      }
    },
    params: {
      handler: function(newValue) {
        if (!this.paramsWatchEnabled) {
          this.paramsWatchEnabled = true
          return
        }
        let path = this.path
        let queryString = newValue
          .filter(({ key }) => !!key)
          .map(({ key, value }) => `${key}=${value}`)
          .join("&")
        queryString = queryString === "" ? "" : `?${queryString}`
        if (path.includes("?")) {
          path = path.slice(0, path.indexOf("?")) + queryString
        } else {
          path = path + queryString
        }
        this.path = path
      },
      deep: true,
    },
    selectedRequest(newValue, oldValue) {
      // @TODO: Convert all variables to single request variable
      if (!newValue) return
      this.uri = newValue.url + newValue.path
      this.url = newValue.url
      this.path = newValue.path
      this.method = newValue.method
      this.auth = newValue.auth
      this.httpUser = newValue.httpUser
      this.httpPassword = newValue.httpPassword
      this.passwordFieldType = newValue.passwordFieldType
      this.bearerToken = newValue.bearerToken
      this.headers = newValue.headers
      this.params = newValue.params
      this.bodyParams = newValue.bodyParams
      this.rawParams = newValue.rawParams
      this.rawInput = newValue.rawInput
      this.contentType = newValue.contentType
      this.requestType = newValue.requestType
      this.label = newValue.name
    },
    method() {
      // this.$store.commit('setState', { 'value': ["POST", "PUT", "PATCH"].includes(this.method) ? 'application/json' : '', 'attribute': 'contentType' })
      this.contentType = ["POST", "PUT", "PATCH"].includes(this.method) ? "application/json" : ""
    },
  },
  computed: {
    environments() {
      return this.$store.state.postwoman.environments
    },
    auth: {
      get() {
        return this.$store.state.request.auth
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "auth" })
      },
    },
    httpUser: {
      get() {
        return this.$store.state.request.httpUser
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "httpUser" })
      },
    },
    httpPassword: {
      get() {
        return this.$store.state.request.httpPassword
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "httpPassword" })
      },
    },
    bearerToken: {
      get() {
        return this.$store.state.request.bearerToken
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "bearerToken" })
      },
    },
    tokens: {
      get() {
        return this.$store.state.oauth2.tokens
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "tokens" })
      },
    },
    tokenReqs: {
      get() {
        return this.$store.state.oauth2.tokenReqs
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "tokenReqs" })
      },
    },
    tokenReqSelect: {
      get() {
        return this.$store.state.oauth2.tokenReqSelect
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "tokenReqSelect" })
      },
    },
    tokenReqName: {
      get() {
        return this.$store.state.oauth2.tokenReqName
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "tokenReqName" })
      },
    },
    accessTokenName: {
      get() {
        return this.$store.state.oauth2.accessTokenName
      },
      set(value) {
        this.$store.commit("setOAuth2", {
          value,
          attribute: "accessTokenName",
        })
      },
    },
    oidcDiscoveryUrl: {
      get() {
        return this.$store.state.oauth2.oidcDiscoveryUrl
      },
      set(value) {
        this.$store.commit("setOAuth2", {
          value,
          attribute: "oidcDiscoveryUrl",
        })
      },
    },
    authUrl: {
      get() {
        return this.$store.state.oauth2.authUrl
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "authUrl" })
      },
    },
    accessTokenUrl: {
      get() {
        return this.$store.state.oauth2.accessTokenUrl
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "accessTokenUrl" })
      },
    },
    clientId: {
      get() {
        return this.$store.state.oauth2.clientId
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "clientId" })
      },
    },
    scope: {
      get() {
        return this.$store.state.oauth2.scope
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "scope" })
      },
    },
    state: {
      get() {
        return this.$store.state.oauth2.state
      },
      set(value) {
        this.$store.commit("setOAuth2", { value, attribute: "state" })
      },
    },
    headers: {
      get() {
        return this.$store.state.request.headers
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "headers" })
      },
    },
    params: {
      get() {
        return this.$store.state.request.params
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "params" })
      },
    },
    bodyParams: {
      get() {
        return this.$store.state.request.bodyParams
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "bodyParams" })
      },
    },
    rawParams: {
      get() {
        return this.$store.state.request.rawParams
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "rawParams" })
      },
    },
    rawInput: {
      get() {
        return this.$store.state.request.rawInput
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "rawInput" })
      },
    },
    requestType: {
      get() {
        return this.$store.state.request.requestType
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "requestType" })
      },
    },
    contentType: {
      get() {
        return this.$store.state.request.contentType
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "contentType" })
      },
    },
    passwordFieldType: {
      get() {
        return this.$store.state.request.passwordFieldType
      },
      set(value) {
        this.$store.commit("setState", {
          value,
          attribute: "passwordFieldType",
        })
      },
    },
    selectedRequest() {
      return this.$store.state.postwoman.selectedRequest
    },
    requestName() {
      return this.label
    },
    statusCategory() {
      return findStatusGroup(this.response.status)
    },
    hasRequestBody() {
      return ["POST", "PUT", "PATCH"].includes(this.method)
    },
    pathName() {
      return this.path.match(/^([^?]*)\??/)[1]
    },
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
    },
    headerString() {
      const result = this.headers
        .filter(({ key }) => !!key)
        .map(({ key, value }) => `${key}: ${value}`)
        .join(",\n")
      return result === "" ? "" : `${result}`
    },
    queryString() {
      const result = this.params
        .filter(({ key }) => !!key)
        .map(({ key, value }) => `${key}=${encodeURIComponent(value)}`)
        .join("&")
      return result === "" ? "" : `?${result}`
    },
    requestCode() {
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
          const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody
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
        requestString.push(`fetch("${this.url}${this.pathName}${this.queryString}", {\n`)
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
          const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody
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
        requestString.push(`  '${this.url}${this.pathName}${this.queryString}' \n`)
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
          const requestBody = this.rawInput ? this.rawParams : this.rawRequestBody
          requestString.push(`  -H 'Content-Length: ${requestBody.length}' \n`)
          requestString.push(`  -H 'Content-Type: ${this.contentType}; charset=utf-8' \n`)
          requestString.push(`  -d '${requestBody}' \n`)
        }
        return requestString.join("").slice(0, -2)
      }
    },
    tokenReqDetails() {
      const details = {
        oidcDiscoveryUrl: this.oidcDiscoveryUrl,
        authUrl: this.authUrl,
        accessTokenUrl: this.accessTokenUrl,
        clientId: this.clientId,
        scope: this.scope,
      }
      return JSON.stringify(details, null, 2)
    },
  },
  methods: {
    displayModalEdit(shouldDisplay) {
      if (!this.selectedEnvironment) {
        return
      }

      if (shouldDisplay) {
        this.$data.editingEnvironment = this.selectedEnvironment
        this.$data.editingEnvironmentIndex = findIndex(
          this.environments,
          e => e.id === this.selectedEnvironment.id
        )
      }

      if (!shouldDisplay) {
        this.$data.editingEnvironment = undefined
        this.$data.editingEnvironmentIndex = undefined
      }

      this.$data.showModalEditEnvironment = shouldDisplay
    },
    scrollInto(view) {
      this.$refs[view].$el.scrollIntoView({
        behavior: "smooth",
      })
    },
    getVariablesFromPreRequestScript() {
      if (!this.preRequestScript) {
        return {}
      }
      return getEnvironmentVariablesFromScript(this.preRequestScript)
    },
    async makeRequest(auth, headers, requestBody, preRequestScript) {
      const requestOptions = {
        method: this.method,
        url: this.url + this.pathName + this.queryString,
        auth,
        headers,
        data: requestBody,
        credentials: true,
      }
      if (preRequestScript || this.$data.selectedEnvironment) {
        const environmentVariables = Object.assign(
          {},
          getEnvironmentVariablesFromScript(preRequestScript),
          mapEnvironmentVariable(this.$data.selectedEnvironment)
        )
        requestOptions.url =
          parseTemplateString(this.url, environmentVariables) +
          parseTemplateString(this.pathName, environmentVariables) +
          (this.queryString
            ? "?" +
              encodeURIComponent(
                // decode query string before
                parseTemplateString(
                  decodeURIComponent(this.queryString.slice(1)),
                  environmentVariables
                )
              )
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
      return await sendNetworkRequest(requestOptions, this.$store)
    },
    prepareRequest(request) {
      if (!request) return
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

      this.sendRequest()
    },
    async sendRequest() {
      this.$toast.clear()
      if (this.settings.SCROLL_INTO_ENABLED) this.scrollInto("response")
      // Start showing the loading bar as soon as possible.
      // The nuxt axios module will hide it when the request is made.
      this.$nuxt.$loading.start()
      if (this.$refs.response.$el.classList.contains("hidden")) {
        this.$refs.response.$el.classList.toggle("hidden")
      }
      this.previewEnabled = false
      this.response.status = this.$t("fetching")
      this.response.body = this.$t("loading")
      const auth =
        this.auth === "Basic Auth"
          ? {
              username: this.httpUser,
              password: this.httpPassword,
            }
          : null
      let headers = {}
      let headersObject = {}
      Object.keys(headers).forEach(id => {
        headersObject[headers[id].key] = headers[id].value
      })
      headers = headersObject
      // If the request has a body, we want to ensure Content-Length and
      // Content-Type are sent.
      let requestBody
      if (this.hasRequestBody) {
        requestBody = this.rawInput ? this.rawParams : this.rawRequestBody
        Object.assign(headers, {
          //'Content-Length': requestBody.length,
          "Content-Type": `${this.contentType}; charset=utf-8`,
        })
      }
      requestBody = requestBody ? requestBody.toString() : null
      if (this.files.length !== 0) {
        const formData = new FormData()
        for (let i = 0; i < this.files.length; i++) {
          let file = this.files[i]
          formData.append(i, file)
        }
        formData.append("data", requestBody)
        requestBody = formData
      }
      // If the request uses a token for auth, we want to make sure it's sent here.
      if (this.auth === "Bearer Token" || this.auth === "OAuth 2.0")
        headers["Authorization"] = `Bearer ${this.bearerToken}`
      headers = Object.assign(
        // Clone the app headers object first, we don't want to
        // mutate it with the request headers added by default.
        Object.assign({}, this.headers)
        // We make our temporary headers object the source so
        // that you can override the added headers if you
        // specify them.
        // headers
      )
      Object.keys(headers).forEach(id => {
        headersObject[headers[id].key] = headers[id].value
      })
      headers = headersObject
      try {
        const startTime = Date.now()
        const payload = await this.makeRequest(
          auth,
          headers,
          requestBody,
          this.showPreRequestScript && this.preRequestScript
        )
        const duration = Date.now() - startTime
        this.$toast.info(this.$t("finished_in", { duration }), {
          icon: "done",
        })
        ;(() => {
          const status = (this.response.status = payload.status)
          const headers = (this.response.headers = payload.headers)
          // We don't need to bother parsing JSON, axios already handles it for us!
          const body = (this.response.body = payload.data)
          const date = new Date().toLocaleDateString()
          const time = new Date().toLocaleTimeString()
          // Addition of an entry to the history component.
          const entry = {
            label: this.requestName,
            status,
            date,
            time,
            method: this.method,
            url: this.url,
            path: this.path,
            usesScripts: Boolean(this.preRequestScript),
            preRequestScript: this.preRequestScript,
            duration,
            star: false,
          }
          this.$store.commit("postwoman/addHistory", entry)
          //this.$refs.historyComponent.addEntry(entry)
          if (fb.currentUser !== null) {
            if (fb.currentSettings[2].value) {
              fb.writeHistory(entry)
            }
          }
        })()
        // tests
        const syntheticResponse = {
          status: this.response.status,
          body: this.response.body,
          headers: this.response.headers,
        }
        const { testResults } = runTestScriptWithVariables(this.testScript, {
          response: syntheticResponse,
        })
        this.testReports = testResults
      } catch (error) {
        console.error(error)
        if (error.response) {
          this.response.headers = error.response.headers
          this.response.status = error.response.status
          this.response.body = error.response.data
          // Addition of an entry to the history component.
          const entry = {
            label: this.requestName,
            status: this.response.status,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            method: this.method,
            url: this.url,
            path: this.path,
            usesScripts: Boolean(this.preRequestScript),
            preRequestScript: this.preRequestScript,
          }
          this.$store.commit("postwoman/addHistory", entry)
          //this.$refs.historyComponent.addEntry(entry)
          if (fb.currentUser !== null) {
            if (fb.currentSettings[2].value) {
              fb.writeHistory(entry)
            }
          }
          return
        } else {
          this.response.status = error.message
          this.response.body = `${error}. ${this.$t("check_console_details")}`
          this.$toast.error(`${error} ${this.$t("f12_details")}`, {
            icon: "error",
          })
          if (!this.$store.state.postwoman.settings.PROXY_ENABLED) {
            this.$toast.info(this.$t("enable_proxy"), {
              icon: "help",
              duration: 8000,
              action: {
                text: this.$t("yes"),
                onClick: (e, toastObject) => {
                  this.$router.push({ path: "/settings" })
                },
              },
            })
          }
        }
      }
    },
    getQueryStringFromPath() {
      let queryString
      const pathParsed = url.parse(this.path)
      return (queryString = pathParsed.query ? pathParsed.query : "")
    },
    queryStringToArray(queryString) {
      const queryParsed = querystring.parse(queryString)
      return Object.keys(queryParsed).map(key => ({
        key,
        value: queryParsed[key],
      }))
    },
    pathInputHandler() {
      const queryString = this.getQueryStringFromPath()
      const params = this.queryStringToArray(queryString)
      this.paramsWatchEnabled = false
      this.params = params
    },
    addRequestHeader() {
      this.$store.commit("addHeaders", {
        key: "",
        value: "",
      })
      return false
    },
    removeRequestHeader(index) {
      console.log("idx", index)
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldHeaders = this.headers.slice()
      this.$store.commit("removeHeaders", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.headers = oldHeaders
            toastObject.remove()
          },
        },
      })
    },
    addRequestParam() {
      this.$store.commit("addParams", { key: "", value: "" })
      return false
    },
    removeRequestParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldParams = this.params.slice()
      this.$store.commit("removeParams", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.params = oldParams
            toastObject.remove()
          },
        },
      })
    },
    addRequestBodyParam() {
      this.$store.commit("addBodyParams", { key: "", value: "" })
      return false
    },
    removeRequestBodyParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldBodyParams = this.bodyParams.slice()
      this.$store.commit("removeBodyParams", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.bodyParams = oldBodyParams
            toastObject.remove()
          },
        },
      })
    },
    copyRequestCode() {
      this.$refs.copyRequestCode.innerHTML = this.doneButton
      this.$toast.success(this.$t("copied_to_clipboard"), {
        icon: "done",
      })
      this.$refs.generatedCode.select()
      document.execCommand("copy")
      setTimeout(() => (this.$refs.copyRequestCode.innerHTML = this.copyButton), 1000)
    },
    ToggleExpandResponse() {
      this.expandResponse = !this.expandResponse
      this.responseBodyMaxLines = this.responseBodyMaxLines == Infinity ? 16 : Infinity
    },
    setRouteQueryState() {
      const flat = key => (this[key] !== "" ? `${key}=${this[key]}&` : "")
      const deep = key => {
        const haveItems = [...this[key]].length
        if (haveItems && this[key]["value"] !== "") {
          return `${key}=${JSON.stringify(this[key])}&`
        }
        return ""
      }
      let flats = [
        "method",
        "url",
        "path",
        !this.urlExcludes.auth ? "auth" : null,
        !this.urlExcludes.httpUser ? "httpUser" : null,
        !this.urlExcludes.httpPassword ? "httpPassword" : null,
        !this.urlExcludes.bearerToken ? "bearerToken" : null,
        "contentType",
      ]
        .filter(item => item !== null)
        .map(item => flat(item))
      const deeps = ["headers", "params"].map(item => deep(item))
      const bodyParams = this.rawInput ? [flat("rawParams")] : [deep("bodyParams")]
      // history.replaceState(
      //   window.location.href,
      //   "",
      //   `/?${encodeURI(
      //     flats
      //       .concat(deeps, bodyParams)
      //       .join("")
      //       .slice(0, -1)
      //   )}`
      // )
    },
    setRouteQueries(queries) {
      if (typeof queries !== "object") throw new Error("Route query parameters must be a Object")
      for (const key in queries) {
        if (["headers", "params", "bodyParams"].includes(key))
          this[key] = JSON.parse(decodeURI(queries[key]))
        if (key === "rawParams") {
          this.rawInput = true
          this.rawParams = queries["rawParams"]
        } else if (typeof this[key] === "string") {
          this[key] = queries[key]
        }
      }
    },
    // observeRequestButton() {
    //   const requestElement = this.$refs.request.$el
    //   const sendButtonElement = this.$refs.sendButton
    //   const observer = new IntersectionObserver(
    //     (entries, observer) => {
    //       entries.forEach(({ isIntersecting }) => {
    //         if (isIntersecting) sendButtonElement.classList.remove("show")
    //         // The button should float when it is no longer visible on screen.
    //         // This is done by adding the show class to the button.
    //         else sendButtonElement.classList.add("show")
    //       })
    //     },
    //     {
    //       rootMargin: "0px",
    //       threshold: [0],
    //     }
    //   )
    //   observer.observe(requestElement)
    // },
    handleImport() {
      const { value: text } = document.getElementById("import-text")
      try {
        const parsedCurl = parseCurlCommand(text)
        const { origin, pathname } = new URL(parsedCurl.url.replace(/"/g, "").replace(/'/g, ""))
        this.url = origin
        this.path = pathname
        this.headers = []
        if (parsedCurl.headers) {
          for (const key of Object.keys(parsedCurl.headers)) {
            this.$store.commit("addHeaders", {
              key,
              value: parsedCurl.headers[key],
            })
          }
        }
        this.method = parsedCurl.method.toUpperCase()
        if (parsedCurl["data"]) {
          this.rawInput = true
          this.rawParams = parsedCurl["data"]
        }
        this.showModal = false
      } catch (error) {
        this.showModal = false
        this.$toast.error(this.$t("curl_invalid_format"), {
          icon: "error",
        })
      }
    },
    clearContent(name, { target }) {
      switch (name) {
        case "auth":
          this.auth = "None"
          this.httpUser = ""
          this.httpPassword = ""
          this.bearerToken = ""
          this.showTokenRequest = false
          this.tokens = []
          this.tokenReqs = []
          break
        case "headers":
          this.headers = []
          break
        case "parameters":
          this.params = []
          break
        case "access_token":
          this.accessTokenName = ""
          this.oidcDiscoveryUrl = ""
          this.authUrl = ""
          this.accessTokenUrl = ""
          this.clientId = ""
          this.scope = ""
          break
        case "tokens":
          this.tokens = []
          break
        case "tokenReqs":
          this.tokenReqs = []
        case "tests":
          this.testReports = null
          break
        default:
          this.showTokenRequest = false
          this.tokens = []
          this.tokenReqs = []
          this.accessTokenName = ""
          this.oidcDiscoveryUrl = ""
          this.authUrl = ""
          this.accessTokenUrl = ""
          this.clientId = ""
          this.scope = ""
          this.files = []
      }
      target.innerHTML = this.doneButton
      this.$toast.info(this.$t("cleared"), {
        icon: "clear_all",
      })
      setTimeout(() => (target.innerHTML = '<i class="material-icons">clear_all</i>'), 1000)
    },
    setExclude(excludedField, excluded) {
      if (excludedField === "auth") {
        this.urlExcludes.auth = excluded
        this.urlExcludes.httpUser = excluded
        this.urlExcludes.httpPassword = excluded
        this.urlExcludes.bearerToken = excluded
      } else {
        this.urlExcludes[excludedField] = excluded
      }
      this.setRouteQueryState()
    },
    uploadAttachment() {
      this.filenames = ""
      this.files = this.$refs.attachment.files
      if (this.files.length !== 0) {
        for (let file of this.files) {
          this.filenames = `${this.filenames}<br/>${file.name}`
        }
        this.$toast.info(this.$t("file_imported"), {
          icon: "attach_file",
        })
      } else {
        this.$toast.error(this.$t("choose_file"), {
          icon: "attach_file",
        })
      }
    },
    uploadPayload() {
      this.rawInput = true
      const file = this.$refs.payload.files[0]
      if (file !== undefined && file !== null) {
        const reader = new FileReader()
        reader.onload = ({ target }) => {
          this.rawParams = target.result
        }
        reader.readAsText(file)
        this.$toast.info(this.$t("file_imported"), {
          icon: "attach_file",
        })
      } else {
        this.$toast.error(this.$t("choose_file"), {
          icon: "attach_file",
        })
      }
    },
    async handleAccessTokenRequest() {
      if (this.oidcDiscoveryUrl === "" && (this.authUrl === "" || this.accessTokenUrl === "")) {
        this.$toast.error(this.$t("complete_config_urls"), {
          icon: "error",
        })
        return
      }
      try {
        const tokenReqParams = {
          grantType: "code",
          oidcDiscoveryUrl: this.oidcDiscoveryUrl,
          authUrl: this.authUrl,
          accessTokenUrl: this.accessTokenUrl,
          clientId: this.clientId,
          scope: this.scope,
        }
        await tokenRequest(tokenReqParams)
      } catch (e) {
        this.$toast.error(e, {
          icon: "code",
        })
      }
    },
    async oauthRedirectReq() {
      const tokenInfo = await oauthRedirect()
      if (tokenInfo.hasOwnProperty("access_token")) {
        this.bearerToken = tokenInfo.access_token
        this.addOAuthToken({
          name: this.accessTokenName,
          value: tokenInfo.access_token,
        })
      }
    },
    addOAuthToken({ name, value }) {
      this.$store.commit("addOAuthToken", {
        name,
        value,
      })
      return false
    },
    removeOAuthToken(index) {
      const oldTokens = this.tokens.slice()
      this.$store.commit("removeOAuthToken", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.tokens = oldTokens
            toastObject.remove()
          },
        },
      })
    },
    useOAuthToken(value) {
      this.bearerToken = value
      this.showTokenList = false
    },
    addOAuthTokenReq() {
      try {
        const name = this.tokenReqName
        const details = JSON.parse(this.tokenReqDetails)
        this.$store.commit("addOAuthTokenReq", {
          name,
          details,
        })
        this.$toast.info(this.$t("token_request_saved"))
        this.showTokenRequestList = false
      } catch (e) {
        this.$toast.error(e, {
          icon: "code",
        })
      }
    },
    removeOAuthTokenReq(index) {
      const oldTokenReqs = this.tokenReqs.slice()
      const targetReqIndex = this.tokenReqs.findIndex(({ name }) => name === this.tokenReqName)
      if (targetReqIndex < 0) return
      this.$store.commit("removeOAuthTokenReq", targetReqIndex)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.tokenReqs = oldTokenReqs
            toastObject.remove()
          },
        },
      })
    },
    tokenReqChange({ target }) {
      const { details, name } = this.tokenReqs.find(({ name }) => name === target.value)
      const { oidcDiscoveryUrl, authUrl, accessTokenUrl, clientId, scope } = details
      this.tokenReqName = name
      this.oidcDiscoveryUrl = oidcDiscoveryUrl
      this.authUrl = authUrl
      this.accessTokenUrl = accessTokenUrl
      this.clientId = clientId
      this.scope = scope
    },
    keyListener(e) {
      if (e.key === "g" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.sendRequest()
      } else if (e.key === "j" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.$refs.clearAll.click()
      } else if (e.key === "Escape") {
        e.preventDefault()
        this.showModal = this.showTokenList = this.showTokenRequestList = false
        this.isHidden = true
      }
    },
  },
  async mounted() {
    // this.observeRequestButton()
    await this.oauthRedirectReq()
  },
  created() {
    document.addEventListener("keydown", this.keyListener)
    this.urlExcludes = this.$store.state.postwoman.settings.URL_EXCLUDES || {
      // Exclude authentication by default for security reasons.
      auth: true,
      httpUser: true,
      httpPassword: true,
      bearerToken: true,
    }
    if (Object.keys(this.$route.query).length) this.setRouteQueries(this.$route.query)
    this.$watch(
      vm => [
        vm.label,
        vm.method,
        vm.url,
        vm.auth,
        vm.path,
        vm.httpUser,
        vm.httpPassword,
        vm.bearerToken,
        vm.headers,
        vm.params,
        vm.bodyParams,
        vm.contentType,
        vm.rawParams,
      ],
      val => {
        this.setRouteQueryState()
      }
    )
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyListener)
  },
}
</script>
