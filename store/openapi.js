import Vue from "vue"

export const state = () => ({
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
  async fetchSpec({ commit }, specid) {
    return await this.$api.getSpec(specid).then(
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

  async fetchSpecs({ commit }) {
    return await this.$api.getSpecs().then(
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

  async deleteOperation({ dispatch }, { specid, operationid }) {
    return await this.$api.deleteRequest(specid, operationid).then(res => {
      if (res.data.deleted && res.data.deleted == true) {
        //Refresh thiss spec
        return dispatch("fetchSpec", specid)
      }
    })
  },

  async deleteResponse({ dispatch }, { specid, operationid, data }) {
    return await this.$api.deleteResponse(specid, operationid, data).then(
      () => dispatch("fetchSpec", specid),
      err => console.error("[APIERROR]", err)
    )
  },

  async deleteSpec({ dispatch }, specid) {
    return await this.$api.deleteSpec(specid).then(
      () => dispatch("fetchSpecs"),
      err => console.error("[APIERROR]", err)
    )
  },

  async addSpec({ commit }, { title, url, description }) {
    description = description || ""
    return await this.$api.addSpec({ title, url, description }).then(
      res => commit("add", res.data),
      err => console.error("[APIERROR]", err)
    )
  },

  async updateSpec({ commit }, { specid, data: { title, url, description } }) {
    description = description || ""
    return await this.$api.updateSpec({ title, url, description }).then(
      res => commit("update", { id: specid, spec: res.data }),
      err => console.error("[APIERROR]", err)
    )
  },

  async addRequest({ commit }, { specid, data: { title, request, response } }) {
    return await this.$api.addRequest({ title, request, response }).then(
      res => commit("update", { id: specid, spec: res.data }),
      err => console.error("[APIERROR]", err)
    )
  },

  async getFork(state, specid) {
    console.log("specid", specid)
    return await this.$api.getFork(specid).then(
      res => res.data.specid,
      err => console.error("[APIERROR]", err)
    )
  },

  async forkSpec({ dispatch }, specid) {
    return await this.$api.forkSpec(specid).then(
      () => dispatch("fetchSpec", specid),
      err => console.error("[APIERROR]", err)
    )
  },
}
