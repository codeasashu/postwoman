<template>
  <pw-section class="yellow" :label="$t('spec')" ref="spec">
    <addOpenapi :show="showModalAdd" @hide-modal="displayModalAdd(false)" />

    <div class="flex-wrap">
      <div>
        <button class="icon" @click="displayModalAdd(true)">
          <i class="material-icons">add</i>
          <span>{{ $t("new") }}</span>
        </button>
      </div>
    </div>
    <p v-if="specs.length === 0" class="info">
      Create new spec
    </p>
    <virtual-list
      class="virtual-list"
      :class="{ filled: specs.length }"
      :size="152"
      :remain="Math.min(5, specs.length)"
    >
      <ul>
        <li v-for="spec in specs" :key="spec.info.title">
          <request-item :spec="spec" />
        </li>
        <li v-if="specs.length === 0">
          <label>Specs are empty</label>
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
export default {
  components: {
    "pw-section": () => import("../layout/section"),
    addOpenapi: () => import("./add"),
    requestItem: () => import("./request-item"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      showModalAdd: false,
    }
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
  },
  methods: {
    displayModalAdd(shouldDisplay) {
      this.showModalAdd = shouldDisplay
    },
  },
}
</script>
