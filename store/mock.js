export const state = () => ({
  mocks: [],
})

export const mutations = {
  setMock(state, { specid, version, data }) {
    let specIndex = undefined
    for (let index in state.mocks) {
      if (state.mocks[index].hasOwnProperty(specid)) specIndex = index
    }

    if (specIndex) {
      state.mocks[specIndex][specid][version] = data
    } else {
      let spec = {}
      spec[specid] = {}
      spec[specid][version] = data
      state.mocks.push(spec)
    }
  },

  resetMock(state, { specid, version }) {
    for (let index in state.mocks) {
      if (state.mocks[index].hasOwnProperty(specid)) {
        delete state.mocks[index][specid][version]
      }
    }
  },
}

export const actions = {
  async getMock({ commit }, { specid, version }) {
    return await this.$api.getMock(specid, version).then(
      ({ data }) => {
        commit("setMock", { specid, version, data })
        return data
      },
      err => console.error("[MOCK ERR]", err)
    )
  },

  async getMockStatus({ commit }, { specid, version }) {
    return await this.$api.getMockStatus(specid, version).then(
      ({ data }) => {
        commit("setMock", { specid, version, data })
        return data
      },
      err => console.error("[MOCK ERR]", err)
    )
  },

  async restart({ dispatch }, { specid, version }) {
    return await this.$api.restartMock(specid, version).then(
      () => dispatch("getMock", { specid, version }),
      err => console.error("[MOCK ERR]", err)
    )
  },

  async stop({ commit }, { specid, version }) {
    return await this.$api
      .stopMock(specid, version)
      .then(() => commit("resetMock", { specid, version }))
  },
}
