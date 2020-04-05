import axios from "axios"

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
})

export const addSpec = async (data, { state }) =>
  await apiClient.post("spec/", data, {
    headers: {
      Authorization: state.auth.user.email,
    },
  })

export const getSpec = async ({ state }) =>
  await apiClient.get("spec/", {
    headers: {
      Authorization: state.auth.user.email,
    },
  })

export const deleteSpec = async (specid, { state }) =>
  await apiClient.delete(`spec/${specid}`, {
    headers: {
      Authorization: state.auth.user.email,
    },
  })

export const addRequest = async (specid, { request, response }, { state }) => {
  return await apiClient.post(
    `spec/${specid}`,
    { request, response },
    {
      headers: {
        Authorization: state.auth.user.email,
      },
    }
  )
}
