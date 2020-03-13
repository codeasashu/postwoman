<template>
  <div :label="$t('environment')" ref="environment">
    <addEnvironment :show="showModalAdd" @hide-modal="displayModalAdd(false)" />
    <editEnvironment
      :show="showModalEdit"
      :editingEnvironment="editingEnvironment"
      :editingEnvironmentIndex="editingEnvironmentIndex"
      @hide-modal="displayModalEdit(false)"
    />
    <importExportEnvironment
      :show="showModalImportExport"
      @hide-modal="displayModalImportExport(false)"
    />
    <v-row>
      <v-col cols="6">
        <v-btn class="icon" @click="displayModalAdd(true)">
          <v-icon>add</v-icon>
          <span>{{ $t("new") }}</span>
        </v-btn>
      </v-col>
      <v-col cols="6" class="float-right">
        <v-btn class="icon" @click="displayModalImportExport(true)">
          <v-icon>add</v-icon>
          <span>{{ $t("import_export") }}</span>
        </v-btn>
      </v-col>
    </v-row>
    <p v-if="environments.length === 0" class="info">
      {{ $t("add") }} {{ $t("new") }} {{ $t("environment") }}
    </p>
    <virtual-list
      class="virtual-list"
      :class="{ filled: environments.length }"
      :size="152"
      :remain="Math.min(5, environments.length)"
    >
      <v-list>
        <v-list-item v-for="(environment, index) in environments" :key="environment.name">
          <environment
            :environmentIndex="index"
            :environment="environment"
            @edit-environment="editEnvironment(environment, index)"
            @select-environment="$emit('use-environment', environment)"
          />
        </v-list-item>
        <v-list-item v-if="environments.length === 0">
          <label>Environments are empty</label>
        </v-list-item>
      </v-list>
    </virtual-list>
  </div>
</template>

<style scoped lang="scss">
.virtual-list {
  max-height: calc(100vh - 276px);
}

ul {
  display: flex;
  flex-direction: column;
}
</style>

<script>
import environment from "./environment"
import { fb } from "../../functions/fb"

const updateOnLocalStorage = (propertyName, property) =>
  window.localStorage.setItem(propertyName, JSON.stringify(property))

export default {
  components: {
    environment,
    "pw-section": () => import("../layout/section"),
    addEnvironment: () => import("./addEnvironment"),
    editEnvironment: () => import("./editEnvironment"),
    importExportEnvironment: () => import("./importExportEnvironment"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      showModalImportExport: false,
      showModalAdd: false,
      showModalEdit: false,
      editingEnvironment: undefined,
      editingEnvironmentIndex: undefined,
    }
  },
  computed: {
    environments() {
      return this.$store.state.postwoman.environments
    },
  },
  async mounted() {
    this._keyListener = function(e) {
      if (e.key === "Escape") {
        e.preventDefault()
        this.showModalImportExport = false
      }
    }
    document.addEventListener("keydown", this._keyListener.bind(this))
  },
  methods: {
    displayModalAdd(shouldDisplay) {
      this.showModalAdd = shouldDisplay
    },
    displayModalEdit(shouldDisplay) {
      this.showModalEdit = shouldDisplay

      if (!shouldDisplay) this.resetSelectedData()
    },
    displayModalImportExport(shouldDisplay) {
      this.showModalImportExport = shouldDisplay
    },
    editEnvironment(environment, environmentIndex) {
      this.$data.editingEnvironment = environment
      this.$data.editingEnvironmentIndex = environmentIndex
      this.displayModalEdit(true)
      this.syncEnvironments
    },
    resetSelectedData() {
      this.$data.editingEnvironment = undefined
      this.$data.editingEnvironmentIndex = undefined
    },
    syncEnvironments() {
      if (fb.currentUser !== null) {
        if (fb.currentSettings[1].value) {
          fb.writeEnvironments(JSON.parse(JSON.stringify(this.$store.state.postwoman.environments)))
        }
      }
    },
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
