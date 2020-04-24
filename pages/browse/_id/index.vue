<template>
  <div><p>Please wait...</p></div>
</template>
<script>
export default {
  async asyncData({ params, store, redirect, error }) {
    if (!params.id) error("Spec not found", 404)
    // Route to default spec version if none mentioned
    const specid = params.id
    const spec = store.state.openapi.specs.filter(spec => spec["x-internal-id"] == specid).pop()
    if (!spec) error("Spec not found", 404)
    const apiversion = spec["info"]["version"]
    redirect(`/browse/${specid}/${apiversion}`)
  },
}
</script>
