<template>
  <div class="page">
    <div class="content">
      <div v-if="onSpecPage">
        <nuxt-link class="button" to="/design">Back</nuxt-link>
      </div>
      <div v-if="onSpecPage">
        <button @click="deleteSpec">Delete spec</button>
        <button v-if="selectedSpec" @click="showShareModalWindow()">{{ $t("share") }}</button>
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
                :value="`${basepath}/browse/${selectedSpec['x-internal-id']}`"
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
export default {
  async asyncData({ params, store, $axios, $nuxt, error }) {
    let onSpecPage = false
    let specs = store.state.openapi.specs
    let spec = undefined
    if (params.hasOwnProperty("id")) {
      onSpecPage = true
      spec = specs.filter(_spec => _spec["x-internal-id"] == params.id).pop()
    }
    await store.dispatch("openapi/fetchSpecs")
    return { selectedSpec: spec, onSpecPage }
  },
  watch: {
    "$route.path": function(val) {
      this.onSpecPage = /\/design\/(.{1,})+/g.test(val)

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
    "pw-modal": () => import("../components/ui/modal"),
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
    basepath() {
      return window.location.protocol.concat("//") + window.location.host
    },
  },
  data() {
    return {
      selectedSpec: undefined,
      onSpecPage: false,
      showShareModal: false,
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
      this.showShareModal = true
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
