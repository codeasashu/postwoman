export default ({ $axios, app, env }, inject) => {
  $axios.defaults.baseURL = env.apiUrl || process.env.apiUrl

  inject("api", new SpecApi($axios))
  inject("authapi", new AuthApi($axios, app.$auth))
}

class Api {
  API_PREFIX = "/api/v1"

  constructor($axios) {
    this.client = $axios.create({
      baseURL: `${$axios.defaults.baseURL}${this.API_PREFIX}`,
    })
  }

  get axios() {
    return this.client
  }

  setToken(token, scheme) {
    scheme = scheme || "Bearer"
    this.client.setToken(token, scheme)
    return this
  }
}

class AuthApi extends Api {
  API_PREFIX = "/api/token"

  constructor($axios) {
    super($axios)
    this.superBaseUrl = $axios.defaults.baseURL
    this.client.defaults.baseURL = $axios.defaults.baseURL + this.API_PREFIX
  }

  get googleClient() {
    let gclient = this.client.create({ baseURL: this.superBaseUrl + "/google_auth" })
    delete gclient.defaults.headers.common["Authorization"]
    return gclient
  }

  //Get JWT token from google token
  getToken = async googleToken => await this.googleClient.post("/", { token: googleToken })

  refreshToken = async refreshToken =>
    await this.client.post("/refresh/", {
      refresh: refreshToken,
    })
}

class SpecApi extends Api {
  constructor($axios, $auth) {
    super($axios)

    //Auto logout
    this.client.onError(error => {
      console.log("got error", error)
      const code = parseInt(error.response && error.response.status)
      if ([401, 403].includes(code)) {
        console.log("hawww", error)
        $auth.logout().then(
          data => console.log("after logout", data),
          err => console.log("err", err)
        )
      }
      return Promise.reject(error)
    })
  }

  // Spec related APIs
  addSpec = async data => await this.client.post("spec/", data)
  getSpec = async specid => await this.client.get(`spec/${specid}?format=json`)
  getSpecs = async () => await this.client.get("spec/")
  updateSpec = async (data, specid) => await this.client.put(`spec/${specid}`, data)
  deleteSpec = async specid => await this.client.delete(`spec/${specid}`)

  // Design specific APIs
  addRequest = async (specid, { title, request, response }) =>
    await this.client.post(`spec/${specid}`, { title, request, response })
  deleteRequest = async (specid, operationid) =>
    await this.client.delete(`spec/${specid}/operation/${operationid}`)
  deleteResponse = async (specid, operationid, { code, contentType }) =>
    await this.client.put(`spec/${specid}/operation/${operationid}`, { code, contentType })

  // Fork related APIs
  getFork = async specid => await this.client.get(`fork/${specid}`)
  forkSpec = async specid => await this.client.post(`fork/${specid}`)
}
