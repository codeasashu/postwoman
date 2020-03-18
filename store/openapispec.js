import Vue from "vue"
import { Openapi, getId } from "../functions/oas"

export const state = () => ({
  openapis: [],
})

export const mutations = {
  add({ openapis }, { name, baseurl, description }) {
    let oas = new Openapi()
    oas.init({ name, description, baseurl })
    openapis.push(oas.dict)
  },

  update({ openapis }, { id, spec }) {
    openapis.forEach((openapi, index) => {
      if (getId(openapi) === id) {
        let oas = new Openapi(openapi)
        oas.name = spec.name
        oas.baseurl = spec.baseurl
        oas.description = spec.description
        Vue.set(openapis, index, oas.dict)
      }
    })
  },
  remove({ openapis }, oas) {
    openapis.forEach((openapi, index) => {
      if (getId(openapi) === getId(oas)) {
        openapis.splice(index, 1)
        return
      }
    })
  },
}
