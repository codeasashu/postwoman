export default function parseTemplateString(string, variables) {
  if (!variables || !string) {
    return string
  }
  const searchTerm = /<<([^>]*)>>/g // "<<myVariable>>"
  const matches = string.matchAll(searchTerm)
  for (const match of matches) {
    console.log("m", string, match, match[0], variables[match[1]] || "")
    string = string.replace(match[0], variables[match[1]] || "")
  }
  console.log("n", string)
  return string
  // return string.replace(searchTerm, (match, p1) => variables[p1] || "")
}
