import * as api from "../functions/api"
export const state = () => ({
  specid: undefined,
  responses: [],
  requests: [],
  response: undefined,
  request: {
    method: "GET",
    uri: "",
    url: "https://httpbin.org",
    path: "/get",
    label: "",
    auth: "None",
    httpUser: "",
    httpPassword: "",
    passwordFieldType: "password",
    bearerToken: "",
    headers: [],
    params: [],
    bodyParams: [],
    rawParams: "",
    rawInput: false,
    requestType: "",
    contentType: "",
  },
  oauth2: {
    tokens: [],
    tokenReqs: [],
    tokenReqSelect: "",
    tokenReqName: "",
    accessTokenName: "",
    oidcDiscoveryUrl: "",
    authUrl: "",
    accessTokenUrl: "",
    clientId: "",
    scope: "",
  },
})

export const mutations = {
  clearresponse(state) {
    state.responses = []
  },

  selectResponse(state, response) {
    state.response = api.parseResponseContentType(response)
  },

  deleteResponse(state, response) {
    state.responses.splice(state.responses.indexOf(entry), 1)
  },

  addResponse(state, response) {
    // Remove duplicate status code
    state.responses.forEach((item, index) => {
      if (item.status === response.status) {
        state.responses.splice(index, 1)
      }
    })
    let _response = api.parseResponseContentType(response)
    state.responses.push(_response)
  },

  //@TODO Not updating in realtime (on refresh works)
  starResponse(state, response) {
    const index = state.responses.indexOf(response)
    let new_response = state.responses[index]
    new_response.star = !new_response.star
    state.responses[index] = new_response
  },

  /**
   * Requests specific
   */
  setState({ request }, { attribute, value }) {
    request[attribute] = value
  },

  addRequest(state, { specid, request }) {
    state.requests.push(Object.assign({ specid: specid }, request))
  },

  addHeaders({ request }, value) {
    request.headers.push(value)
  },

  removeHeaders({ request }, index) {
    request.headers.splice(index, 1)
  },

  setKeyHeader({ request }, { index, value }) {
    request.headers[index].key = value
  },

  setValueHeader({ request }, { index, value }) {
    request.headers[index].value = value
  },

  addParams({ request }, value) {
    request.params.push(value)
  },

  removeParams({ request }, index) {
    request.params.splice(index, 1)
  },

  setKeyParams({ request }, { index, value }) {
    request.params[index].key = value
  },

  setValueParams({ request }, { index, value }) {
    request.params[index].value = value
  },

  addBodyParams({ request }, value) {
    request.bodyParams.push(value)
  },

  removeBodyParams({ request }, index) {
    request.bodyParams.splice(index, 1)
  },

  setKeyBodyParams({ request }, { index, value }) {
    request.bodyParams[index].key = value
  },

  setValueBodyParams({ request }, { index, value }) {
    request.bodyParams[index].value = value
  },

  setOAuth2({ oauth2 }, { attribute, value }) {
    oauth2[attribute] = value
  },

  addOAuthToken({ oauth2 }, value) {
    oauth2.tokens.push(value)
  },

  removeOAuthToken({ oauth2 }, index) {
    oauth2.tokens.splice(index, 1)
  },

  setOAuthTokenName({ oauth2 }, { index, value }) {
    oauth2.tokens[index].name = value
  },

  addOAuthTokenReq({ oauth2 }, value) {
    oauth2.tokenReqs.push(value)
  },

  removeOAuthTokenReq({ oauth2 }, index) {
    oauth2.tokenReqs.splice(index, 1)
  },

  resetRequest(state) {
    state.request = {
      method: "GET",
      uri: "",
      url: "https://httpbin.org",
      path: "/get",
      label: "",
      auth: "None",
      httpUser: "",
      httpPassword: "",
      passwordFieldType: "password",
      bearerToken: "",
      headers: [],
      params: [],
      bodyParams: [],
      rawParams: "",
      rawInput: false,
      requestType: "",
      contentType: "",
    }
  },

  resetResponses(state) {
    state.response = undefined
    state.responses = []
  },

  selectRequest(state, request) {
    state.request = Object.assign({}, state.request, request)
  },
}

export const actions = {
  reset({ commit }) {
    commit("resetRequest")
    commit("resetResponses")
  },

  async addRequest({ state, rootState, commit }, { specid, request, response }) {
    commit("addResponse", response)
    await api
      .addRequest(
        specid,
        {
          title: request.label,
          request,
          response: api.parseResponseContentType(response),
        },
        { state: rootState }
      )
      .then(
        res => {
          commit("selectResponse", response)
          commit("openapi/update", { id: specid, spec: res.data }, { root: true })
        },
        err => console.error("[API ERROR]", err)
      )
  },
}
