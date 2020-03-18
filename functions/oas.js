import { urlParse, createUUID } from "../functions"

export const ServerExistException = value => {
  this.value = value
  this.message = "already exists"
  this.toString = () => this.value + this.message
}

export const getId = spec => (spec && spec["x-internal-id"]) || undefined

class OpenApiSpec {
  constructor(spec) {
    if (spec && spec.hasOwnProperty("info")) this.spec = this.populate(spec)
  }

  get bare() {
    return {
      "x-internal-id": "",
      info: {
        title: "",
        description: "",
        version: "0.1.0",
      },
      servers: [],
      paths: {},
    }
  }

  // Gives the normal dict pair without any attached class instance
  get dict() {
    return JSON.parse(this.json)
  }

  get json() {
    try {
      return JSON.stringify(this.spec)
    } catch (error) {
      return JSON.stringify(Object.assign({}, this.bare, this.spec))
    }
  }

  get id() {
    return getId(this.spec)
  }

  get name() {
    return this.spec.info.title
  }

  set name(value) {
    return (this.spec.info.title = value)
  }

  get baseurls() {
    return this.spec.servers
  }

  set baseurls(urls) {
    return (this.spec.servers = urls || [])
  }

  get baseurl() {
    return this.spec.servers.length > 0 ? this.spec.servers[0]["url"] : undefined
  }

  set baseurl(value) {
    if (this.spec.servers.length > 0) this.spec.servers[0]["url"] = value
  }

  get description() {
    return this.spec.info.description
  }

  set description(value) {
    return (this.spec.info.description = value)
  }

  get version() {
    return this.spec.info.version
  }

  set version(value) {
    return (this.spec.info.version = value)
  }

  get info() {
    return this.spec.info
  }

  urlexists(value) {
    this.spec.servers.forEach(server => {
      try {
        let url = server && urlParse(server)
        let baseurl = baseurl && urlParse(value)
        if (url && url.origin == baseurl.origin) return true
      } catch (error) {
        //pass
      }
    })
    return false
  }

  populate(spec) {
    return Object.assign({}, this.bare, spec || this.spec)
  }

  /**
   * Setters
   */
  init({ name, description, baseurl }) {
    this.spec = Object.assign({}, this.bare, {
      "x-internal-id": createUUID(),
      info: {
        title: name,
        description,
      },
    })

    if (this.urlexists(baseurl)) {
      throw new ServerExistException(baseurl)
    }

    this.spec.servers.push({ url: baseurl })
  }
}

export const Openapi = OpenApiSpec

export default OpenApiSpec
