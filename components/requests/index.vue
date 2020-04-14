<!--
TODO:
    - probably refactor and pass event arguments to modals directly without unpacking
-->

<template>
  <pw-section class="yellow" :label="$t('requests')" ref="requests">
    <div class="flex-wrap">
      <div v-if="readonly === false">
        <button class="icon" @click="resetRequestRepsonse">
          <i class="material-icons">add</i>
          <span>{{ $t("new") }}</span>
        </button>
      </div>
    </div>
    <p v-if="requests.length === 0" class="info">
      Create new request
    </p>
    <virtual-list
      class="virtual-list"
      :class="{ filled: requests.length }"
      :size="152"
      :remain="Math.min(5, requests.length)"
    >
      <ul>
        <li v-for="(request, index) in requests" :key="index">
          <request :request="request" :specid="specid" :readonly="readonly" />
        </li>
        <li v-if="requests.length === 0">
          <label>Requests are empty</label>
        </li>
      </ul>
    </virtual-list>
  </pw-section>
</template>

<style scoped lang="scss">
.virtual-list {
  max-height: calc(100vh - 286px);
}

ul {
  display: flex;
  flex-direction: column;
}
</style>

<script>
import { fb } from "../../functions/fb"

export default {
  props: {
    specid: String,
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    "pw-section": () => import("../layout/section"),
    request: () => import("./request"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      showModalEdit: false,
    }
  },
  computed: {
    spec() {
      if (this.$props.readonly) {
        return this.$store.state.browse.spec
      }
      return this.$store.state.openapi.specs
        .filter(spec => spec["x-internal-id"] == this.specid)
        .pop()
    },
    requests() {
      let reqs = []
      if (!this.spec) return reqs
      for (let path in this.spec.paths) {
        for (let method in this.spec.paths[path]) {
          reqs.push({
            path,
            method,
            operation: this.spec.paths[path][method],
          })
        }
      }
      return reqs
    },
  },
  async mounted() {
    this._keyListener = function(e) {
      if (e.key === "Escape") {
        e.preventDefault()
        this.showModalEdit = false
      }
    }
    document.addEventListener("keydown", this._keyListener.bind(this))
  },
  methods: {
    displayModalEdit(shouldDisplay) {
      this.showModalEdit = shouldDisplay
    },
    resetRequestRepsonse() {
      this.$store.dispatch("design/reset")
    },
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
