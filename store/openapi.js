export const state = () => ({
  apiurl: "http://localhost:8080/api/v1",
  response: undefined,
  specs: [],
})

const getid = spec => spec["x-internal-id"]

export const mutations = {
  add(state, spec) {
    state.specs.push(spec)
  },

  addResponse(state, response) {
    state.response = response
  },

  update(state, { id, spec }) {
    state.specs.forEach((_spec, key) => {
      if (getid(_spec) == id) {
        console.log("matched", _spec, key, id)
        state.specs[key] = spec
        return
      }
    })
  },
}
