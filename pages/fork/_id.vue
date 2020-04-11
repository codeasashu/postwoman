<template>
  <div>
    <div class="page page-fork">
      <img src="~static/images/fork.png" :alt="$t('fork')" class="fork_banner" />
      <h2>Fork</h2>
      <div v-if="spec">
        <pre>Spec id (rev: {{ spec.info.version }}) <br /> <u>{{ $route.params.id }}</u></pre>
        <p v-if="!forkedSpecidLink">
          <button @click.prevent="forkSpec" :disabled="forking">{{ $t("fork") }}</button>
        </p>
        <div v-else>
          <p><span class="error">You have already forked this spec</span></p>
          <p>
            <nuxt-link :to="forkedSpecidLink">
              <button>{{ $t("view_fork") }}</button>
            </nuxt-link>
          </p>
        </div>
      </div>
      <p>
        <nuxt-link to="/" class="simple">
          <button>{{ $t("go_home") }}</button>
        </nuxt-link>
      </p>
    </div>
  </div>
</template>
<style scoped lang="scss">
.page-fork {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}
.fork_banner {
  width: 256px;
}
.simple button {
  background-color: transparent;
  color: #fff;
}
</style>
<script>
export default {
  async asyncData({ params, store, app, $axios, $nuxt, error, redirect }) {
    if (params.hasOwnProperty("id")) {
      const forkedspecid = await store.dispatch("openapi/getFork", params.id)
      const { data } = await app.$api.getSpec(params.id)
      return { forkedspecid, spec: data }
    }
    return { spec: undefined }
  },
  data() {
    return {
      forking: false,
    }
  },
  computed: {
    forkedSpecidLink() {
      if (this.forkedspecid) {
        return `/design/${this.forkedspecid}`
      }
      return undefined
    },
  },
  methods: {
    forkSpec() {
      this.forking = true
      if (this.$route.params.hasOwnProperty("id")) {
        this.$store.dispatch("openapi/forkSpec", this.spec["x-internal-id"]).then(
          res =>
            this.$router.push({
              path: `/design/${res.data["x-internal-id"]}`,
            }),
          err => {
            this.forking = false
            console.error(err)
          }
        )
      }
    },
  },
}
</script>
