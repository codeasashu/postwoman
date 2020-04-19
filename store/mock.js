export const state = () => ({
  mock: undefined,
})

export const mutations = {
  setMock(state, mock) {
    state.mock = mock
  },

  resetMock(state) {
    state.mock = undefined
  },
}

export const actions = {
  async getMock({ commit }, specid) {
    return await this.$api.getMock(specid).then(
      resp => commit("setMock", resp.data),
      err => console.error("[MOCK ERR]", err)
    )
  },

  async restart({ dispatch }, specid) {
    console.log("first retry", this.$api)
    return await this.$api.restartMock(specid).then(
      () => {
        console.log("first retry answer", this.$api)
        dispatch("getMock")
      },
      err => console.error("[MOCK ERR]", err)
    )
  },

  async stop({ commit }, specid) {
    return await this.$api.stopMock(specid).then(() => commit("resetMock"))
  },
}
