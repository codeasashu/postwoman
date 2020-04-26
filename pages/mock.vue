<template>
  <div class="page">
    <div class="content" v-if="onSpecPage && selectedSpec && mockRunning">
      <div>
        <nuxt-link to="/mock">
          <button class="bg-color">
            <i class="material-icons success-response">arrow_back</i>
          </button>
        </nuxt-link>
        <button @click="stopMock">Stop Mock</button>
        <button @click="restartMock">Restart Mock</button>
        <nuxt-link class="button" :to="designpagelink">
          {{ $t("design") }}
        </nuxt-link>
        <apiversion
          v-if="!mockInProgress"
          :addButton="false"
          :remButton="false"
          :setDefaultButton="false"
          :version="selectedMockVersion"
          @change-version="changeMockVersion"
        />
      </div>
    </div>
    <div class="content">
      <div class="page-columns inner-left">
        <pw-section v-if="!onSpecPage" class="orange" label="Select-spec">
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
        <pw-section class="blue" v-else-if="onSpecPage && selectedSpec && mockRunning">
          <nuxt-child :spec="selectedSpec" />
        </pw-section>
        <div class="page-mock" v-else-if="onSpecPage && selectedSpec && !mockRunning">
          <img src="~static/images/fork.png" :alt="$t('fork')" class="fork_banner" />
          <h2>
            Mock : &nbsp; <span>{{ selectedSpec.info.title }}</span>
          </h2>
          <div>
            <pre>
                Spec id (rev: {{ selectedMockVersion || $route.params.apiversion || selectedSpec.info.version }}) <br /> 
                <u>{{ selectedSpec['x-internal-id'] }}</u>
              </pre>
            <apiversion
              v-if="!mockInProgress"
              :addButton="false"
              :remButton="false"
              :setDefaultButton="false"
              :version="selectedMockVersion"
              @change-version="changeMockVersion"
            />
            <p>
              <button :disabled="mockInProgress" @click.prevent="startMock">
                {{ $t("start_mock") }}
              </button>
            </p>
            <p v-if="mockInProgress"><span>Please wait while mock is getting ready...</span></p>
            <nuxt-link class="button" v-if="!mockInProgress" to="/mock/">
              {{ $t("back") }}
            </nuxt-link>
          </div>
        </div>
      </div>
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
                :value="`${basepath}/browse/${selectedSpec['x-internal-id']}/${apiversion}`"
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
.page-mock {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}
.mock_banner {
  width: 256px;
}
.simple button {
  background-color: transparent;
  color: #fff;
}
</style>
<script>
import section from "../components/layout/section"
import apiversion from "../components/openapi/version"
export default {
  async asyncData({ params, store, $axios, $nuxt, error }) {
    // Use cached
    await store.dispatch("openapi/fetchSpecs")

    let onSpecPage = false
    let specs = store.state.openapi.specs
    let spec = undefined
    let mockRunning = false

    if (params.id) {
      onSpecPage = true
      spec = specs.filter(_spec => _spec["x-internal-id"] == params.id).pop()
      if (!spec) error("Spec not found", 404)
      if (
        !!params.apiversion &&
        params.apiversion != spec["info"]["version"] &&
        spec["info"]["x-versions"] &&
        spec["info"]["x-versions"].indexOf(params.apiversion) < 0
      )
        error("Version not found", 404)
      await store.dispatch("openapi/fetchSpec", {
        specid: spec["x-internal-id"],
        version: params.apiversion,
      })
      const mock = await store.dispatch("mock/getMockStatus", {
        specid: params.id,
        version: params.apiversion || spec.info.version,
      })
      mockRunning = mock && mock.running == true
    }
    return { selectedSpec: spec, onSpecPage, mockRunning }
  },
  watch: {
    "$route.path": async function(val) {
      this.mockRunning = await this.isMockRunning()
      this.selectedMockVersion = undefined
      this.onSpecPage = /\/mock\/(.{1,})+/g.test(val)

      if (this.$route.params.hasOwnProperty("id") && typeof this.$route.params.id !== "undefined") {
        this.selectedSpec = this.specs
          .filter(_spec => _spec["x-internal-id"] == this.$route.params.id)
          .pop()
        this.selectedMockVersion = this.apiversion
      } else {
        this.selectedSpec = undefined
      }
      this.resetRequestResponse()
    },
  },
  components: {
    "pw-section": section,
    "pw-modal": () => import("../components/ui/modal"),
    apiversion,
  },
  computed: {
    mocks() {
      return this.$store.state.mock.mocks
    },
    specs() {
      return this.$store.state.openapi.specs
    },
    basepath() {
      return window.location.protocol.concat("//") + window.location.host
    },
    docurl() {
      return `${this.$axios.defaults.baseURL}/docs/${this.selectedSpec["x-internal-id"]}/${this.apiversion}`
    },
    apiversion() {
      return this.$route.params.apiversion || this.selectedSpec.info.version
    },
    designpagelink() {
      return `/design/${this.selectedSpec["x-internal-id"]}/${this.apiversion}`
    },
  },
  data() {
    return {
      mockInProgress: false,
      selectedMockVersion: this.$route.params.apiversion,
      selectedSpec: undefined,
      onSpecPage: false,
      showShareModal: false,
    }
  },
  methods: {
    async startMock() {
      this.mockInProgress = true
      const version = this.$data.selectedMockVersion || this.$route.params.apiversion
      const specid = this.selectedSpec["x-internal-id"]
      await this.$store.dispatch("mock/restart", { specid, version })
      this.mockInProgress = false
      window.location.reload()
    },
    changeMockVersion(version) {
      this.selectedMockVersion = version || this.selectedSpec.info.version
      window.location.replace(
        `/mock/${this.selectedSpec["x-internal-id"]}/${this.selectedMockVersion}`
      )
    },
    resetRequestResponse() {
      this.$store.commit("resetRequest")
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
          () => this.$router.replace("/mock/"),
          err => console.error(err)
        )
      }
    },
    showShareModalWindow() {
      this.showShareModal = true
    },
    stopMock() {
      this.$store
        .dispatch("mock/stop", {
          specid: this.selectedSpec["x-internal-id"],
          version: this.selectedMockVersion,
        })
        .then(() => this.$router.replace("/mock/"))
    },
    restartMock() {
      this.$store
        .dispatch("mock/restart", {
          specid: this.selectedSpec["x-internal-id"],
          version: this.selectedMockVersion,
        })
        .then(() => window.location.reload())
    },
    async isMockRunning() {
      let mock = false
      if (this.selectedSpec) {
        mock = await this.$store.dispatch("mock/getMockStatus", {
          specid: this.selectedSpec["x-internal-id"],
          version: this.selectedSpec.info.version,
        })
      }
      return mock && mock.running == true
    },
    async selectSpec() {
      if (this.selectedSpec) {
        this.$router.push({ path: `/mock/${this.selectedSpec["x-internal-id"]}` })
      } else if (this.$route.path != "/mock/") {
        this.$router.replace("/mock/")
      }
    },
  },
}
</script>
