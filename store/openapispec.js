import { urlParse, createUUID } from "../functions"

const openapischema = {
  "x-internal-id": "",
  info: {
    title: "",
    description: "",
    version: "0.1.0",
  },
  servers: [],
  paths: {},
}

export const state = () => ({
  openapis: [],
})

export const mutations = {
  addOas({ openapis }, { name, baseurl, description }) {
    let url = urlParse(baseurl)
    if (url.hasOwnProperty("origin")) {
      openapis.push(
        Object.assign(openapischema, {
          "x-internal-id": createUUID(),
          info: { title: name, description },
          servers: [{ url: baseurl }],
        })
      )
    }
  },
}
