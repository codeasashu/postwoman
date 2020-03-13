export default function parseTemplateString(string, variables) {
  if (!variables || !string) {
    return string
  }
  const searchTerm = /<<([^>]*)>>/g // "<<myVariable>>"
  console.log("s", variables, string)
  return string.replace(searchTerm, (match, p1) => variables[p1] || "")
}
