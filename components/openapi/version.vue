<template>
  <div class="inline-flex">
    <span class="select-wrapper">
      <select id="apiversion" v-model="selectedVersion">
        <option selected :value="undefined">{{ $t("select_version") }}</option>
        <option v-for="(version, index) in versions" :key="index" :value="version">{{
          version
        }}</option>
      </select>
    </span>
    <button v-if="addButton" @click.prevent="addNewVersion">{{ $t("version_add") }}</button>
    <button v-if="setDefaultButton" @click.prevent="setDefaultVersion">
      {{ $t("version_setdefault") }}
    </button>
    <button v-if="remButton" @click.prevent="removeVersion">{{ $t("version_remove") }}</button>
    <addNewVersionModal
      v-if="addButton"
      :show="showModal"
      @add-version="addVersion"
      @hide-modal="showModal = false"
    />
  </div>
</template>
<style scoped>
.inline-flex,
.inline-flex > * {
  display: inline-block;
}
</style>
<script>
export default {
  props: {
    version: String,
    addButton: {
      type: Boolean,
      default: false,
    },
    remButton: {
      type: Boolean,
      default: false,
    },
    setDefaultButton: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    addNewVersionModal: () => import("./addVersion"),
  },
  data() {
    return {
      showModal: false,
    }
  },
  computed: {
    spec() {
      return this.$store.state.openapi.specs
        .filter(
          //@TODO this.$route.params.id  should not be used, use prop instead
          spec => spec["x-internal-id"] == this.$route.params.id
        )
        .pop()
    },
    versions() {
      return this.spec && (this.spec["info"]["x-versions"] || [this.spec["info"]["version"]])
    },
    selectedVersion: {
      get() {
        return this.version
      },
      set(value) {
        if (!value) {
          value = this.spec["info"]["version"]
        }
        this.$emit("change-version", value)
      },
    },
  },
  methods: {
    addVersion(version) {
      this.$emit("add-version", version)
      this.showModal = false
    },
    removeVersion() {
      if (confirm("Are you sure?")) {
        this.$store
          .dispatch("openapi/removeVersion", {
            specid: this.spec["x-internal-id"],
            version: this.selectedVersion,
          })
          .then(
            () => this.$router.replace(`/design/${this.spec["x-internal-id"]}`),
            err => this.$toast.error(err, { icon: "error" })
          )
      }
    },
    setDefaultVersion() {
      this.$store
        .dispatch("openapi/setDefaultVersion", {
          specid: this.spec["x-internal-id"],
          version: this.selectedVersion,
        })
        .then(
          () =>
            this.$router.replace(`/design/${this.spec["x-internal-id"]}/${this.selectedVersion}`),
          err => this.$toast.error(err, { icon: "error" })
        )
    },
    addNewVersion() {
      this.showModal = true
    },
  },
}
</script>
