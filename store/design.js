export const state = () => ({
  specid: undefined,
  responses: [],
  requests: [],
  response: undefined,
})

export const mutations = {
  clearresponse(state) {
    state.responses = []
  },

  selectResponse(state, response) {
    console.log("selected", response)
    state.response = response
  },

  deleteResponse(state, response) {
    state.responses.splice(state.responses.indexOf(entry), 1)
  },

  addResponse(state, response) {
    // Remove duplicate status code
    state.responses.forEach((item, index) => {
      if (item.status === response.status) {
        state.responses.splice(index, 1)
      }
    })
    state.responses.push(response)
  },

  //@TODO Not updating in realtime (on refresh works)
  starResponse(state, response) {
    const index = state.responses.indexOf(response)
    let new_response = state.responses[index]
    new_response.star = !new_response.star
    state.responses[index] = new_response
  },

  /**
   * Requests specific
   */
  addRequest(state, { specid, request }) {
    state.requests.push(Object.assign({ specid: specid }, request))
  },
}
