<template>
  <div class="page">
    <div class="content">
      <h2 v-if="spec">{{ spec.info.title }}</h2>
      &nbsp;&nbsp;
      <nuxt-link v-if="$route.params.id" :to="`/fork/${$route.params.id}`">
        <button>{{ $t("fork") }}</button>
      </nuxt-link>
    </div>
    <div class="content">
      <div class="page-columns inner-left">
        <pw-section class="blue" :label="$t('request')" ref="request">
          <div class="blue">
            <label for="label">{{ $t("label") }}</label>
            <input
              id="label"
              name="label"
              type="text"
              readonly
              v-model="label"
              :placeholder="$t('required')"
            />
          </div>
          <ul>
            <div>
              <li>
                <label for="method">{{ $t("method") }}</label>
                <span class="select-wrapper">
                  <v-popover>
                    <input
                      id="method"
                      class="method"
                      v-if="!customMethod"
                      v-model="method"
                      readonly
                    />
                    <input v-else v-model="method" placeholder="CUSTOM" />
                  </v-popover>
                </span>
              </li>
            </div>
            <li>
              <label for="url">{{ $t("url") }}</label>
              <small>{{ basePath }}</small>
              <input
                :class="{ error: !isValidURL }"
                id="url"
                name="url"
                type="url"
                readonly
                v-model="$data._uri"
                spellcheck="false"
              />
            </li>
          </ul>
          <div class="blue" label="Request Body" v-if="['POST', 'PUT', 'PATCH'].includes(method)">
            <ul>
              <li>
                <label for="contentType">{{ $t("content_type") }}</label>
                <input id="contentType" name="contentType" readonly v-model="contentType" />
              </li>
            </ul>
            <ul>
              <li>
                <div class="flex-wrap">
                  <span>
                    <pw-toggle :on="rawInput" @change="rawInput = $event">
                      {{ $t("raw_input") }}
                    </pw-toggle>
                  </span>
                </div>
              </li>
            </ul>
            <div v-if="!rawInput">
              <ul>
                <li>
                  <label for="reqParamList">{{ $t("parameter_list") }}</label>
                  <textarea
                    id="reqParamList"
                    readonly
                    v-textarea-auto-height="rawRequestBody"
                    v-model="rawRequestBody"
                    :placeholder="$t('add_one_parameter')"
                    rows="1"
                  ></textarea>
                </li>
              </ul>
              <ul v-for="(param, index) in bodyParams" :key="index">
                <li>
                  <input
                    :placeholder="'key ' + (index + 1)"
                    :name="'bparam' + index"
                    :value="param.key"
                    readonly
                    autofocus
                  />
                </li>
                <li>
                  <input
                    :placeholder="'value ' + (index + 1)"
                    :id="'bvalue' + index"
                    :name="'bvalue' + index"
                    :value="param.value"
                    readonly
                  />
                </li>
              </ul>
            </div>
            <div v-else>
              <ul>
                <li>
                  <label for="rawBody">{{ $t("raw_request_body") }}</label>
                  <Editor
                    v-model="rawParams"
                    :lang="rawInputEditorLang"
                    :options="{
                      readOnly: true,
                      maxLines: '16',
                      minLines: '8',
                      fontSize: '16px',
                      autoScrollEditorIntoView: true,
                      showPrintMargin: false,
                      useWorker: false,
                    }"
                  />
                </li>
              </ul>
            </div>
          </div>
          <div class="flex-wrap">
            <span>
              <button
                class="icon"
                id="code"
                @click="isHidden = !isHidden"
                :disabled="!isValidURL"
                v-tooltip.bottom="{
                  content: isHidden ? $t('show_code') : $t('hide_code'),
                }"
              >
                <i class="material-icons">code</i>
              </button>
            </span>
          </div>
        </pw-section>

        <pw-section v-if="testsEnabled" class="orange" label="Tests" ref="postRequestTests">
          <ul>
            <li>
              <div class="flex-wrap">
                <label for="generatedCode">{{ $t("javascript_code") }}</label>
                <div>
                  <a
                    href="https://github.com/liyasthomas/postwoman/wiki/Post-Requests-Tests"
                    target="_blank"
                    rel="noopener"
                  >
                    <button class="icon" v-tooltip="$t('wiki')">
                      <i class="material-icons">help</i>
                    </button>
                  </a>
                </div>
              </div>
              <Editor
                v-model="testScript"
                :lang="'javascript'"
                :options="{
                  readOnly: true,
                  maxLines: '16',
                  minLines: '8',
                  fontSize: '16px',
                  autoScrollEditorIntoView: true,
                  showPrintMargin: false,
                  useWorker: false,
                }"
              />
            </li>
          </ul>
        </pw-section>

        <section id="options">
          <tabs>
            <tab :id="'authentication'" :label="$t('authentication')" :selected="true">
              <pw-section class="cyan" :label="$t('authentication')" ref="authentication">
                <ul>
                  <li>
                    <div class="flex-wrap">
                      <label for="auth">{{ $t("authentication") }}</label>
                    </div>
                    <span class="select-wrapper">
                      <input :value="auth" readonly />
                    </span>
                  </li>
                </ul>
                <ul v-if="auth === 'Basic Auth'">
                  <li>
                    <input readonly placeholder="User" name="http_basic_user" v-model="httpUser" />
                  </li>
                  <li>
                    <input
                      placeholder="Password"
                      name="http_basic_passwd"
                      :type="passwordFieldType"
                      v-model="httpPassword"
                      readonly
                    />
                  </li>
                  <div>
                    <li>
                      <button
                        class="icon"
                        id="switchVisibility"
                        ref="switchVisibility"
                        @click="switchVisibility"
                      >
                        <i class="material-icons" v-if="passwordFieldType === 'text'">visibility</i>
                        <i class="material-icons" v-if="passwordFieldType !== 'text'"
                          >visibility_off</i
                        >
                      </button>
                    </li>
                  </div>
                </ul>
                <ul v-if="auth === 'Bearer Token' || auth === 'OAuth 2.0'">
                  <li>
                    <div class="flex-wrap">
                      <input
                        placeholder="Token"
                        name="bearer_token"
                        readonly
                        v-model="bearerToken"
                      />
                    </div>
                  </li>
                </ul>
              </pw-section>
              <pw-section
                v-if="showTokenRequest"
                class="red"
                label="Access Token Request"
                ref="accessTokenRequest"
              >
                <ul>
                  <li>
                    <div class="flex-wrap">
                      <label for="token-name">{{ $t("token_name") }}</label>
                      <div>
                        <button
                          class="icon"
                          @click="showTokenRequestList = true"
                          v-tooltip.bottom="$t('manage_token_req')"
                        >
                          <i class="material-icons">library_add</i>
                        </button>
                        <button
                          class="icon"
                          @click="clearContent('access_token', $event)"
                          v-tooltip.bottom="$t('clear')"
                        >
                          <i class="material-icons">clear_all</i>
                        </button>
                        <button
                          class="icon"
                          @click="showTokenRequest = false"
                          v-tooltip.bottom="$t('close')"
                        >
                          <i class="material-icons">close</i>
                        </button>
                      </div>
                    </div>
                    <input
                      id="token-name"
                      :placeholder="$t('optional')"
                      name="token_name"
                      v-model="accessTokenName"
                      type="text"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <label for="oidc-discovery-url">
                      {{ $t("oidc_discovery_url") }}
                    </label>
                    <input
                      :disabled="this.authUrl !== '' || this.accessTokenUrl !== ''"
                      id="oidc-discovery-url"
                      name="oidc_discovery_url"
                      type="url"
                      v-model="oidcDiscoveryUrl"
                      placeholder="https://example.com/.well-known/openid-configuration"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <label for="auth-url">{{ $t("auth_url") }}</label>
                    <input
                      :disabled="this.oidcDiscoveryUrl !== ''"
                      id="auth-url"
                      name="auth_url"
                      type="url"
                      v-model="authUrl"
                      placeholder="https://example.com/login/oauth/authorize"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <label for="access-token-url">
                      {{ $t("access_token_url") }}
                    </label>
                    <input
                      :disabled="this.oidcDiscoveryUrl !== ''"
                      id="access-token-url"
                      name="access_token_url"
                      type="url"
                      v-model="accessTokenUrl"
                      placeholder="https://example.com/login/oauth/access_token"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <label for="client-id">{{ $t("client_id") }}</label>
                    <input
                      id="client-id"
                      name="client_id"
                      type="text"
                      v-model="clientId"
                      placeholder="Client ID"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <label for="scope">{{ $t("scope") }}</label>
                    <input
                      id="scope"
                      name="scope"
                      type="text"
                      v-model="scope"
                      placeholder="e.g. read:org"
                    />
                  </li>
                </ul>
                <ul>
                  <li>
                    <button class="icon" @click="handleAccessTokenRequest">
                      <i class="material-icons">vpn_key</i>
                      <span>{{ $t("request_token") }}</span>
                    </button>
                  </li>
                </ul>
              </pw-section>
            </tab>

            <tab :id="'headers'" :label="$t('headers')">
              <pw-section class="orange" label="Headers" ref="headers">
                <ul>
                  <li>
                    <div class="flex-wrap">
                      <label for="headerList">{{ $t("header_list") }}</label>
                    </div>
                    <textarea
                      id="headerList"
                      readonly
                      v-textarea-auto-height="headerString"
                      v-model="headerString"
                      :placeholder="$t('add_one_header')"
                      rows="1"
                    ></textarea>
                  </li>
                </ul>
                <ul v-for="(header, index) in headers" :key="index">
                  <li>
                    <autocomplete
                      :placeholder="$t('header_count', { count: index + 1 })"
                      :source="commonHeaders"
                      :spellcheck="false"
                      :value="header.key"
                      readonly
                    />
                  </li>
                  <li>
                    <input
                      :placeholder="$t('value_count', { count: index + 1 })"
                      :name="'value' + index"
                      :value="header.value"
                      readonly
                    />
                  </li>
                </ul>
              </pw-section>
            </tab>

            <tab :id="'params'" :label="$t('parameters')">
              <pw-section class="pink" label="Parameters" ref="parameters">
                <ul>
                  <li>
                    <div class="flex-wrap">
                      <label for="paramList">{{ $t("parameter_list") }}</label>
                    </div>
                    <textarea
                      id="paramList"
                      readonly
                      v-textarea-auto-height="queryString"
                      v-model="queryString"
                      :placeholder="$t('add_one_parameter')"
                      rows="1"
                    ></textarea>
                  </li>
                </ul>
                <ul v-for="(param, index) in params" :key="index">
                  <li>
                    <input
                      :placeholder="$t('parameter_count', { count: index + 1 })"
                      :name="'param' + index"
                      :value="param.key"
                      readonly
                    />
                  </li>
                  <li>
                    <input
                      :placeholder="$t('value_count', { count: index + 1 })"
                      :name="'value' + index"
                      :value="param.value"
                      readonly
                    />
                  </li>
                </ul>
              </pw-section>
            </tab>
          </tabs>
        </section>

        <pw-section class="purple" id="response" ref="saveresponse" :label="$t('response')">
          <ul>
            <li>
              <label for="responseLabel">Response Label</label>
              <input id="responseLabel" :value="response.label" readonly name="responseLabel" />
            </li>
          </ul>
          <ul>
            <li>
              <label for="status">{{ $t("status") }}</label>
              <input
                :class="statusCategory ? statusCategory.className : ''"
                :value="response.status"
                ref="status"
                id="status"
                name="status"
                type="text"
                readonly
              />
            </li>
          </ul>
          <div v-if="response.headers.length">
            <ul v-for="(value, key) in response.headers" :key="key">
              <li>
                <label :for="key">{{ key }}</label>
                <input :id="key" :value="value" :name="key" readonly />
              </li>
            </ul>
          </div>
          <div v-else>
            <ul>
              <li>
                <label for="content-type">content-type</label>
                <select disabled>
                  <option value="json" :selected="responseBodyType == 'json'">Json</option>
                  <option value="text" :selected="responseBodyType == 'text'">Text</option>
                  <option value="html" :selected="responseBodyType == 'html'">Html</option>
                </select>
                <!-- <input v-model="responseType" name="content-type" /> -->
              </li>
            </ul>
          </div>
          <ul>
            <li>
              <div id="response-details-wrapper">
                <Editor
                  v-model="response.body"
                  :lang="responseBodyType"
                  :options="{
                    maxLines: responseBodyMaxLines,
                    minLines: '16',
                    fontSize: '16px',
                    autoScrollEditorIntoView: true,
                    readOnly: false,
                    showPrintMargin: false,
                    useWorker: false,
                    readOnly: true,
                  }"
                />
                <iframe
                  :class="{ hidden: !previewEnabled }"
                  class="covers-response"
                  ref="previewFrame"
                  src="about:blank"
                ></iframe>
              </div>
              <div class="align-left">
                <button
                  v-if="response.body && responseType === 'text/html'"
                  class="icon"
                  @click.prevent="togglePreview"
                >
                  <i class="material-icons">
                    {{ !previewEnabled ? "visibility" : "visibility_off" }}
                  </i>
                  <span>
                    {{ previewEnabled ? $t("hide_preview") : $t("preview_html") }}
                  </span>
                </button>
              </div>
            </li>
          </ul>
        </pw-section>
      </div>

      <aside v-if="activeSidebar" class="sticky-inner inner-right">
        <section>
          <tabs>
            <tab :id="'requests'" :icon="'watch_later'" :label="$t('requests')" :selected="true">
              <requests readonly :specid="$route.params.id" ref="responseComponent" />
            </tab>

            <tab :id="'env'" :icon="'style'" :label="$t('environments')">
              <environments @use-environment="useSelectedEnvironment($event)" />
            </tab>

            <tab :id="'collections'" :icon="'folder_special'" :label="$t('collections')">
              <collections />
            </tab>

            <tab :id="'notes'" :icon="'note'" :label="$t('notes')">
              <pw-section class="pink" :label="$t('notes')" ref="sync">
                <div v-if="isLoggedIn">
                  <inputform />
                  <notes />
                </div>
                <div v-else>
                  <ul>
                    <li>
                      <label>{{ $t("login_first") }}</label>
                      <p>
                        <login />
                      </p>
                    </li>
                  </ul>
                </div>
              </pw-section>
            </tab>
          </tabs>
        </section>
      </aside>

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
                readonly
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
                  $store.commit('design/setOAuthTokenName', {
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
import section from "../../components/layout/section"
import url from "url"
import querystring from "querystring"
import { commonHeaders } from "../../functions/headers"
import textareaAutoHeight from "../../directives/textareaAutoHeight"
import parseCurlCommand from "../../assets/js/curlparser.js"
import getEnvironmentVariablesFromScript from "../../functions/preRequest"
import runTestScriptWithVariables from "../../functions/postwomanTesting"
import parseTemplateString from "../../functions/templating"
import AceEditor from "../../components/ui/ace-editor"
import { tokenRequest, oauthRedirect } from "../../assets/js/oauth"
import { sendNetworkRequest } from "../../functions/network"
import { fb } from "../../functions/fb"
import { getEditorLangForMimeType } from "~/functions/editorutils"
import { cloneDeep } from "lodash"
const statusCategories = [
  {
    name: "informational",
    statusCodeRegex: new RegExp(/[1][0-9]+/),
    className: "info-response",
  },
  {
    name: "successful",
    statusCodeRegex: new RegExp(/[2][0-9]+/),
    className: "success-response",
  },
  {
    name: "redirection",
    statusCodeRegex: new RegExp(/[3][0-9]+/),
    className: "redir-response",
  },
  {
    name: "client error",
    statusCodeRegex: new RegExp(/[4][0-9]+/),
    className: "cl-error-response",
  },
  {
    name: "server error",
    statusCodeRegex: new RegExp(/[5][0-9]+/),
    className: "sv-error-response",
  },
  {
    // this object is a catch-all for when no other objects match and should always be last
    name: "unknown",
    statusCodeRegex: new RegExp(/.*/),
    className: "missing-data-response",
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
    "pw-toggle": () => import("../../components/ui/toggle"),
    "pw-modal": () => import("../../components/ui/modal"),
    autocomplete: () => import("../../components/ui/autocomplete"),
    requests: () => import("../../components/requests"),
    collections: () => import("../../components/collections"),
    saveRequestAs: () => import("../../components/collections/saveRequestAs"),
    Editor: AceEditor,
    environments: () => import("../../components/design/environments"),
    inputform: () => import("../../components/firebase/inputform"),
    notes: () => import("../../components/firebase/feeds"),
    login: () => import("../../components/firebase/login"),
    tabs: () => import("../../components/ui/tabs"),
    tab: () => import("../../components/ui/tab"),
    saveRequestOpenapi: () => import("../../components/openapi/saveRequest"),
  },
  async asyncData({ params, app, store, $axios, $nuxt, error, redirect }) {
    if (params.hasOwnProperty("id")) {
      const { data } = await app.$api.getSpec(params.id)
      store.commit("browse/setSpec", data)
      console.log("specdata", data)
      return { spec: data }
    } else {
      error({ message: "Spec not found", statusCode: 404 })
    }
  },
  data() {
    return {
      requestCode: undefined,
      _uri: undefined,
      showModal: false,
      showOasModal: false,
      showPreRequestScript: false,
      testsEnabled: false,
      testScript: "// pw.expect('variable').toBe('value');",
      preRequestScript: "// pw.env.set('variable', 'value');",
      testReports: null,
      copyButton: '<i class="material-icons">file_copy</i>',
      downloadButton: '<i class="material-icons">get_app</i>',
      doneButton: '<i class="material-icons">done</i>',
      isHidden: true,
      response: {
        label: "",
        status: "",
        headers: { "content-type": "text/plain" },
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
      validContentTypes: [
        "application/json",
        "application/hal+json",
        "application/xml",
        "application/x-www-form-urlencoded",
        "text/html",
        "text/plain",
      ],
      commonHeaders,
      showRequestModal: false,
      editRequest: {},
      urlExcludes: {},
      responseBodyText: "",
      responseBodyType: "text",
      responseBodyMaxLines: 16,
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
    }
  },
  watch: {
    currentResponse(val) {
      if (val) {
        this.copyResponseObject(val)
      } else {
        this.response = {
          label: "",
          status: "",
          headers: { "content-type": "text/plain" },
          body: "",
        }
      }
    },
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
        this.$data._uri = path
      },
      deep: true,
    },
    selectedRequest(newValue, oldValue) {
      // @TODO: Convert all variables to single request variable
      if (!newValue) return
      console.log("j bhi", newValue, oldValue)
      //this.uri = newValue.url + newValue.path
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
    },
    editingRequest(newValue) {
      this.editRequest = newValue
      this.showRequestModal = true
    },
    method() {
      // this.$store.commit('design/setState', { 'value': ["POST", "PUT", "PATCH"].includes(this.method) ? 'application/json' : '', 'attribute': 'contentType' })
      this.contentType = ["POST", "PUT", "PATCH"].includes(this.method) ? "application/json" : ""
    },
  },
  computed: {
    basePath() {
      const server = this.spec.servers[0]
      return server && server.url
    },
    currentResponse() {
      return this.$store.state.design.response
    },
    isLoggedIn() {
      return this.$store.state.auth.loggedIn === true
    },
    uri() {
      return this.$store.state.design.request.uri
        ? this.$store.state.design.request.uri
        : this.url + this.path
    },
    url: {
      get() {
        return this.$store.state.design.request.url
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "url" })
      },
    },
    method: {
      get() {
        return this.$store.state.design.request.method
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "method" })
      },
    },
    path: {
      get() {
        return this.$store.state.design.request.path
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "path" })
      },
    },
    label: {
      get() {
        return this.$store.state.design.request.label
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "label" })
      },
    },
    auth: {
      get() {
        return this.$store.state.design.request.auth
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "auth" })
      },
    },
    httpUser: {
      get() {
        return this.$store.state.design.request.httpUser
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "httpUser" })
      },
    },
    httpPassword: {
      get() {
        return this.$store.state.design.request.httpPassword
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "httpPassword" })
      },
    },
    bearerToken: {
      get() {
        return this.$store.state.design.request.bearerToken
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "bearerToken" })
      },
    },
    tokens: {
      get() {
        return this.$store.state.design.oauth2.tokens
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "tokens" })
      },
    },
    tokenReqs: {
      get() {
        return this.$store.state.design.oauth2.tokenReqs
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "tokenReqs" })
      },
    },
    tokenReqSelect: {
      get() {
        return this.$store.state.design.oauth2.tokenReqSelect
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "tokenReqSelect" })
      },
    },
    tokenReqName: {
      get() {
        return this.$store.state.design.oauth2.tokenReqName
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "tokenReqName" })
      },
    },
    accessTokenName: {
      get() {
        return this.$store.state.design.oauth2.accessTokenName
      },
      set(value) {
        this.$store.commit("design/setOAuth2", {
          value,
          attribute: "accessTokenName",
        })
      },
    },
    oidcDiscoveryUrl: {
      get() {
        return this.$store.state.design.oauth2.oidcDiscoveryUrl
      },
      set(value) {
        this.$store.commit("design/setOAuth2", {
          value,
          attribute: "oidcDiscoveryUrl",
        })
      },
    },
    authUrl: {
      get() {
        return this.$store.state.design.oauth2.authUrl
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "authUrl" })
      },
    },
    accessTokenUrl: {
      get() {
        return this.$store.state.design.oauth2.accessTokenUrl
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "accessTokenUrl" })
      },
    },
    clientId: {
      get() {
        return this.$store.state.design.oauth2.clientId
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "clientId" })
      },
    },
    scope: {
      get() {
        return this.$store.state.design.oauth2.scope
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "scope" })
      },
    },
    state: {
      get() {
        return this.$store.state.design.oauth2.state
      },
      set(value) {
        this.$store.commit("design/setOAuth2", { value, attribute: "state" })
      },
    },
    headers: {
      get() {
        return this.$store.state.design.request.headers
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "headers" })
      },
    },
    params: {
      get() {
        return this.$store.state.design.request.params
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "params" })
      },
    },
    bodyParams: {
      get() {
        return this.$store.state.design.request.bodyParams
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "bodyParams" })
      },
    },
    rawParams: {
      get() {
        return this.$store.state.design.request.rawParams
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "rawParams" })
      },
    },
    rawInput: {
      get() {
        console.log("I am called1", this.$store.state.design.request.rawInput)
        return this.$store.state.design.request.rawInput
      },
      set(value) {
        console.log("I am called2", value)
        this.$store.commit("design/setState", { value, attribute: "rawInput" })
      },
    },
    rawInputEditorLang() {
      return getEditorLangForMimeType(this.contentType)
    },
    requestType: {
      get() {
        return this.$store.state.design.request.requestType
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "requestType" })
        this.requestCode = this.getRequestCode(value)
      },
    },
    contentType: {
      get() {
        return this.$store.state.design.request.contentType
      },
      set(value) {
        this.$store.commit("design/setState", { value, attribute: "contentType" })
      },
    },
    passwordFieldType: {
      get() {
        return this.$store.state.design.request.passwordFieldType
      },
      set(value) {
        this.$store.commit("design/setState", {
          value,
          attribute: "passwordFieldType",
        })
      },
    },
    selectedRequest() {
      return this.$store.state.design.selectedRequest
    },
    editingRequest() {
      return this.$store.state.postwoman.editingRequest
    },
    requestName() {
      return this.label
    },
    statusCategory() {
      return findStatusGroup(this.response.status)
    },
    isValidURL() {
      if (this.showPreRequestScript) {
        // we cannot determine if a URL is valid because the full string is not known ahead of time
        return true
      }
      const protocol = "^(https?:\\/\\/)?"
      const validIP = new RegExp(
        `${protocol}(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$`
      )
      const validHostname = new RegExp(
        `${protocol}(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9/])$`
      )
      return validIP.test(this.url) || validHostname.test(this.url)
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
    responseType: {
      get() {
        return (this.response.headers["content-type"] || "").split(";")[0].toLowerCase()
      },
      set(val) {
        this.response.headers["content-type"] = val
        this.responseBodyType = "json"
      },
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
    getRequestCode(value) {
      let requestType = value || this.requestType
      if (requestType === "JavaScript XHR") {
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
      } else if (requestType === "Fetch") {
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
      } else if (requestType === "cURL") {
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
    copyResponseObject(originalResponse) {
      let pp = cloneDeep(originalResponse)
      if (!pp || !pp.hasOwnProperty("status")) {
        return
      }
      this.response = {
        label: pp.label,
        status: pp.status,
        headers: Object.assign({}, { "content-type": "text/plain" }, pp.headers),
      }

      if (pp.headers.hasOwnProperty("content-type")) {
        switch (pp.headers["content-type"]) {
          case "application/json":
            this.response.body = JSON.stringify(pp.body, null, 2)
            this.responseBodyType = "json"
            break
          case "application/hal+json":
            this.response.body = JSON.stringify(pp.body, null, 2)
            this.responseBodyType = "json"
            break
          case "text/html":
            this.response.body = pp.body
            this.responseBodyType = "html"
            break
          case "text/plain":
            this.response.body = pp.body
            this.responseBodyType = "text"
            break
          default:
            this.response.body = pp.body
            this.responseBodyType = "text"
            break
        }
      }
    },
    getResponseContentType() {
      let contentType = "text/plain" //Default text
      switch (this.responseBodyType) {
        case "json":
          contentType = "application/json"
          break
        case "text":
          contentType = "text/plain"
          break
        case "html":
          contentType = "text/html"
          break
        default:
          contentType = "text/plain"
          break
      }
      return contentType
    },
    saveResponse() {
      if (!this.response.headers.hasOwnProperty("content-type")) {
        this.response.headers["content-type"] = this.getResponseContentType()
      }
      this.$data.response["date"] = new Date().toLocaleDateString()
      this.$data.response["time"] = new Date().toLocaleTimeString()
      this.$store.commit("design/addResponse", cloneDeep(this.$data.response))
    },
    // changeRepsonseContentType(event) {
    //   event.preventDefault()
    //   this.$data.response.headers["content-type"] = this.getResponseContentType()
    // },
    saveOpenapi() {
      this.$data.showOasModal = true
    },
    hideOpenapiModal() {
      this.$data.showOasModal = false
    },
    useSelectedEnvironment(environment) {
      let preRequestScriptString = ""
      for (let variable of environment.variables) {
        preRequestScriptString =
          preRequestScriptString + `pw.env.set('${variable.key}', '${variable.value}');\n`
      }
      this.preRequestScript = preRequestScriptString
      this.showPreRequestScript = true
    },
    checkCollections() {
      const checkCollectionAvailability =
        this.$store.state.postwoman.collections &&
        this.$store.state.postwoman.collections.length > 0
      return checkCollectionAvailability
    },
    scrollInto(view) {
      this.$refs[view].$el.scrollIntoView({
        behavior: "smooth",
      })
    },
    handleUseHistory({ label, method, url, path, usesScripts, preRequestScript }) {
      this.label = label
      this.method = method
      this.uri = url + path
      this.url = url
      this.path = path
      this.showPreRequestScript = usesScripts
      this.preRequestScript = preRequestScript
      if (this.settings.SCROLL_INTO_ENABLED) this.scrollInto("request")
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
      if (preRequestScript) {
        const environmentVariables = getEnvironmentVariablesFromScript(preRequestScript)
        requestOptions.url = parseTemplateString(requestOptions.url, environmentVariables)
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
    setUrlPath() {
      let value = this.basePath + this.$data._uri
      this.$store.commit("design/setState", { value, attribute: "uri" })
      let url
      if (this.preRequestScript && this.showPreRequestScript) {
        const environmentVariables = getEnvironmentVariablesFromScript(this.preRequestScript)
        url = parseTemplateString(value, environmentVariables)
      } else {
        url = value
      }
      try {
        url = new URL(url)
        this.url = url.origin
        this.path = url.pathname
      } catch (error) {
        console.log(error)
        let uriRegex = value.match(/^((http[s]?:\/\/)?(<<[^\/]+>>)?[^\/]*|)(\/?.*)$/)
        this.url = uriRegex[1]
        this.path = uriRegex[4]
      }
    },
    async sendRequest() {
      this.$toast.clear()

      // Set url path
      this.setUrlPath()

      if (!this.isValidURL) {
        this.$toast.error(this.$t("url_invalid_format"), {
          icon: "error",
        })
        return
      }

      //Need a valid openapi spec
      if (!this.spec) {
        this.$toast.error(this.$t("  invalid_spec"), {
          icon: "error",
        })
        return
      }

      //Need a valid label
      if (!this.label) {
        this.$toast.error(this.$t("url_invalid_label"), {
          icon: "error",
        })
        return
      }

      //Need a valid response for saving this request
      if (!this.response.status || !this.responseBodyType) {
        this.$toast.error(this.$t("invalid_response"), {
          icon: "error",
        })
        if (this.settings.SCROLL_INTO_ENABLED) this.scrollInto("saveresponse")
        return
      }

      if (this.settings.SCROLL_INTO_ENABLED) this.scrollInto("saveresponse")

      let request = {
        label: this.label,
        uri: this.url + this.path,
        url: this.url,
        path: this.path,
        method: this.method,
        auth: this.auth,
        httpUser: this.httpUser,
        httpPassword: this.httpPassword,
        passwordFieldType: this.passwordFieldType,
        bearerToken: this.bearerToken,
        headers: this.headers,
        params: this.params,
        bodyParams: this.bodyParams,
        rawParams: this.rawParams,
        rawInput: this.rawInput,
        contentType: this.contentType,
        requestType: this.requestType,
      }

      this.response.headers["content-type"] = this.getResponseContentType()
      this.$store
        .dispatch("design/addRequest", {
          specid: this.spec["x-internal-id"],
          request,
          response: this.response,
        })
        .then(
          res => {
            this.$toast.success(this.$t("request_saved"), {
              icon: "done",
            })
          },
          err => {
            console.error(err)
            this.$toast.error(this.$t("check_console_details"), {
              icon: "error",
            })
          }
        )
      return

      // Start showing the loading bar as soon as possible.
      // The nuxt axios module will hide it when the request is made.
      this.$nuxt.$loading.start()
      this.previewEnabled = false

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
          this.$store.commit("openapi/addResponse", Object.assign({}, this.response))
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
          this.$refs.historyComponent.addEntry(entry)
          if (fb.currentUser !== null) {
            if (fb.currentSettings[2].value) {
              fb.writeHistory(entry)
            }
          }
        })()
      } catch (error) {
        console.error(error)
        if (error.response) {
          this.response.headers = error.response.headers
          this.response.status = error.response.status
          this.response.body = error.response.data
          this.$store.commit("openapi/addResponse", Object.assign({}, this.response))
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
          this.$refs.historyComponent.addEntry(entry)
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
    },
    getQueryStringFromPath() {
      let queryString
      const pathParsed = url.parse(this.basePath + this.$data._uri || this.path)
      console.log("q", pathParsed, this.basePath + this.$data._uri)
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
      console.log("partam", params, queryString)
      this.paramsWatchEnabled = false
      this.params = params
    },
    addRequestHeader() {
      this.$store.commit("design/addHeaders", {
        key: "",
        value: "",
      })
      return false
    },
    removeRequestHeader(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldHeaders = this.headers.slice()
      this.$store.commit("design/removeHeaders", index)
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
      this.$store.commit("design/addParams", { key: "", value: "" })
      return false
    },
    removeRequestParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldParams = this.params.slice()
      this.$store.commit("design/removeParams", index)
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
      this.$store.commit("design/addBodyParams", { key: "", value: "" })
      return false
    },
    removeRequestBodyParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldBodyParams = this.bodyParams.slice()
      this.$store.commit("design/removeBodyParams", index)
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
    copyRequest() {
      if (navigator.share) {
        const time = new Date().toLocaleTimeString()
        const date = new Date().toLocaleDateString()
        navigator
          .share({
            title: "Postwoman",
            text: `Postwoman • API request builder at ${time} on ${date}`,
            url: window.location.href,
          })
          .then(() => {})
          .catch(console.error)
      } else {
        const dummy = document.createElement("input")
        document.body.appendChild(dummy)
        dummy.value = window.location.href
        dummy.select()
        document.execCommand("copy")
        document.body.removeChild(dummy)
        this.$refs.copyRequest.innerHTML = this.doneButton
        this.$toast.info(this.$t("copied_to_clipboard"), {
          icon: "done",
        })
        setTimeout(() => (this.$refs.copyRequest.innerHTML = this.copyButton), 1000)
      }
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
    copyResponse() {
      this.$refs.copyResponse.innerHTML = this.doneButton
      this.$toast.success(this.$t("copied_to_clipboard"), {
        icon: "done",
      })
      const aux = document.createElement("textarea")
      const copy =
        this.responseType === "application/json"
          ? JSON.stringify(this.response.body, null, 2)
          : this.response.body
      aux.innerText = copy
      document.body.appendChild(aux)
      aux.select()
      document.execCommand("copy")
      document.body.removeChild(aux)
      setTimeout(() => (this.$refs.copyResponse.innerHTML = this.copyButton), 1000)
    },
    downloadResponse() {
      const dataToWrite = JSON.stringify(this.response.body, null, 2)
      const file = new Blob([dataToWrite], { type: this.responseType })
      const a = document.createElement("a")
      const url = URL.createObjectURL(file)
      a.href = url
      a.download = `${this.url + this.path} [${this.method}] on ${Date()}`.replace(/\./g, "[dot]")
      document.body.appendChild(a)
      a.click()
      this.$refs.downloadResponse.innerHTML = this.doneButton
      this.$toast.success(this.$t("download_started"), {
        icon: "done",
      })
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        this.$refs.downloadResponse.innerHTML = this.downloadButton
      }, 1000)
    },
    togglePreview() {
      this.previewEnabled = !this.previewEnabled
      if (this.previewEnabled) {
        // If you want to add 'preview' support for other response types,
        // just add them here.
        if (this.responseType === "text/html") {
          // If the preview already has that URL loaded, let's not bother re-loading it all.
          if (this.$refs.previewFrame.getAttribute("data-previewing-url") === this.url) return
          // Use DOMParser to parse document HTML.
          const previewDocument = new DOMParser().parseFromString(
            this.response.body,
            this.responseType
          )
          // Inject <base href="..."> tag to head, to fix relative CSS/HTML paths.
          previewDocument.head.innerHTML =
            `<base href="${this.url}">` + previewDocument.head.innerHTML
          // Finally, set the iframe source to the resulting HTML.
          this.$refs.previewFrame.srcdoc = previewDocument.documentElement.outerHTML
          this.$refs.previewFrame.setAttribute("data-previewing-url", this.url)
        }
      }
    },
    setRouteQueryState() {
      //   const flat = key => (this[key] !== "" ? `${key}=${this[key]}&` : "")
      //   const deep = key => {
      //     const haveItems = [...this[key]].length
      //     if (haveItems && this[key]["value"] !== "") {
      //       return `${key}=${JSON.stringify(this[key])}&`
      //     }
      //     return ""
      //   }
      //   let flats = [
      //     "method",
      //     "url",
      //     "path",
      //     !this.urlExcludes.auth ? "auth" : null,
      //     !this.urlExcludes.httpUser ? "httpUser" : null,
      //     !this.urlExcludes.httpPassword ? "httpPassword" : null,
      //     !this.urlExcludes.bearerToken ? "bearerToken" : null,
      //     "contentType",
      //   ]
      //     .filter(item => item !== null)
      //     .map(item => flat(item))
      //   const deeps = ["headers", "params"].map(item => deep(item))
      //   const bodyParams = this.rawInput ? [flat("rawParams")] : [deep("bodyParams")]
      //   history.replaceState(
      //     window.location.href,
      //     "",
      //     `/?${encodeURI(
      //       flats
      //         .concat(deeps, bodyParams)
      //         .join("")
      //         .slice(0, -1)
      //     )}`
      //   )
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
            this.$store.commit("design/addHeaders", {
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
    switchVisibility() {
      this.passwordFieldType = this.passwordFieldType === "password" ? "text" : "password"
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
          this.method = "GET"
          this.url = "https://httpbin.org"
          this.path = "/get"
          this.uri = this.url + this.path
          this.label = ""
          this.auth = "None"
          this.httpUser = ""
          this.httpPassword = ""
          this.bearerToken = ""
          this.headers = []
          this.params = []
          this.bodyParams = []
          this.rawParams = ""
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
    saveRequest() {
      if (!this.checkCollections()) {
        this.$toast.error(this.$t("create_collection"), {
          icon: "error",
        })
        return
      }
      this.editRequest = {
        url: this.url,
        path: this.path,
        method: this.method,
        auth: this.auth,
        httpUser: this.httpUser,
        httpPassword: this.httpPassword,
        passwordFieldType: this.passwordFieldType,
        bearerToken: this.bearerToken,
        headers: this.headers,
        params: this.params,
        bodyParams: this.bodyParams,
        rawParams: this.rawParams,
        rawInput: this.rawInput,
        contentType: this.contentType,
        requestType: this.requestType,
      }
      if (this.selectedRequest.url) {
        this.editRequest = Object.assign({}, this.selectedRequest, this.editRequest)
      }
      this.showRequestModal = true
    },
    hideRequestModal() {
      this.showRequestModal = false
      this.editRequest = {}
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
      this.$store.commit("design/addOAuthToken", {
        name,
        value,
      })
      return false
    },
    removeOAuthToken(index) {
      const oldTokens = this.tokens.slice()
      this.$store.commit("design/removeOAuthToken", index)
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
        this.$store.commit("design/addOAuthTokenReq", {
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
      this.$store.commit("design/removeOAuthTokenReq", targetReqIndex)
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
  },
  async mounted() {
    this.$data._uri = this.path
    this.copyResponseObject(this.currentResponse)
    await this.oauthRedirectReq()
  },
  created() {
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
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
