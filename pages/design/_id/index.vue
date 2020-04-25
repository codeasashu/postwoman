<template>
  <div><p>Please wait...</p></div>
</template>
<script>
export default {
  props: {
    spec: Object,
  },
  async asyncData({ params, store, redirect, error }) {
    // Route to default spec version if none mentioned
    const specid = params.id
    const spec = store.state.openapi.specs.filter(spec => spec["x-internal-id"] == specid).pop()
    const apiversion = spec["info"]["version"]
    await store.dispatch("openapi/fetchSpec", {
      specid: spec["x-internal-id"],
      version: apiversion,
    })
    redirect(`/design/${specid}/${apiversion}`)
  },
}
</script>
