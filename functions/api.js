import axios from "axios"
import { cloneDeep } from "lodash"

export const APIURL = "http://localhost:8080/api/v1"

const apiClient = axios.create({
  baseURL: APIURL,
})

export const addSpec = async (data, { state }) =>
  await apiClient.post("spec/", data, {
    headers: {
      Authorization: state.auth.user.email,
    },
  })

export const getSpecs = async ({ state }) =>
  await apiClient.get("spec/", {
    headers: {
      Authorization: state.auth.user.email,
    },
  })

export const getSpec = async (specid, { state }) =>
  await apiClient.get(`spec/${specid}?format=json`, {
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

//@TODO this api only updates `info` and nothing more.
//should be able to handle request and responses as well
export const updateSpec = async (data, specid, { state }) => {
  console.log("desc", data)
  return await apiClient.put(`spec/${specid}`, data, {
    headers: {
      Authorization: state.auth.user.email,
    },
  })
}

// Use this api to upsert request and response to spec
export const addRequest = async (specid, { title, request, response }, { state }) => {
  return await apiClient.post(
    `spec/${specid}`,
    { title, request, response },
    {
      headers: {
        Authorization: state.auth.user.email,
      },
    }
  )
}

export const deleteRequest = async (specid, operationid, { state }) => {
  return await apiClient.delete(`spec/${specid}/operation/${operationid}`, {
    headers: {
      Authorization: state.auth.user.email,
    },
  })
}

export const deleteResponse = async (specid, operationid, { code, contentType }, { state }) => {
  return await apiClient.put(
    `spec/${specid}/operation/${operationid}`,
    { code, contentType },
    {
      headers: {
        Authorization: state.auth.user.email,
      },
    }
  )
}

export const parseResponseContentType = response => {
  let _response = cloneDeep(response)
  let body = _response.body
  if (
    _response.headers["content-type"] == "application/json" ||
    _response.headers["content-type"] == "application/hal+json"
  ) {
    try {
      body = JSON.parse(_response.body)
    } catch (err) {
      console.log("ERROR_PARSING_RESPONSE", err, body)
    } finally {
      _response.body = body
    }
  }
  return _response
}
