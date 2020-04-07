<!--
TODO:
    - probably refactor and pass event arguments to modals directly without unpacking
-->

<template>
  <pw-section class="yellow" :label="$t('requests')" ref="requests">
    <div class="flex-wrap">
      <div>
        <button class="icon" @click="$emit('new_request')">
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
          <request :request="request" />
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
    spec: Object,
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
    requests() {
      let reqs = []
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
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
