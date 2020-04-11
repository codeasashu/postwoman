export const state = () => ({
  spec: undefined,
})

export const mutations = {
  setSpec(state, _spec) {
    state.spec = _spec
  },
}
