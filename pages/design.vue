<template>
  <div class="page">
    <div class="content">
      <div v-if="showBackBtn">
        <nuxt-link to="/design">Back</nuxt-link>
      </div>
      <div class="page-columns inner-left">
        <pw-section class="orange" label="Select-spec">
          <ul>
            <li>
              <label for="selectSpec">{{ $t("select_spec") }}</label>
              <div>
                <select type="text" id="selectSpec" v-model="selectedSpec" @change="selectSpec">
                  <option></option>
                  <option v-for="spec in specs" :key="spec['x-internal-id']" :value="spec">
                    {{ spec.info.title }}
                  </option>
                </select>
              </div>
            </li>
          </ul>
        </pw-section>
        <pw-section class="blue">
          <nuxt-child />
        </pw-section>
      </div>
    </div>
  </div>
</template>
<script>
import { getSpecs } from "../functions/api"
import section from "../components/layout/section"
export default {
  async asyncData({ params, store, $axios, $nuxt, error }) {
    let showBackBtn = false
    let specs = store.state.openapi.specs
    let spec = undefined
    if (params.hasOwnProperty("id")) {
      showBackBtn = true
      spec = specs.filter(_spec => _spec["x-internal-id"] == params.id).pop()
    }
    await store.dispatch("openapi/fetchSpecs")
    console.log("fetched")
    return { selectedSpec: spec, showBackBtn }
  },
  watch: {
    "$route.path": function(val) {
      this.showBackBtn = /\/design\/(.{1,})+/g.test(val)

      if (this.$route.params.hasOwnProperty("id")) {
        this.selectedSpec = this.specs
          .filter(_spec => _spec["x-internal-id"] == this.$route.params.id)
          .pop()
      } else {
        this.selectedSpec = undefined
      }
      this.resetRequestResponse()
    },
  },
  components: {
    "pw-section": section,
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
  },
  data() {
    return {
      selectedSpec: undefined,
      showBackBtn: false,
    }
  },
  //   computed: {
  //       specs() {
  //           return this.$store.state.openapi.specs
  //       }
  //   },
  methods: {
    resetRequestResponse() {
      this.$store.dispatch("design/reset")
    },
    selectSpec() {
      if (this.selectedSpec)
        this.$router.push({
          path: `/design/${this.selectedSpec["x-internal-id"]}`,
        })
      else {
        this.$router.replace("/design/")
      }
    },
  },
}
</script>
