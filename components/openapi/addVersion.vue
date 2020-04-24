<template>
  <modal v-if="show" @close="hideModal">
    <div slot="header">
      <ul>
        <li>
          <div class="flex-wrap">
            <h3 class="title">{{ $t("new_version") }}</h3>
            <div>
              <button class="icon" @click="hideModal">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div slot="body">
      <ul>
        <li>
          <label for="newversion">{{ $t("version_name") }}</label>
          <input id="newversion" type="text" v-model="newversion" placeholder="1.0.1" />
        </li>
        <li>
          <span class="select-wrapper">
            <label for="apiversion">{{ $t("version_from") }}</label>
            <select id="apiversion" v-model="selectedVersion">
              <option selected :value="undefined">{{ $t("select_version") }}</option>
              <option v-for="(version, index) in versions" :key="index" :value="version">{{
                version
              }}</option>
            </select>
          </span>
        </li>
      </ul>
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <button class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </button>
          <button class="icon primary" @click="addNewVersion">
            {{ $t("save") }}
          </button>
        </span>
      </div>
    </div>
  </modal>
</template>
<script>
export default {
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      newversion: undefined,
      selectedVersion: undefined,
    }
  },
  computed: {
    spec() {
      return this.$store.state.openapi.specs
        .filter(spec => spec["x-internal-id"] == this.$route.params.id)
        .pop()
    },
    versions() {
      return (
        this.spec["info"] && (this.spec["info"]["x-versions"] || [this.spec["info"]["version"]])
      )
    },
  },
  watch: {
    show(shown) {
      if (shown) {
        this.$data.selectedVersion = this.$route.params.apiversion
      }
    },
  },
  methods: {
    addNewVersion() {
      if (!this.$data.newversion) {
        this.$toast.info($t("invalid_version"))
        return
      }

      this.$emit("add-version", {
        version: this.$data.newversion,
        from: this.$data.selectedVersion,
      })
    },

    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
