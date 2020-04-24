<template>
  <div><p>Please wait...</p></div>
</template>
<script>
export default {
  props: {
    spec: Object,
  },
  asyncData({ params, store, redirect, error }) {
    // Route to default spec version if none mentioned
    const specid = params.id
    if (specid) {
      const spec = store.state.openapi.specs.filter(spec => spec["x-internal-id"] == specid).pop()
      const apiversion = spec["info"]["version"]
      redirect(`/mock/${specid}/${apiversion}`)
    }
  },
}
</script>
