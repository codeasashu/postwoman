import { httpbinRequest } from "../functions"
export default () => ({
  request: httpbinRequest,
  gql: {
    url: "https://rickandmortyapi.com/graphql",
    headers: [],
    schema: "",
    variablesJSONString: '{ "id": "1" }',
    query: `query charcter($id: ID) {
  character(id: $id) {
    id
    name
  }
}`,
    response: "",
  },
  theme: {
    collapsedSections: [],
  },
  oauth2: {
    tokens: [],
    tokenReqs: [],
    tokenReqSelect: "",
    tokenReqName: "",
    accessTokenName: "",
    oidcDiscoveryUrl: "",
    authUrl: "",
    accessTokenUrl: "",
    clientId: "",
    scope: "",
  },
})
