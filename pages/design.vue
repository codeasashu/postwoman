<template>
  <div class="page">
    <div class="content">
      <div v-if="onSpecPage">
        <nuxt-link to="/design">
          <button class="bg-color">
            <i class="material-icons success-response">arrow_back</i>
          </button>
        </nuxt-link>
      </div>
      <div v-if="onSpecPage && selectedSpec">
        <button @click="deleteSpec" v-tooltip="$t('delete_spec')">
          <i class="material-icons">delete</i>
        </button>
        <button @click="showShareModalWindow" v-tooltip="$t('share')">
          <i class="material-icons">share</i>
        </button>
        <a class="button" :href="docurl" target="_blank" v-tooltip="$t('documentation')">
          <i class="material-icons">import_contacts</i>
        </a>
        <button @click="commitSpec">{{ $t("commit") }}</button>
        <nuxt-link
          class="button"
          :to="`/mock/${selectedSpec['x-internal-id']}/${$route.params.apiversion}`"
        >
          {{ $t("mock") }}
        </nuxt-link>
        <apiversion
          :addButton="true"
          :remButton="true"
          :setDefaultButton="true"
          :version="$route.params.apiversion"
          @change-version="changeVersion"
          @add-version="addNewVersion"
        />
      </div>
    </div>
    <div class="content">
      <div class="page-columns inner-left">
        <pw-section class="orange" label="Select-spec">
          <ul>
            <li>
              <label for="selectSpec">{{ $t("select_spec") }}</label>
              <div>
                <select type="text" id="selectSpec" v-model="selectedSpec" @change="selectSpec">
                  <option :value="undefined"></option>
                  <option v-for="spec in specs" :key="spec['x-internal-id']" :value="spec">
                    {{ spec.info.title }}
                  </option>
                </select>
              </div>
            </li>
          </ul>
        </pw-section>
        <pw-section class="blue" v-if="selectedSpec && onSpecPage">
          <nuxt-child :spec="selectedSpec" />
        </pw-section>
        <pw-section class="blue" v-else>
          <p>Please Select a spec above or</p>
          <button @click="createSpec" id="createSpec">
            {{ $t("create_spec") }}
            <span><i class="material-icons">send</i></span>
          </button>
        </pw-section>
      </div>
      <addOpenapi :show="showModalAdd" @hide-modal="showModalAdd = !showModalAdd" />
      <pw-modal v-if="showShareModal && selectedSpec" @close="showShareModal = false">
        <div slot="header">
          <ul>
            <li>
              <div class="flex-wrap">
                <h3 class="title">{{ $t("share") }}</h3>
                <div>
                  <button class="icon" @click="showShareModal = false">
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
              <input
                id="share-text"
                ref="sharespectext"
                :value="`${basepath}/browse/${selectedSpec['x-internal-id']}/${selectedVersion}`"
                :placeholder="$t('enter_curl')"
              />
            </li>
          </ul>
        </div>
        <div slot="footer">
          <div class="flex-wrap">
            <span></span>
            <span>
              <button class="icon" @click="showShareModal = false">
                {{ $t("cancel") }}
              </button>
              <button class="icon primary" @click="copyShareUrl">
                {{ $t("copy") }}
              </button>
            </span>
          </div>
        </div>
      </pw-modal>
    </div>
  </div>
</template>
<style scoped lang="scss">
.button {
  display: -webkit-inline-box;
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  margin: 4px;
  padding: 6px 16px;
  border-radius: 20px;
  background-color: var(--ac-color);
  color: var(--act-color);
  font-size: 16px;
  font-family: "Poppins", "Roboto", "Noto", sans-serif;
  font-weight: 700;
  -webkit-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
  fill: var(--act-color);
  cursor: pointer;
}
</style>
<script>
import section from "../components/layout/section"
import version from "../components/openapi/version"
import modal from "../components/ui/modal"
export default {
  async asyncData({ params, store, $axios, $nuxt, error }) {
    await store.dispatch("openapi/fetchSpecs")

    let onSpecPage = false
    let specs = store.state.openapi.specs
    let spec = undefined
    let apiversion = params.apiversion

    if (params.hasOwnProperty("id")) {
      onSpecPage = true
      spec = specs.filter(_spec => _spec["x-internal-id"] == params.id).pop()
      if (!spec) error("Spec not found", 404)
      if (
        !!apiversion &&
        apiversion != spec["info"]["version"] &&
        spec["info"]["x-versions"] &&
        spec["info"]["x-versions"].indexOf(apiversion) < 0
      )
        error("Version not found", 404)

      await store.dispatch("openapi/fetchSpec", {
        specid: spec["x-internal-id"],
        version: apiversion,
      })
    }
    return { selectedSpec: spec, onSpecPage }
  },
  watch: {
    "$route.path": function(val) {
      this.onSpecPage = /\/design\/(.{1,})+/g.test(val)

      if (this.$route.params.id) {
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
    "pw-modal": modal,
    apiversion: version,
    addOpenapi: () => import("../components/openapi/add"),
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
    basepath() {
      return window.location.protocol.concat("//") + window.location.host
    },
    docurl() {
      return `${this.$axios.defaults.baseURL}/docs/${this.selectedSpec["x-internal-id"]}/${this.$route.params.apiversion}`
    },
    specid() {
      return this.selectedSpec && this.selectedSpec["x-internal-id"]
    },
    selectedVersion() {
      return this.$route.params.apiversion || (this.selectedSpec && this.selectedSpec.info.version)
    },
  },
  data() {
    return {
      selectedSpec: undefined,
      onSpecPage: false,
      showShareModal: false,
      showModalAdd: false,
    }
  },
  //   computed: {
  //       specs() {
  //           return this.$store.state.openapi.specs
  //       }
  //   },
  methods: {
    createSpec() {
      this.showModalAdd = true
    },
    async commitSpec() {
      if (this.specid) {
        this.$nuxt.$loading.start()
        await this.$store.dispatch("integration/commitSpecGitlab", {
          specid: this.specid,
          version: this.selectedVersion,
        })
        this.$nuxt.$loading.finish()
      }
    },
    async changeVersion(version) {
      this.$nuxt.$loading.start()
      await this.$store.dispatch("openapi/fetchSpec", {
        specid: this.specid,
        version,
      })
      this.$nuxt.$loading.finish()
      this.$router.replace(`/design/${this.specid}/${version}`)
    },
    addNewVersion({ version, from }) {
      this.$store
        .dispatch("openapi/addVersion", {
          specid: this.selectedSpec["x-internal-id"],
          version,
          from: from || this.$route.params.apiversion,
        })
        .then(
          () =>
            this.$toast.success(this.$t("success"), {
              icon: "done",
            }),
          err => console.error(err)
        )
    },
    resetRequestResponse() {
      this.$store.dispatch("design/reset")
    },
    copyShareUrl() {
      this.$toast.success(this.$t("copied_to_clipboard"), {
        icon: "done",
      })
      this.$refs.sharespectext.select()
      document.execCommand("copy")
    },
    deleteSpec() {
      if (confirm("Are you sure?")) {
        this.$store.dispatch("openapi/deleteSpec", this.selectedSpec["x-internal-id"]).then(
          () => this.$router.replace("/design/"),
          err => console.error(err)
        )
      }
    },
    showShareModalWindow() {
      this.$nextTick(() => {
        this.showShareModal = true
      })
    },
    selectSpec() {
      if (this.selectedSpec)
        this.$router.push({
          path: `/design/${this.selectedSpec["x-internal-id"]}`,
        })
      else if (this.$route.path != "/design/") {
        this.$router.replace("/design/")
      }
    },
  },
}
</script>
