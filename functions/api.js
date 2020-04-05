import axios from "axios"

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
})

export const addSpec = async data => await apiClient.post("spec/", data)

export const addRequest = async (specid, { request, response }) => {
  return await apiClient.post(`spec/${specid}`, { request, response })
}
