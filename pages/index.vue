<template>
  <div class="page">
    <div class="content v-layout v-gutter">
      <request-input
        :request="currentRequest"
        @send="sendRequest()"
        @clear="({ target, event }) => clearContent(target, event)"
      >
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
            <query-params @clear_all="clearContent('parameters', $event)" />
          </v-tab-item>
          <v-tab-item>
            <authentication @clear_all="clearContent('auth', $event)" />
          </v-tab-item>
          <v-tab-item>
            <headers @clear_all="clearContent('headers', $event)" />
          </v-tab-item>
          <v-tab-item>
            <request-body v-if="['POST', 'PUT', 'PATCH'].includes(currentRequest.method)" />
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
    </div>
  </div>
</template>

<script>
import section from "../components/layout/section"
import url from "url"
import querystring from "querystring"
import textareaAutoHeight from "../directives/textareaAutoHeight"
import runTestScriptWithVariables from "../functions/postwomanTesting"
import AceEditor from "../components/ui/ace-editor"
import { sendNetworkRequest } from "../functions/network"
import { fb } from "../functions/fb"
import { findIndex } from "lodash"
import { PWRequest } from "../functions/request"

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
      showModalEditEnvironment: false,
      showPreRequestScript: false,
      testsEnabled: false,
      testScript: "// pw.expect('variable').toBe('value');",
      preRequestScript: "// pw.env.set('variable', 'value');",
      testReports: null,
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
      }
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
    currentRequest() {
      return this.$store.state.request
    },
    requestName() {
      return this.label
    },
    statusCategory() {
      return findStatusGroup(this.response.status)
    },
    pathName() {
      return this.path.match(/^([^?]*)\??/)[1]
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

      try {
        let requestObj = new PWRequest(this.currentRequest)
        requestObj.setEnvironment(this.$data.selectedEnvironment)
        const startTime = Date.now()
        const payload = await requestObj.send(this.$store)
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
            body,
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
            body: this.response.body,
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
      // this.setRouteQueryState()
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
    keyListener(e) {
      if (e.key === "g" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.sendRequest()
      } else if (e.key === "j" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.$refs.clearAll.click()
      } else if (e.key === "Escape") {
        e.preventDefault()
        this.showTokenList = this.showTokenRequestList = false
        this.isHidden = true
      }
    },
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
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyListener)
  },
}
</script>
