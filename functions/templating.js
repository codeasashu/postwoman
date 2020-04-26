const searchTerm = /(?<!\\){([^{}]+)(?<!\\)}/g // "{myVariable}"

export default function parseTemplateString(string, variables) {
  if (!variables || !string) {
    return string
  }

  const matches = string.matchAll(searchTerm)
  console.log("matches for", string, matches)
  for (const match of matches) {
    console.log("matche", match)
    string = string.replace(match[0], variables[match[1]] || match[0])
  }
  return string
}

export const getMatches = string => {
  let _matches = []
  const matches = string.matchAll(searchTerm)
  for (const match of matches) {
    _matches.push(match[1])
  }
  return _matches
}
