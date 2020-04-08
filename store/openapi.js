import Vue from "vue"
import * as api from "../functions/api"

export const state = () => ({
  apiurl: "http://localhost:8080/api/v1",
  response: undefined,
  specs: [],
})

const getid = spec => spec["x-internal-id"]

export const mutations = {
  replace(state, specs) {
    state.specs = specs
  },

  add(state, spec) {
    state.specs.push(spec)
  },

  remove(state, id) {
    state.specs.forEach((_spec, key) => {
      if (getid(_spec) == id) {
        state.specs.splice(key, 1)
        return
      }
    })
  },

  addResponse(state, response) {
    state.response = response
  },

  update(state, { id, spec }) {
    state.specs.forEach((_spec, key) => {
      if (getid(_spec) == id) {
        Vue.set(state.specs, key, spec)
        return
      }
    })
  },
}

export const actions = {
  // async runApi({ state }, { callback, data}) {
  //   let results = undefined
  //   try {
  //     results = !!data ? await callback(data, { state }) : await callback({ state })
  //   } catch (err) {
  //     console.log('[API ERROR]', err)
  //   }
  //   return results
  // },

  async fetchSpec({ rootState, commit }, specid) {
    return await api.getSpec(specid, { state: rootState }).then(
      resp => {
        commit("update", {
          id: specid,
          spec: resp.data,
        })
        return resp
      },
      err => {
        console.error("[API ERROR]", err)
        return err
      }
    )
  },

  async fetchSpecs({ rootState, commit }) {
    return await api.getSpecs({ state: rootState }).then(
      resp => {
        commit("replace", resp.data)
        return resp
      },
      err => {
        console.error("[API ERROR]", err)
        return err
      }
    )
  },

  async deleteOperation({ rootState, dispatch }, { specid, operationid }) {
    return await api.deleteRequest(specid, operationid, { state: rootState }).then(res => {
      if (res.data.deleted && res.data.deleted == true) {
        //Refresh thiss spec
        return dispatch("fetchSpec", specid)
      }
    })
  },
}
