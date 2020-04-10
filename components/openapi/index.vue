<template>
  <pw-section class="yellow" :label="$t('spec')" ref="spec">
    <div v-if="$store.state.auth.loggedIn">
      <addOpenapi :show="showModalAdd" @hide-modal="displayModalAdd(false)" />
      <editOpenapi
        :show="showModalEdit"
        :spec="editingSpec"
        @hide-modal="displayModalEdit(false)"
      />
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
            <request-item :spec="spec" @edit-spec="displayModalEdit(true, spec)" />
          </li>
          <li v-if="specs.length === 0">
            <label>Specs are empty</label>
          </li>
        </ul>
      </virtual-list>
    </div>
    <div v-else>
      <ul>
        <li>
          <label>{{ $t("login_first") }}</label>
          <p>
            <login />
          </p>
        </li>
      </ul>
    </div>
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
    editOpenapi: () => import("./edit"),
    requestItem: () => import("./request-item"),
    VirtualList: () => import("vue-virtual-scroll-list"),
    login: () => import("../../components/firebase/login"),
  },
  data() {
    return {
      showModalAdd: false,
      showModalEdit: false,
      editingSpec: undefined,
    }
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
  },
  mounted() {
    this.$store.dispatch("openapi/fetchSpecs")
  },
  methods: {
    displayModalAdd(shouldDisplay) {
      this.showModalAdd = shouldDisplay
    },
    displayModalEdit(shouldDisplay, spec) {
      this.showModalEdit = shouldDisplay
      this.editingSpec = spec
    },
    editSpec(spec) {
      console.log("spec", spec)
    },
  },
}
</script>
